# Pokémon Search: Vanilla JavaScript vs React

The same Pokémon search application built twice, once in plain HTML/CSS/JavaScript and once in React (Vite), to compare the two approaches. Both use the identical stylesheet, data logic and rendered DOM, so the comparison isolates the technology.

## Project Overview

Search any Pokémon by name or National Dex number and see its profile pulled live from [PokéAPI](https://pokeapi.co/). A warm beige, editorial interface: serif headings, restrained colour, no emoji or clipart.

## Features

- Search by name or Dex number (case-insensitive, spaces become hyphens, e.g. `Mr Mime`)
- Search with the **Search button or the Enter key**
- **Empty and whitespace-only searches are blocked** with an inline message
- **Loading indicator** while the request is in flight; the button is disabled meanwhile
- Clear **error messages**: not found (404), server error, network failure
- Stale responses are cancelled with `AbortController`, so a slow request can never overwrite a newer one
- Card shows: artwork, name, ID, height, weight, base experience, type badges, abilities (hidden ability tagged) and base-stat bars
- **Responsive**: two-column card on desktop, stacked on mobile; stacked search on small screens
- Accessible: labelled input, `role="alert"` / `role="status"`, `aria-live` output region, visible focus rings, reduced-motion support

## Technologies Used

| | Vanilla | React |
|---|---|---|
| Language | HTML5, CSS3, JavaScript (ES6+) | JSX, CSS3, JavaScript (ES6+) |
| Libraries | None | React 19, ReactDOM |
| Tooling | None | Vite 8, `@vitejs/plugin-react` |
| Data | Fetch API | Fetch API |
| State | Module variables + DOM | `useState`, `useRef`, `useEffect` |

## Folder Structure

```
pokemon-search/
├── README.md
├── docs/
│   ├── COMPARISON.md          Code / performance / bundle-size comparison
│   ├── RESEARCH.md            React vs DOM, Virtual DOM, when to use vanilla
│   └── screenshots/           Captured from both apps
├── vanilla/
│   ├── index.html
│   ├── style.css              (identical to react/src/App.css)
│   └── script.js
└── react/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── main.jsx
        ├── App.jsx            State + composition
        ├── App.css            (identical to vanilla/style.css)
        ├── api/pokeapi.js     Fetch + normalise
        └── components/
            ├── SearchBar.jsx
            ├── PokemonCard.jsx
            ├── Loader.jsx
            └── ErrorMessage.jsx
```

## Installation Steps

Requirements: a modern browser. Node.js 18+ is needed for the React version only.

```bash
git clone <your-repo-url> pokemon-search
cd pokemon-search
cd react && npm install && cd ..
```

## How to Run Both Projects

### Vanilla
No build step. Either open `vanilla/index.html` in a browser, or serve it:

```bash
cd vanilla
python3 -m http.server 8080      # then visit http://localhost:8080
```

### React
```bash
cd react
npm run dev        # development server (http://localhost:5173)
npm run build      # production build into react/dist
npm run preview    # serve the production build
```

## Screenshots

Captured in a headless browser with a **mocked API and placeholder artwork** (the sandbox had no access to PokéAPI), so layout and states are real but the image is a stand-in. Run either app locally for real artwork.

| State | Vanilla | React |
|---|---|---|
| Idle | ![](docs/screenshots/vanilla-1-idle.png) | ![](docs/screenshots/react-1-idle.png) |
| Empty search | ![](docs/screenshots/vanilla-2-empty.png) | ![](docs/screenshots/react-2-empty.png) |
| Loading | ![](docs/screenshots/vanilla-3-loading.png) | ![](docs/screenshots/react-3-loading.png) |
| Result (desktop) | ![](docs/screenshots/vanilla-4-result-desktop.png) | ![](docs/screenshots/react-4-result-desktop.png) |
| Result (mobile) | ![](docs/screenshots/vanilla-4-result-mobile.png) | ![](docs/screenshots/react-4-result-mobile.png) |
| Error | ![](docs/screenshots/vanilla-5-error.png) | ![](docs/screenshots/react-5-error.png) |

## Comparison Tables

Full detail in [docs/COMPARISON.md](docs/COMPARISON.md).

| Metric | Vanilla | React |
|---|---|---|
| App source files | 3 | 9 |
| Dependencies | 0 | 2 runtime + 2 dev |
| Build step | None | Vite |
| JS/JSX lines | 310 | 381 |
| Total size (raw) | ~21.0 KB | ~233.9 KB |
| Total size (gzip) | ~6.9 KB | ~72.6 KB |
| Readability of UI code | Imperative, verbose | Declarative JSX |
| State/UI sync | Manual | Automatic |

## Research Findings

Full write-up in [docs/RESEARCH.md](docs/RESEARCH.md).

- **What React solves:** keeping UI synchronised with state declaratively, plus reusable components that scale with team and app size.
- **Virtual DOM:** a cheap in-memory tree that is diffed against the previous one so only changed real-DOM nodes are patched. It is a convenience abstraction, not magic speed.
- **When vanilla wins:** landing pages, static or small sites, embeddable widgets, and size/performance-critical code.

## Conclusion

For an app this small, both implementations behave identically and feel identical. Vanilla ships about **11x fewer bytes** and needs no tooling; React gives a clearer, safer structure that pays off as state and screens multiply. Choose by the shape of the project, not by habit.

## Future Improvements

- Cache previous results in a `Map` to avoid repeat requests
- Autocomplete from the PokéAPI name list
- Previous/next navigation by Dex number
- Recent-search history in `localStorage`
- Dark theme variant of the beige palette
- Automated tests (Vitest + Testing Library for React, Playwright end-to-end for both)
- Real Lighthouse benchmarks across throttled devices for the performance table
