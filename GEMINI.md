# Project Context: vuanhtu1993.github.io

## Overview
This project is a personal documentation and blog website built using [Docusaurus 3](https://docusaurus.io/). It serves as a platform for sharing stories, technical articles (Blog), and personal finance documentation (Docs).

**Key Technologies:**
- **Framework:** Docusaurus v3.7.0
- **UI Library:** React v18
- **Styling:** CSS (Custom), Styled Components
- **Content:** Markdown (MD), MDX
- **Deployment:** GitHub Pages

## Directory Structure
- `blog/`: Contains blog posts. Organized by folders or direct markdown files.
- `docs/`: Contains documentation files (e.g., "Tài chính cá nhân").
- `src/`: Source code for custom pages and components.
    - `components/`: Reusable React components.
    - `css/`: Custom global styles (`custom.css`).
    - `pages/`: Application entry points (e.g., `index.jsx`).
- `static/`: Static assets like images (`img/`) and `.nojekyll`.
- `docusaurus.config.js`: Main configuration file for the site.
- `sidebars.js`: Sidebar navigation configuration for documentation.

## Development Workflow

### Prerequisites
- Node.js (>=20.0 as per `engines` in `package.json`)
- npm or yarn

### Key Commands
Run these commands using `npm run <script>` or `yarn <script>`.

| Command | Description |
| :--- | :--- |
| `start` | Starts the local development server (usually at http://localhost:3000). |
| `build` | Builds the static site for production into the `build/` directory. |
| `serve` | Serves the built static site locally for preview. |
| `deploy` | Deploys the site to GitHub Pages (`GIT_USER=vuanhtu1993`). |
| `swizzle`| Ejects a theme component for customization. |

## Configuration
- **Site Config:** `docusaurus.config.js` controls site metadata, navbar, footer, and plugin options.
- **Sidebar:** `sidebars.js` defines the structure of the documentation sidebar.
- **Theme:** Uses `@docusaurus/preset-classic` and `@docusaurus/theme-mermaid`.

## Content Management
- **Blog:** Add new posts to `blog/`. Supports YAML frontmatter for metadata (date, authors, tags).
- **Docs:** Add new docs to `docs/`. Structure is defined in `sidebars.js`.
