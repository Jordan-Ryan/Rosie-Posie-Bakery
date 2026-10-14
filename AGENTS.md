# AGENTS.md

Check `package.json`, `vite.config.ts`, the root HTML files, and `src/` before changing behavior. `README.md` is the setup page. `docs/STATE.md` records the wiring that is easy to mix up.

## Scope

This repository is a static Vite multi-page site. `package.json` devDependencies are `typescript` and `vite`. There is no application server, database, migration, or env file. The only `process.env` read in the project source is `NODE_ENV` in `vite.config.ts`, which selects the Vite `base` path.

`tsconfig.json` sets `"jsx": "react-jsx"` and `"include": ["src"]`. `src/` contains `.ts` files and `style.css`. `package.json` does not depend on React.

## Commands

The lockfile's Vite 5.4.20 engines field is `node: ^18.0.0 || >=20.0.0`. `package.json` does not set `engines`. `.github/workflows/deploy.yml` uses Node 20 and `npm ci`.

```bash
npm ci
npm run dev
npm run build
npm run preview
```

`npm run dev` is `vite`. `vite.config.ts` does not set `server.port`. The installed Vite 5.4.20 default dev port is 5173, and the server prints the URL it bound. `npm run preview` is `vite preview --port 5173`. `npm run build` writes `dist/`, which is gitignored.

`package.json` scripts are `dev`, `build`, and `preview`.

## Where to edit

- Menu, price, and terms copy: the matching root HTML file.
- Shared layout, colours, and wheel layout: `src/style.css`.
- Home footer year: `src/home.ts`, loaded by `index.html`.
- Footer year on Build-a-Cake, Sweet Selection, Sourdough, and Terms: `src/common.ts`.
- Giveaway wheel: `src/wheel.ts`, loaded by `wheel.html`.
- Pages included in the production build: `build.rollupOptions.input` in `vite.config.ts`.

The input key `main` points at `index.html`. The production chunk named `main-*.js` is that entry. Its source is `src/home.ts`.

`src/main.ts` is not an input in `vite.config.ts` and no HTML file references it. Wheel behavior to edit is `src/wheel.ts`.

## Wheel behavior to preserve unless the page changes

`wheel.html` contains `#entries`, `#spinBtn`, `#resetBtn`, `#error`, and `#history`. `src/wheel.ts` splits entries on commas, newlines, and carriage returns, trims them, and drops empty strings. Spin with fewer than two entries sets the error text and returns. A spin writes the parsed list to `localStorage` key `rpb.entries`. After the animation it prepends a Recent spins line, adds a confetti canvas, and inserts a winner popup with a Close button.

`function shuffleArray` in `src/wheel.ts` has no callers. `spin` keeps the entered order.

## Production base

`base` is `/Rosie-Posie-Bakery/` when `NODE_ENV === 'production'`, and `/` otherwise. The workflow's `npm run build` is a production Vite build, so asset URLs in `dist/` use that prefix. Keep new root-absolute asset URLs in a form Vite rewrites, or use relative URLs, so they keep working with that `base`.

## Docs

Update `README.md` and `docs/STATE.md` when scripts, HTML entries, wheel controls, or the deploy workflow change.
