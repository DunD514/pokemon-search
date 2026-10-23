# Comparison Report: Vanilla JavaScript vs React

Same application, same CSS (`vanilla/style.css` and `react/src/App.css` are byte-identical), same API module logic, same rendered DOM. The only variable is how the UI is produced.

> **Measurement note.** File counts, line counts and bundle sizes below were measured from the actual builds in this repo. Runtime timings (load, DOM update cost) were **not** benchmarked in a real network/device setup, so the performance section is analysis plus a method to measure it yourself, not invented numbers.

---

## 1. Code Comparison

| Metric | Vanilla | React (Vite) |
|---|---|---|
| Source files (app code) | 3 (`index.html`, `style.css`, `script.js`) | 9 (`index.html`, `main.jsx`, `App.jsx`, `App.css`, 4 components, `api/pokeapi.js`) |
| Config / tooling files | 0 | `package.json`, `vite.config.js`, lockfile |
| Dependencies | 0 | 2 runtime (`react`, `react-dom`), 2 dev (`vite`, `@vitejs/plugin-react`) |
| JS/JSX lines (source) | 310 (`script.js`) | 381 across `.jsx` + `api` files |
| Build step required | No | Yes (`npm run build`) |
| Runs by double-clicking `index.html` | Yes | No (needs dev server or build output) |

### Code organisation
- **Vanilla:** one file split into four commented sections (constants, data layer, view layer, controller). Structure is by convention; nothing enforces it.
- **React:** structure is enforced by the component model. `App` owns state, `SearchBar`/`PokemonCard`/`Loader`/`ErrorMessage` are presentational, `api/pokeapi.js` owns data.

### Readability
- Vanilla view code is imperative: `h('div','card')`, `.append(...)`. Reading it means mentally replaying DOM construction. The markup shape is not visible at a glance.
- React's JSX looks like the HTML it produces, so the card's structure is readable directly. Loading, error and success views are a declarative `status === ...` switch.

### Maintainability
- Vanilla: adding a field means editing a render function *and* remembering any place the DOM must be cleared or updated. Here that cost is low because every search replaces the whole output with `replaceChildren`. It rises quickly once partial updates are needed.
- React: add a field to the normalised object and to the relevant component. There is no "update path" to forget.

### Reusability
- Vanilla: helper functions (`renderFacts`, `renderStats`) are reusable but return raw nodes and own no state.
- React: components bundle markup, props and (when needed) state. `Loader` and `ErrorMessage` could be dropped into any other React app unchanged.

**Verdict:** For this ~300-line app, vanilla is simpler and shorter in files. React's structure pays off as the number of screens, states and contributors grows.

---

## 2. Performance Comparison

| Aspect | Vanilla | React | Reasoning |
|---|---|---|---|
| Initial page load | Faster | Slower | ~6.7 KB vs ~70.9 KB gzip to download; React must also parse/execute its runtime and mount the tree before first content. |
| First paint of static shell | Immediate (HTML in the document) | After JS executes (`#root` is empty in the HTML) | Vanilla ships the header, form and chips as HTML. |
| DOM updates (this app) | Whole output replaced via `replaceChildren` | Virtual DOM diff, only changed nodes patched | At this size both are effectively instant. Differences are far below perception. |
| Rendering efficiency at scale | Developer must hand-write targeted updates | Reconciler does it automatically | Hand-tuned vanilla can beat React; naive vanilla (re-render everything) can be worse. |
| API handling | `fetch` + `AbortController` | Identical `fetch` + `AbortController` | Same network cost. React adds nothing and removes nothing. React-specific: `StrictMode` double-invokes effects in dev only. |

Behavioural parity that was verified in a headless browser (mocked API) for **both** apps at desktop and mobile widths: empty and whitespace-only search blocked with a message, Enter key and button both search, button disabled while loading, loading indicator shown, 404 message, 500 message, dual-type result, no horizontal overflow, and the rendered card DOM identical (apart from HTML attribute order).

### How to measure real numbers
1. Serve both (`python -m http.server` in `vanilla/`, `npm run preview` in `react/`).
2. Chrome DevTools → Lighthouse (mobile, throttled) → compare FCP, LCP, TBT.
3. Performance tab → record a search → compare scripting time and "Recalculate style / Layout".
4. Network tab → compare transferred bytes.

---

## 3. Bundle Size Comparison

Measured from the real build output (gzip level 9; Vite's own figures use kB = 1000 bytes).

| Asset | Vanilla raw | Vanilla gzip | React raw | React gzip |
|---|---|---|---|---|
| HTML | 2.3 KB | 0.9 KB | 0.5 KB | 0.3 KB |
| CSS | 10.2 KB | 2.9 KB | 7.5 KB (minified) | 2.4 KB |
| JavaScript | 8.6 KB (unminified) | 3.1 KB | 226.0 KB | 70.8 KB |
| **Total** | **~21.0 KB** | **~6.9 KB** | **~233.9 KB** | **~72.6 KB** |

Vanilla files are shipped unminified; minifying `script.js` and `style.css` would shrink them further, so the real-world gap is, if anything, slightly larger than shown. React is roughly **11x larger over the wire** and **11x larger raw**.

### Why React's bundle is larger
1. **The runtime is the cost.** ~99% of React's JS is `react-dom` (the renderer, event system, scheduler) plus `react` itself, not the ~380 lines of app code. Vanilla uses the browser's built-in DOM implementation, which is already installed on the user's device and costs 0 bytes to download.
2. **Reconciler + scheduler.** Virtual DOM diffing, fiber architecture and concurrent scheduling are general-purpose machinery shipped whether the app needs them or not.
3. **Synthetic event system.** React normalises events across browsers and delegates them from the root.
4. **JSX output and hooks plumbing.** Each component compiles to function calls into the runtime.
5. **Fixed cost, not per-feature cost.** The ~70 KB is paid once; adding features to a React app grows the bundle slowly, while the vanilla app has no fixed cost but grows linearly with hand-written glue.

---

## 4. Summary

| Criterion | Winner for this app | Winner as app grows |
|---|---|---|
| Download size / startup | Vanilla | Vanilla (but gap shrinks proportionally) |
| Zero tooling | Vanilla | N/A |
| Readable UI code | React | React |
| State/UI sync safety | React | React |
| Component reuse | React | React |
| Team scalability | React | React |
