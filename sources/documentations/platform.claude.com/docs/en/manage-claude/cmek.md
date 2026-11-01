---
title: "Customer-managed encryption keys"
source_url: "https://platform.claude.com/docs/en/manage-claude/cmek"
crawled_at: "2026-11-01T16:28:32.640Z"
---

[Admin](https://platform.claude.com/docs/en/manage-claude/admin-api)Encryption keys (CMEK)

Use a key you hold in your own cloud to encrypt data that Claude stores.

Claude Code

Ask Claude Code about this feature

`/claude-api tell me about customer-managed encryption keys`

With customer-managed encryption keys (CMEK), you create a key in your own AWS KMS, Google Cloud KMS, or Azure Key Vault. Anthropic uses it to encrypt certain data at rest. The key stays under your control, so you can rotate it, audit its use, and remove Anthropic’s access.

## Choose your setup page

Choose the service that holds your key. Claude Platform on AWS, which also uses AWS KMS, has its own page.

For Claude Platform and Claude Enterprise.

For Claude Platform and Claude Enterprise.

For Claude Platform and Claude Enterprise.

For organizations whose Claude Console sidebar shows **Account managed by AWS**.

On Claude Platform, you can also add and attach your key [with the Admin API](https://platform.claude.com/docs/en/manage-claude/cmek-admin-api).

## Understand CMEK before you set it up

Which product you use decides what your key encrypts, what stays under Anthropic’s key, and which features turn off or change.

How your key protects data, when it takes effect, and what you can see.

Using a key with zero data retention (ZDR), and what Anthropic can preserve outside your key.

Look up a feature or a kind of data.

Look up a feature, and see what your users will notice.

## What you commit to

-   Once you attach a key, you [can’t remove or replace it](https://platform.claude.com/docs/en/manage-claude/cmek-key-lifecycle#what-each-action-does).
-   Your key protects only data written [after it takes effect](https://platform.claude.com/docs/en/manage-claude/cmek-how-it-works#when-your-key-takes-effect).
-   If your key is deleted, Anthropic can’t recover the data it protects. [While the key is disabled](https://platform.claude.com/docs/en/manage-claude/cmek-key-lifecycle#restore-access), Claude can’t read that data.
-   On Claude Platform, a workspace with a key [must retain data](https://platform.claude.com/docs/en/manage-claude/cmek-data-retention#data-retention).

## Who can use CMEK

CMEK is optional. To turn it on for an eligible organization, contact your Anthropic account team. You need one of these roles to set it up:

-   Claude Platform: Organization Admin
-   Claude Platform on AWS: Admin
-   Claude Enterprise: Owner or Primary Owner

## After setup

-   [What happens when you rotate, disable, or delete your encryption key](https://platform.claude.com/docs/en/manage-claude/cmek-key-lifecycle)
-   [Troubleshoot CMEK](https://platform.claude.com/docs/en/manage-claude/cmek-troubleshooting)
