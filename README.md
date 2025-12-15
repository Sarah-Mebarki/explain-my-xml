# Explain My XML (and DITA)

A tiny, friendly web app that explains XML/DITA structure in plain English.

- Paste XML/DITA in the editor
- See a navigable element tree
- Get human-readable explanations per element
- Catch common issues (unclosed tags, parser errors)
- No backend required

## Quick start

### Prereqs
- Node.js 18+ (or 20+)
- npm

### Run locally
```bash
npm install
npm run dev
```

Open the local URL Vite prints (usually `http://localhost:5173`).

### Build
```bash
npm run build
npm run preview
```

## How it works

- Uses the browser's `DOMParser` to parse XML safely on the client.
- Traverses the resulting DOM and renders a tree.
- Looks up element explanations in `src/rules/elementRules.json`.
- Includes a small heuristics layer for DITA-ish hints and “gotchas”.

## Customize explanations

Edit:
- `src/rules/elementRules.json`

You can add any tag name (lowercase recommended). Example:

```json
{
  "xref": {
    "summary": "A cross-reference (link) to another topic or location.",
    "tips": ["Prefer meaningful link text for accessibility."]
  }
}
```

## Repo structure

- `src/` app code
- `src/rules/elementRules.json` tag explanations
- `src/lib/` parser + tree utilities

## License

MIT

## CI + Deploy

### CI (lint + build)
This repo includes a GitHub Actions workflow that runs on every push/PR to `main`:
- `npm ci`
- `npm run lint`
- `npm run build`

See: `.github/workflows/ci.yml`

### Deploy to GitHub Pages
This repo includes a GitHub Pages workflow: `.github/workflows/pages.yml`

1. Push to a GitHub repo named **`explain-my-xml`** (recommended, since the workflow builds with `--base=/explain-my-xml/`).
2. In GitHub: **Settings → Pages**
   - Source: **GitHub Actions**
3. Push to `main` → it deploys automatically.

If your repo name is different, update this line in `.github/workflows/pages.yml`:
```bash
npm run build -- --base=/YOUR_REPO_NAME/
```

### Deploy to Vercel
A minimal `vercel.json` is included. Typical flow:
1. Import the repo in Vercel
2. Framework: Vite
3. Build command: `npm run build`
4. Output dir: `dist`

Vercel should autodetect this project fine.
