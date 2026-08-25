---
title: "Passkeys and WebAuthn: The Complete Guide to Killing Passwords in Your Web App"
source_url: "https://dev.to/pockit_tools/passkeys-and-webauthn-the-complete-guide-to-killing-passwords-in-your-web-app-22f1"
crawled_at: "2026-08-07T09:30:52.298Z"
---

Your users are still typing passwords. In 2026. Despite every major platform — Apple, Google, Microsoft — shipping passkey support, most web applications are still stuck on the same authentication architecture from 2005: hash a password, store it in a database, pray nobody finds it.

The reason isn't that passkeys are hard to understand. It's that the implementation path is littered with undocumented pitfalls, confusing specifications, and a WebAuthn API that looks simple in demos but breaks in production. What does `allowCredentials` actually do? Why does `navigator.credentials.get()` silently fail on some browsers? How do you migrate 500,000 existing users without breaking their sessions?

This guide covers everything you need to ship passkeys in production — from the cryptographic fundamentals to complete TypeScript implementations, Conditional UI integration, database schema design, multi-device sync, and the phased migration strategy that lets you transition without forcing users to change their behavior overnight.

---

## [](#why-passwords-are-still-a-liability)Why Passwords Are Still a Liability

The numbers make the case. According to the 2025 Verizon DBIR report, over 80% of breaches involving web applications trace back to stolen or weak credentials. Phishing attacks succeed because passwords are a shared secret — the server knows the secret, the user knows the secret, and anyone who intercepts it in transit or at rest has full access.

### [](#what-passkeys-actually-solve)What Passkeys Actually Solve

Passkeys eliminate the shared secret entirely. Here's the fundamental difference:  

```
Password Authentication:
  User → sends password → Server compares hash
  Attack surface: phishing, credential stuffing, database breach

Passkey Authentication:
  User → signs challenge with private key → Server verifies with public key
  Attack surface: physical device theft (requires biometric)
```

 

The private key never leaves the user's device. The server only stores the public key. Even if your entire database leaks, attackers get nothing useful — public keys can't be used to authenticate.

### [](#the-three-properties-that-matter)The Three Properties That Matter

1.  **Phishing-resistant.** Passkeys are cryptographically bound to your domain (the "Relying Party ID"). A fake login page on `evil-example.com` physically cannot trigger a passkey created for `example.com`. The browser enforces this at the protocol level — no amount of social engineering bypasses it.
    
2.  **No shared secrets.** Your server never sees, stores, or transmits any secret material. There's nothing to hash, nothing to salt, nothing to leak. Credential stuffing attacks become irrelevant because there are no credentials to stuff.
    
3.  **Built-in multi-factor.** A passkey authentication combines "something you have" (the device) with "something you are" (biometric) or "something you know" (device PIN). You get MFA strength without asking users to install an authenticator app.
    

---

## [](#understanding-the-webauthn-flow)Understanding the WebAuthn Flow

The Web Authentication API (WebAuthn) defines two core ceremonies: **Registration** (creating a credential) and **Authentication** (using it to log in).

### [](#registration-flow)Registration Flow

```
┌──────────┐         ┌──────────┐         ┌──────────────┐
│  Browser │         │  Server  │         │ Authenticator │
└────┬─────┘         └────┬─────┘         └──────┬───────┘
     │  1. Begin Registration  │                  │
     │ ──────────────────────> │                  │
     │                        │                  │
     │  2. Challenge + Options │                  │
     │ <────────────────────── │                  │
     │                        │                  │
     │  3. Create Credential  │                  │
     │ ──────────────────────────────────────────>│
     │                        │                  │
     │  4. Biometric Prompt   │                  │
     │ <──────────────────────────────────────────│
     │                        │                  │
     │  5. Public Key + Attestation              │
     │ ──────────────────────>│                  │
     │                        │                  │
     │  6. Verify & Store     │                  │
     │ <────────────────────── │                  │
```

 

### [](#authentication-flow)Authentication Flow

```
┌──────────┐         ┌──────────┐         ┌──────────────┐
│  Browser │         │  Server  │         │ Authenticator │
└────┬─────┘         └────┬─────┘         └──────┬───────┘
     │  1. Begin Login     │                      │
     │ ──────────────────> │                      │
     │                     │                      │
     │  2. Challenge       │                      │
     │ <────────────────── │                      │
     │                     │                      │
     │  3. Sign Challenge  │                      │
     │ ──────────────────────────────────────────>│
     │                     │                      │
     │  4. Biometric Prompt│                      │
     │ <──────────────────────────────────────────│
     │                     │                      │
     │  5. Signed Assertion│                      │
     │ ──────────────────> │                      │
     │                     │                      │
     │  6. Verify Signature│                      │
     │ <────────────────── │                      │
```

 

The crucial detail: in step 5, the authenticator signs the server's challenge with the private key. The server then verifies that signature against the stored public key. No secret is transmitted — only a proof that the user possesses the private key.

---

## [](#full-implementation-with-simplewebauthn)Full Implementation with SimpleWebAuthn

Rolling your own WebAuthn implementation from scratch is a recipe for subtle security bugs. The CBOR parsing, attestation verification, and challenge management are complex enough that battle-tested libraries are the only sane path. SimpleWebAuthn is the most widely adopted TypeScript library for this.

### [](#project-setup)Project Setup

```
# Server-side
npm install @simplewebauthn/server

# Client-side
npm install @simplewebauthn/browser
```

 

### [](#database-schema)Database Schema

Before writing any auth code, design the storage layer. You need two tables:  

```
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(255) UNIQUE NOT NULL,
  display_name VARCHAR(255),
  -- Legacy password fields (keep during migration)
  password_hash VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Passkey credentials table (one user can have multiple passkeys)
CREATE TABLE passkey_credentials (
  id VARCHAR(512) PRIMARY KEY,             -- credential ID (base64url)
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  public_key BYTEA NOT NULL,               -- stored as raw bytes
  counter BIGINT NOT NULL DEFAULT 0,       -- signature counter
  device_type VARCHAR(50) NOT NULL,        -- 'singleDevice' or 'multiDevice'
  backed_up BOOLEAN NOT NULL DEFAULT false, -- synced to cloud?
  transports TEXT[],                       -- ['internal', 'hybrid', etc.]
  display_name VARCHAR(255),               -- "MacBook Pro Touch ID"
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ
);

CREATE INDEX idx_credentials_user_id ON passkey_credentials(user_id);
```

 

Key design decisions:

-   **One-to-many relationship.** A user can register multiple passkeys (phone, laptop, security key). Never limit to one.
-   **`counter` field.** Authenticators increment a signature counter with each use. If a signature arrives with a counter lower than stored, it indicates a cloned credential — reject and flag it immediately.
-   **`device_type` and `backed_up`.** These tell you whether the passkey is synced across devices (iCloud Keychain, Google Password Manager) or bound to a single device (hardware security key).
-   **`transports` array.** Stores how the authenticator communicates (`'internal'` for platform biometric, `'hybrid'` for cross-device via QR code, `'usb'` for security keys). This speeds up subsequent authentications by hinting to the browser which transport to try first.

### [](#server-registration-endpoint)Server: Registration Endpoint

```
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  type VerifiedRegistrationResponse,
} from '@simplewebauthn/server';

const RP_NAME = 'My App';
const RP_ID = 'example.com';
const ORIGIN = 'https://example.com';

// Step 1: Generate options
app.post('/api/auth/register/begin', async (req, res) => {
  const user = await getUserFromSession(req);

  // Fetch existing credentials to exclude them
  const existingCredentials = await db.query(
    'SELECT id, transports FROM passkey_credentials WHERE user_id = $1',
    [user.id]
  );

  const options = await generateRegistrationOptions({
    rpName: RP_NAME,
    rpID: RP_ID,
    userName: user.username,
    userDisplayName: user.display_name || user.username,
    // Prevent re-registering the same authenticator
    excludeCredentials: existingCredentials.rows.map(cred => ({
      id: cred.id,
      transports: cred.transports,
    })),
    authenticatorSelection: {
      residentKey: 'required',      // CRITICAL: makes it a passkey
      userVerification: 'preferred', // Biometric when available
    },
    attestationType: 'none',  // Skip attestation for consumer apps
  });

  // Store challenge in session for verification
  await setSessionChallenge(req, options.challenge);

  res.json(options);
});

// Step 2: Verify response
app.post('/api/auth/register/complete', async (req, res) => {
  const user = await getUserFromSession(req);
  const expectedChallenge = await getSessionChallenge(req);

  try {
    const verification: VerifiedRegistrationResponse = 
      await verifyRegistrationResponse({
        response: req.body,
        expectedChallenge,
        expectedOrigin: ORIGIN,
        expectedRPID: RP_ID,
      });

    if (!verification.verified || !verification.registrationInfo) {
      return res.status(400).json({ error: 'Verification failed' });
    }

    const { credential, credentialDeviceType, credentialBackedUp } = 
      verification.registrationInfo;

    // Save to database
    await db.query(
      `INSERT INTO passkey_credentials 
       (id, user_id, public_key, counter, device_type, backed_up, transports)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        credential.id,
        user.id,
        Buffer.from(credential.publicKey),
        credential.counter,
        credentialDeviceType,
        credentialBackedUp,
        credential.transports ?? [],
      ]
    );

    res.json({ verified: true });
  } catch (error) {
    console.error('Registration verification failed:', error);
    res.status(400).json({ error: 'Registration failed' });
  }
});
```

 

### [](#server-authentication-endpoint)Server: Authentication Endpoint

```
import {
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server';

// Step 1: Generate challenge
app.post('/api/auth/login/begin', async (req, res) => {
  const options = await generateAuthenticationOptions({
    rpID: RP_ID,
    userVerification: 'preferred',
    // Empty allowCredentials = discoverable credential flow
    // The authenticator will show all credentials for this RP
    allowCredentials: [],
  });

  // Store challenge — use a short-lived store (Redis, signed cookie)
  await setChallengeStore(options.challenge, { expiresIn: 300 }); // 5 min

  res.json(options);
});

// Step 2: Verify assertion
app.post('/api/auth/login/complete', async (req, res) => {
  const { id: credentialId } = req.body;

  // Look up the credential
  const credRow = await db.query(
    `SELECT pc.*, u.id as uid, u.username 
     FROM passkey_credentials pc 
     JOIN users u ON pc.user_id = u.id 
     WHERE pc.id = $1`,
    [credentialId]
  );

  if (credRow.rows.length === 0) {
    return res.status(401).json({ error: 'Unknown credential' });
  }

  const cred = credRow.rows[0];
  const expectedChallenge = await getChallengeStore(req.body.response.clientDataJSON);

  try {
    const verification = await verifyAuthenticationResponse({
      response: req.body,
      expectedChallenge,
      expectedOrigin: ORIGIN,
      expectedRPID: RP_ID,
      credential: {
        id: cred.id,
        publicKey: new Uint8Array(cred.public_key),
        counter: Number(cred.counter),
        transports: cred.transports,
      },
    });

    if (!verification.verified) {
      return res.status(401).json({ error: 'Verification failed' });
    }

    // CRITICAL: Update the counter to detect cloned credentials
    const { newCounter } = verification.authenticationInfo;
    await db.query(
      `UPDATE passkey_credentials 
       SET counter = $1, last_used_at = NOW() 
       WHERE id = $2`,
      [newCounter, credentialId]
    );

    // Issue session / JWT
    const token = await createSession(cred.uid);
    res.json({ verified: true, token });
  } catch (error) {
    console.error('Authentication failed:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
});
```

 

### [](#client-browser-integration)Client: Browser Integration

```
import { 
  startRegistration, 
  startAuthentication 
} from '@simplewebauthn/browser';

// Registration
async function registerPasskey(): Promise<void> {
  // 1. Get options from server
  const optionsRes = await fetch('/api/auth/register/begin', { 
    method: 'POST' 
  });
  const options = await optionsRes.json();

  // 2. Create credential (triggers biometric prompt)
  const credential = await startRegistration({ optionsJSON: options });

  // 3. Send to server for verification
  const verifyRes = await fetch('/api/auth/register/complete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credential),
  });

  const result = await verifyRes.json();
  if (result.verified) {
    console.log('Passkey registered successfully');
  }
}

// Authentication
async function loginWithPasskey(): Promise<void> {
  const optionsRes = await fetch('/api/auth/login/begin', { 
    method: 'POST' 
  });
  const options = await optionsRes.json();

  const assertion = await startAuthentication({ optionsJSON: options });

  const verifyRes = await fetch('/api/auth/login/complete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(assertion),
  });

  const result = await verifyRes.json();
  if (result.verified) {
    window.location.href = '/dashboard';
  }
}
```

 

---

## [](#conditional-ui-passkeys-in-the-autofill-menu)Conditional UI: Passkeys in the Autofill Menu

The biggest UX improvement for passkeys isn't the registration flow — it's Conditional UI. Instead of requiring users to click a "Sign in with passkey" button, the browser shows available passkeys directly in the username field's autofill dropdown, right next to saved passwords.

### [](#how-it-works)How It Works

```
<!-- The magic is in the autocomplete attribute -->
<form>
  <input 
    type="text" 
    id="username"
    name="username"
    autocomplete="username webauthn"
    placeholder="Email or username"
  />
  <input type="password" name="password" autocomplete="current-password" />
  <button type="submit">Sign In</button>
</form>
```

 

The `webauthn` token in the `autocomplete` attribute tells the browser to include passkey options in the autofill dropdown. It must be the **last** token in the attribute value.

### [](#implementation)Implementation

```
import { startAuthentication, browserSupportsWebAuthnAutofill } from '@simplewebauthn/browser';

async function initConditionalUI(): Promise<void> {
  // Feature detection — always check first
  const supported = await browserSupportsWebAuthnAutofill();
  if (!supported) {
    console.log('Conditional UI not supported, falling back to button');
    return;
  }

  // Get authentication options from server
  const optionsRes = await fetch('/api/auth/login/begin', { method: 'POST' });
  const options = await optionsRes.json();

  try {
    // This call will "wait" until the user selects a passkey from autofill
    const assertion = await startAuthentication({
      optionsJSON: options,
      useBrowserAutofill: true,  // Enables Conditional UI
    });

    // User selected a passkey from the dropdown — verify it
    const verifyRes = await fetch('/api/auth/login/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(assertion),
    });

    const result = await verifyRes.json();
    if (result.verified) {
      window.location.href = '/dashboard';
    }
  } catch (error) {
    // User dismissed the autofill or chose a password instead
    if ((error as Error).name !== 'AbortError') {
      console.error('Conditional UI error:', error);
    }
  }
}

// Call on page load — NOT on button click
document.addEventListener('DOMContentLoaded', initConditionalUI);
```

 

### [](#critical-implementation-details)Critical Implementation Details

**1\. Call on page load, not on click.** Conditional UI must be initiated when the page loads. The browser continuously listens for the user to interact with the autofill dropdown. If you only call it on button click, you lose the seamless autofill experience.

**2\. Use an AbortController.** If the user switches to a different login method (social login, magic link), abort the pending conditional UI request:  

```
const abortController = new AbortController();

async function initConditionalUI(): Promise<void> {
  // ... feature detection ...

  const assertion = await startAuthentication({
    optionsJSON: options,
    useBrowserAutofill: true,
  });
  // ... verify ...
}

// When user clicks "Sign in with Google" or similar
function switchToAlternativeLogin(): void {
  abortController.abort();
  // Proceed with alternative login flow
}
```

 

**3\. Fallback strategy.** Always provide a visible "Sign in with passkey" button for browsers that don't support Conditional UI. The button uses the standard modal flow as a fallback.

---

## [](#phased-migration-strategy)Phased Migration Strategy

You can't flip a switch and delete all passwords overnight. Here's the three-phase approach that works in production:

### [](#phase-1-introduction-passive-enrollment)Phase 1: Introduction (Passive Enrollment)

After successful password login, prompt users to register a passkey. Don't force it — just make the option visible and attractive.  

```
// After successful password login
async function postLoginPasskeyPrompt(user: User): Promise<void> {
  const hasPasskey = await userHasPasskey(user.id);
  if (hasPasskey) return;

  const dismissedCount = await getPromptDismissals(user.id);
  if (dismissedCount >= 3) return; // Don't be annoying

  // Show a non-blocking UI prompt
  showPasskeyEnrollmentBanner({
    title: 'Enable faster sign-in',
    description: 'Use Face ID or fingerprint instead of your password',
    onAccept: () => registerPasskey(),
    onDismiss: () => incrementPromptDismissals(user.id),
  });
}
```

 

### [](#phase-2-default-new-users-start-passwordless)Phase 2: Default (New Users Start Passwordless)

New user registration defaults to passkey. Password is available but secondary.  

```
async function registerNewUser(userData: NewUser): Promise<void> {
  const user = await createUser(userData);

  // Try passkey first
  const webauthnSupported = await isWebAuthnSupported();

  if (webauthnSupported) {
    await registerPasskey(); // Primary — passkey
    // Optionally still collect a password as backup
  } else {
    await setPassword(user.id, userData.password); // Fallback
  }
}
```

 

### [](#phase-3-transition-passwordlessonly-option)Phase 3: Transition (Passwordless-Only Option)

Users with passkeys registered can opt to disable their password entirely.  

```
app.post('/api/auth/disable-password', async (req, res) => {
  const user = await getUserFromSession(req);

  // Safety checks before allowing password deletion
  const credentials = await getUserCredentials(user.id);

  if (credentials.length < 2) {
    return res.status(400).json({ 
      error: 'Register at least 2 passkeys before disabling password' 
    });
  }

  // Check that at least one credential is backed up (synced)
  const hasSyncedPasskey = credentials.some(c => c.backed_up);
  if (!hasSyncedPasskey) {
    return res.status(400).json({
      error: 'Register at least one synced passkey (iCloud/Google) for recovery'
    });
  }

  // Soft-delete the password
  await db.query(
    'UPDATE users SET password_hash = NULL WHERE id = $1',
    [user.id]
  );

  res.json({ success: true });
});
```

 

### [](#migration-metrics-dashboard)Migration Metrics Dashboard

Track these metrics to measure migration health:

| Metric | Target | What It Tells You |
| --- | --- | --- |
| **Passkey adoption rate** | \>30% within 6 months | Overall migration velocity |
| **Registration completion** | \>80% who start | UX friction during enrollment |
| **Auth success rate** | \>99% | Reliability of passkey flow |
| **Fallback usage** | Declining trend | Users successfully moving off passwords |
| **Prompt dismiss rate** | <60% | Whether enrollment prompts are too aggressive |

---

## [](#security-pitfalls-in-production)Security Pitfalls in Production

### [](#1-challenge-replay-attacks)1\. Challenge Replay Attacks

Every challenge must be single-use and time-limited. If you store challenges in a stateless JWT, an attacker can replay the same challenge.  

```
// BAD: Challenge in a signed cookie (replayable)
const challenge = signJWT({ challenge: randomBytes(32) });

// GOOD: Challenge in server-side store with TTL
const challenge = randomBytes(32).toString('base64url');
await redis.setex(`webauthn:challenge:${sessionId}`, 300, challenge);

// After verification, immediately delete
await redis.del(`webauthn:challenge:${sessionId}`);
```

 

### [](#2-counter-validation)2\. Counter Validation

The signature counter is your defense against credential cloning. If an authenticator's counter goes backwards, something is very wrong.  

```
async function validateCounter(
  credentialId: string, 
  newCounter: number
): Promise<void> {
  const stored = await getStoredCounter(credentialId);

  if (newCounter > 0 && newCounter <= stored) {
    // POTENTIAL CLONED CREDENTIAL
    await flagCredentialAsCompromised(credentialId);
    await notifySecurityTeam({
      event: 'counter_regression',
      credentialId,
      storedCounter: stored,
      receivedCounter: newCounter,
    });
    throw new Error('Credential counter regression detected');
  }
}
```

 

**Caveat:** Some platform authenticators (especially synced passkeys) always report a counter of `0`. In this case, counter validation is effectively disabled — the sync mechanism provides security through other means. Only flag regressions when the counter is actually being used (i.e., when it's greater than 0).

### [](#3-origin-validation)3\. Origin Validation

Always validate the origin strictly. A misconfigured origin check can defeat the phishing resistance that makes passkeys valuable.  

```
// BAD: Substring match (vulnerable to subdomain attacks)
if (origin.includes('example.com')) { ... }

// GOOD: Exact match against allowed origins
const ALLOWED_ORIGINS = [
  'https://example.com',
  'https://app.example.com',
];

if (!ALLOWED_ORIGINS.includes(origin)) {
  throw new Error('Origin not allowed');
}
```

 

### [](#4-account-recovery)4\. Account Recovery

The hardest problem in passwordless authentication. What happens when a user loses all their devices?  

```
interface RecoveryStrategy {
  // Recommended: Require multiple passkeys
  minimumPasskeys: 2;

  // Recommend at least one synced passkey
  requireSyncedCredential: true;

  // Backup methods (in order of preference)
  fallbacks: [
    'recovery_codes',       // One-time codes generated at enrollment
    'email_magic_link',     // Time-limited login link
    'identity_verification' // Manual process with ID verification
  ];
}
```

 

Generate recovery codes during initial passkey registration and instruct users to store them securely. This is the same pattern security keys have used for years — it works.

---

## [](#crossplatform-considerations)Cross-Platform Considerations

### [](#device-sync-behavior)Device Sync Behavior

| Platform | Sync Mechanism | Scope |
| --- | --- | --- |
| **Apple** | iCloud Keychain | All Apple devices with same Apple ID |
| **Google** | Google Password Manager | All Chrome/Android with same Google account |
| **Microsoft** | Microsoft Authenticator | Windows devices with same Microsoft account |
| **1Password / Bitwarden** | Third-party vault | Cross-platform, all devices with vault access |

### [](#the-crossdevice-flow-hybrid-transport)The Cross-Device Flow (Hybrid Transport)

When a user wants to log in on a device that doesn't have their passkey, the "hybrid" transport kicks in:

1.  Desktop browser shows a QR code
2.  User scans with their phone (which has the passkey)
3.  Phone prompts for biometric
4.  Authentication completes on the desktop

This works automatically — you don't need to implement anything special. The browser and authenticator handle the entire flow when `transports` includes `'hybrid'`.

---

## [](#performance-and-cost-model)Performance and Cost Model

Passkey authentication is significantly cheaper at scale than password authentication:

| Factor | Passwords | Passkeys |
| --- | --- | --- |
| **Server compute** | bcrypt/Argon2 hashing (CPU intensive) | Ed25519 signature verification (fast) |
| **Storage per user** | ~128 bytes (hash + salt) | ~256 bytes (public key + metadata) |
| **Support tickets** | "I forgot my password" (~40% of support volume) | Near zero after enrollment |
| **Breach cost** | Average $4.44M per incident | No usable credentials to steal |
| **SMS 2FA cost** | $0.01-0.05 per message | $0 (built-in verification) |

For a service with 100,000 users, eliminating password reset flows alone can save 15-20 hours of support time per month.

---

## [](#the-reality-in-2026)The Reality in 2026

Passkeys aren't a future technology — they're a present one. Every major browser supports them. Every major platform syncs them. The WebAuthn spec is stable. Libraries like SimpleWebAuthn handle the dangerous cryptographic details.

The actual blockers are organizational, not technical. Teams hesitate because "our users are used to passwords" or "we can't break the existing login flow." The phased migration strategy solves this. You don't need to deprecate passwords on day one. You just need to start offering something better alongside them.

The teams shipping passkeys today are seeing 50-70% voluntary adoption rates within six months when the enrollment UX is smooth. Users genuinely prefer touching their fingerprint to typing a password. The conversion friction is lower, the support load drops, and the security posture improves dramatically.

Start with Conditional UI. It requires minimal UI changes — just an `autocomplete` attribute and a page-load script. Users who have passkeys get the fast path automatically. Users who don't see the same login form they've always seen. Zero disruption, maximum upside.

The password is a 60-year-old technology. It's time to let it retire.

---

> 🚀 **Explore More:** This article is from the [Pockit Blog](https://pockit.tools/blog/passkeys-webauthn-passwordless-authentication-complete-guide/).
> 
> If you found this helpful, check out [Pockit.tools](https://pockit.tools/json-formatter/). It’s a curated collection of offline-capable dev utilities. **[Available on Chrome Web Store](https://chromewebstore.google.com/detail/pockit-developer-tools-pd/lojcamfhllebjmcjmipecgecbeopookg)** for free.
