# Rosie Posie Bakery

Static multi-page site for Rosie Posie Bakery in Maidenhead. Tooling is Vite and TypeScript. Page copy, prices, and terms live in the HTML files at the repo root. Shared styles are in `src/style.css`.

## Setup

`package.json` does not set an `engines` field. The locked Vite 5.4.20 package declares Node `^18.0.0 || >=20.0.0`. The GitHub Actions workflow installs Node 20.

Install from the lockfile, which is the same install command the workflow runs:

```bash
npm ci
```

## Scripts

`package.json` defines three scripts:

| Script | Command |
| --- | --- |
| `npm run dev` | `vite` |
| `npm run build` | `vite build` |
| `npm run preview` | `vite preview --port 5173` |

`vite.config.ts` does not set `server.port`. In the installed Vite 5.4.20, the default dev port is 5173. Open the URL the dev server prints. If 5173 is already in use, Vite prints the port it picked.

`npm run build` writes `dist/`. `npm run preview` serves that directory and passes `--port 5173`. Open the URL it prints. Vite tries the next free port when the requested one is taken, because this config leaves `strictPort` unset.

## Pages

| Page | File | Script |
| --- | --- | --- |
| Home | `index.html` | `src/home.ts` |
| Build-a-Cake | `build-a-cake.html` | `src/common.ts` |
| Sweet Selection | `sweet-selection.html` | `src/common.ts` |
| Sourdough | `sourdough.html` | `src/common.ts` |
| Terms | `terms.html` | `src/common.ts` |
| Giveaway Wheel | `wheel.html` | `src/wheel.ts` |

`src/home.ts` and `src/common.ts` set the footer `#year` element to the current calendar year. Links between these pages are relative (`./index.html`, `./build-a-cake.html`, and the other page files).

Vite's production input map is in `vite.config.ts` under `build.rollupOptions.input`. The entry key `main` is `index.html`.

## Giveaway wheel

`wheel.html` loads `src/wheel.ts`.

1. Type names or prizes separated by commas or newlines.
2. Spin requires at least two entries. With fewer, the page shows `Please enter at least two entries (comma or newline separated).`
3. Spin runs the canvas animation, then adds a winner popup, a confetti overlay, and a line under Recent spins. The popup has a Close button.
4. Reset redraws the wheel at rotation 0 from the text currently in the box. It leaves that text in place.

A spin stores the parsed list in `localStorage` under `rpb.entries`. Recent spins are only in the page until it reloads.

The form has an entries box, Spin, and Reset. `wheel.html` does not include a shuffle control or a no-repeat control.

## Production base path

`vite.config.ts` sets Vite `base` to `/Rosie-Posie-Bakery/` when `NODE_ENV` is `production`, and to `/` otherwise. A production build prefixes `/logo.png`, the stylesheet, and the module script URLs with `/Rosie-Posie-Bakery/`. Navigation links stay relative.

## Deploy workflow

`.github/workflows/deploy.yml` runs on push to `main`. The build job checks out the repo, sets up Node 20 with the npm cache, runs `npm ci`, runs `npm run build`, and uploads `./dist` with `actions/upload-pages-artifact@v3`. The deploy job publishes that artifact with `actions/deploy-pages@v4` to the `github-pages` environment.

## Assets

Pages request `/logo.png` (`public/logo.png`). `.brand .logo` in `src/style.css` displays it at 48×48 pixels. Each logo image has an `onerror` handler that hides the image if it fails to load.

`public/logo.svg` is in the repository. No HTML file references it.

Each page loads Fredoka and Lilita One from Google Fonts. `src/style.css` uses Fredoka for body text and Lilita One for headings, with `system-ui`, Segoe UI, and Arial as fallbacks.

Every page footer links to `https://www.instagram.com/rosieposiebakery`, `https://www.amazon.co.uk/hz/wishlist/ls/24S11ILUTTB6F`, and `mailto:rosieposiebakery@gmail.com`.

Wiring notes that are easy to misread are in `AGENTS.md` and `docs/STATE.md`.
