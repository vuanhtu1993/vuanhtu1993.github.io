# Anhhtus Stories

This website is a personal blog and documentation site built using [Docusaurus 3](https://docusaurus.io/), a modern static website generator.

## Overview

- **Site Title:** Anhhtus stories
- **URL:** [https://vuanhtu1993.github.io](https://vuanhtu1993.github.io)
- **Primary Content:**
  - **Blog:** Technical articles and stories.
  - **Docs:** Personal finance documentation ("Tài chính cá nhân").

## Tech Stack

- **Framework:** [Docusaurus v3](https://docusaurus.io/)
- **UI Library:** [React](https://reactjs.org/)
- **Styling:** CSS, Styled Components
- **Deployment:** GitHub Pages

## Prerequisites

- **Node.js:** >= 20.0 (Check with `node -v`)
- **Package Manager:** npm (or yarn)

## Getting Started

### 1. Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/vuanhtu1993/vuanhtu1993.github.io.git
cd vuanhtu1993.github.io
npm install
```

### 2. Running Locally

Start the development server:

```bash
npm start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

- **URL:** [http://localhost:3000](http://localhost:3000)

### 3. Building for Production

Generate static content into the `build` directory:

```bash
npm run build
```

This content can be served using any static hosting service.

### 4. Serve the Build Locally

Test the production build locally:

```bash
npm run serve
```

## Deployment

The site is configured to deploy to GitHub Pages.

```bash
npm run deploy
```

**Note:** The deployment script uses the environment variable `GIT_USER=vuanhtu1993`. Ensure you have the necessary permissions to push to the repository.

## Project Structure

```text
/
├── blog/                   # Blog posts (Markdown/MDX)
├── docs/                   # Documentation files (Markdown/MDX)
├── src/
│   ├── components/         # Custom React components
│   ├── css/                # Global styles (custom.css)
│   └── pages/              # Application entry points (e.g., index.jsx)
├── static/                 # Static assets (images, etc.)
├── docusaurus.config.js    # Main site configuration
└── sidebars.js             # Sidebar navigation structure
```

## Contributing

1.  Create a new branch for your feature or content.
2.  Make changes (add blog posts to `blog/` or docs to `docs/`).
3.  Test locally using `npm start`.
4.  Submit a Pull Request.

## License

[MIT](https://choosealicense.com/licenses/mit/)
