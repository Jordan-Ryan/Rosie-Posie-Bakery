# State

This file describes the repository files it names. It was checked against those files, `package.json`, `package-lock.json` (Vite 5.4.20 engines), `vite.config.ts`, `tsconfig.json`, and `.github/workflows/deploy.yml`.

## Pages and scripts

| HTML | Script tag | What the script does |
| --- | --- | --- |
| `index.html` | `/src/home.ts` | Sets `#year` to the current calendar year. |
| `build-a-cake.html` | `/src/common.ts` | Sets `#year` to the current calendar year. |
| `sweet-selection.html` | `/src/common.ts` | Sets `#year` to the current calendar year. |
| `sourdough.html` | `/src/common.ts` | Sets `#year` to the current calendar year. |
| `terms.html` | `/src/common.ts` | Sets `#year` to the current calendar year. |
| `wheel.html` | `/src/wheel.ts` | Sets `#year`, then runs the giveaway wheel. |

`src/home.ts` and `src/common.ts` contain the same year logic.

`vite.config.ts` registers these HTML files as Rollup inputs: `main` → `index.html`, `buildACake` → `build-a-cake.html`, `sweetSelection` → `sweet-selection.html`, `sourdough` → `sourdough.html`, `terms` → `terms.html`, `wheel` → `wheel.html`.

The input name `main` is `index.html`. A production build emits a `main-*.js` chunk for that input. That chunk is compiled from `src/home.ts`.

## `src/main.ts`

`src/main.ts` is not referenced by any HTML `script` tag and is not a key in `build.rollupOptions.input`. A production build of this tree does not emit it.

The file still contains a wheel implementation that reads `#shuffle` and `#noRepeat`. `wheel.html` does not have those elements. The page that is wired up is `wheel.html` plus `src/wheel.ts`.

## Giveaway wheel (`src/wheel.ts`)

- Parses `#entries` on commas, `\n`, and `\r`.
- Requires at least two entries. The error string is `Please enter at least two entries (comma or newline separated).`
- `shuffleArray` is defined and has no call sites. `spin` does not reorder entries.
- On spin, writes `JSON.stringify` of the parsed list to `localStorage` key `rpb.entries`. On load, if that key holds a JSON array, it fills the textarea with the items joined by `", "`.
- Animation duration is 4200 ms. The winner is derived from the final rotation and the pointer at the top of the wheel.
- Then it prepends `${time}: ${winner}` to `#history`, runs a confetti canvas, and inserts a popup with the winner and a Close button.
- `#history` is not written to `localStorage`.
- Reset sets the rotation to 0 and redraws from the current textarea. It does not clear the textarea or `localStorage`.
- Spin and reset failures are logged with `console.error`. A spin failure also sets `Unexpected error while spinning.`

## Styles and assets

`src/style.css` defines the pink, brown, and cream variables, a heart-tile background, white cards with pink borders, Fredoka body text, and Lilita One headings. `.brand .logo` is 48×48 pixels.

`public/logo.png` is the file the pages request. The `file` command reports that file as JPEG/JFIF data. `public/logo.svg` is a separate SVG in `public/`. No HTML `src` or `href` points at `logo.svg`.

`public/` is copied into `dist/` by `vite build`.

## TypeScript config

`tsconfig.json` targets ES2020, uses `module` `ESNext` and `moduleResolution` `Bundler`, enables `strict`, sets `noEmit`, sets `jsx` to `react-jsx`, and includes `src`. The sources under `src/` are `.ts` and `style.css`.

## Install, build, and workflow

`package.json` name is `rosie-posie-bakery`, version `0.1.0`, `"type": "module"`. Scripts are `dev` (`vite`), `build` (`vite build`), and `preview` (`vite preview --port 5173`). devDependencies are `typescript` `^5.5.4` and `vite` `^5.4.8`. The lockfile resolves Vite to 5.4.20 and TypeScript to 5.9.2.

`.gitignore` ignores `node_modules`, `dist`, `.DS_Store`, `.vite`, and `*.log`.

`.github/workflows/deploy.yml`:

- Trigger: push to `main`.
- Permissions: `contents: read`, `pages: write`, `id-token: write`.
- Concurrency group `pages` with `cancel-in-progress: false`.
- Build job on `ubuntu-latest`: `actions/checkout@v4`, `actions/setup-node@v4` with `node-version: '20'` and `cache: 'npm'`, `npm ci`, `npm run build`, `actions/upload-pages-artifact@v3` with `path: ./dist`.
- Deploy job needs `build`, environment `github-pages`, `actions/deploy-pages@v4`.

`vite.config.ts` sets `server.hmr.overlay` to `true`. Production `base` is `/Rosie-Posie-Bakery/`. Any other `NODE_ENV` uses `/`. In the production HTML emitted for this tree, `/logo.png`, the stylesheet, and module scripts are prefixed with `/Rosie-Posie-Bakery/`. In-page links such as `./wheel.html` stay relative.
