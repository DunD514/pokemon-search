/* ==========================================================================
   Pokémon Search — Vanilla JavaScript implementation
   No frameworks or libraries. Plain DOM APIs + Fetch.

   Sections:
     1. Constants
     2. Data layer   (fetch + normalise API response)
     3. View layer   (build DOM nodes by hand)
     4. Controller   (events, state transitions)
   ========================================================================== */

'use strict';

/* ---------- 1. Constants ---------- */

const API_BASE = 'https://pokeapi.co/api/v2/pokemon/';
const MAX_STAT_VALUE = 200; // bar width is clamped at this value
const EMPTY_MESSAGE = 'Enter a Pokémon name or ID to search.';
const NETWORK_MESSAGE =
  'Could not reach PokéAPI. Check your connection and try again.';

const STAT_LABELS = {
  hp: 'HP',
  attack: 'Attack',
  defense: 'Defense',
  'special-attack': 'Sp. Atk',
  'special-defense': 'Sp. Def',
  speed: 'Speed',
};

/* ---------- 2. Data layer ---------- */

/** "lightning-rod" -> "Lightning Rod" */
function formatName(slug) {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/** Convert the raw API payload into the shape the UI needs. */
function toPokemon(data) {
  const artwork = data.sprites.other?.['official-artwork']?.front_default;

  return {
    id: data.id,
    name: formatName(data.name),
    image: artwork || data.sprites.front_default,
    height: data.height / 10, // decimetres -> metres
    weight: data.weight / 10, // hectograms -> kilograms
    baseExperience: data.base_experience,
    types: data.types.map((t) => t.type.name),
    abilities: data.abilities.map((a) => ({
      name: formatName(a.ability.name),
      hidden: a.is_hidden,
    })),
    stats: data.stats.map((s) => ({
      label: STAT_LABELS[s.stat.name] || formatName(s.stat.name),
      value: s.base_stat,
    })),
  };
}

/**
 * Fetch one Pokémon. Throws an Error whose message is safe to show the user.
 * An AbortError is re-thrown untouched so the caller can ignore it.
 */
async function fetchPokemon(rawQuery, signal) {
  const slug = rawQuery.trim().toLowerCase().replace(/\s+/g, '-');

  let response;
  try {
    response = await fetch(API_BASE + encodeURIComponent(slug), { signal });
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    throw new Error(NETWORK_MESSAGE);
  }

  if (response.status === 404) {
    throw new Error(
      `No Pokémon found for “${rawQuery.trim()}”. Check the spelling or try its Dex number.`
    );
  }
  if (!response.ok) {
    throw new Error(
      `PokéAPI returned an error (${response.status}). Please try again shortly.`
    );
  }

  return toPokemon(await response.json());
}

/* ---------- 3. View layer ---------- */

/** Tiny helper: create an element with optional class, text and attributes. */
function h(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function renderPlaceholder() {
  const box = h('div', 'placeholder');
  box.append(
    h('p', 'placeholder__title', 'No Pokémon selected'),
    h('p', null, 'Search above to see its profile here.')
  );
  return box;
}

function renderLoader(query) {
  const box = h('div', 'loader');
  box.setAttribute('role', 'status');
  box.append(
    h('span', 'loader__spinner'),
    h('span', null, `Searching for “${query}”…`)
  );
  return box;
}

function renderError(message) {
  const box = h('div', 'error');
  box.setAttribute('role', 'alert');
  box.append(h('p', 'error__title', 'Search unsuccessful'), h('p', 'error__text', message));
  return box;
}

function renderTypes(types) {
  const list = h('ul', 'badges');
  list.setAttribute('aria-label', 'Types');
  types.forEach((type) => {
    list.append(h('li', `badge badge--${type}`, type));
  });
  return list;
}

function renderFacts(pokemon) {
  const facts = [
    ['Height', `${pokemon.height.toFixed(1)} m`],
    ['Weight', `${pokemon.weight.toFixed(1)} kg`],
    ['Base experience', pokemon.baseExperience ?? 'N/A'],
  ];

  const list = h('dl', 'facts');
  facts.forEach(([label, value]) => {
    const item = h('div', 'fact');
    item.append(h('dt', 'fact__label', label), h('dd', 'fact__value', String(value)));
    list.append(item);
  });
  return list;
}

function renderAbilities(abilities) {
  const section = h('section');
  section.append(h('h3', 'card__section-title', 'Abilities'));

  const list = h('ul', 'abilities');
  abilities.forEach((ability) => {
    const item = h('li', 'ability');
    item.append(h('span', null, ability.name));
    if (ability.hidden) item.append(h('span', 'ability__tag', 'Hidden'));
    list.append(item);
  });

  section.append(list);
  return section;
}

function renderStats(stats) {
  const section = h('section');
  section.append(h('h3', 'card__section-title', 'Base stats'));

  const list = h('ul', 'stats');
  stats.forEach((stat) => {
    const item = h('li', 'stat');
    const bar = h('span', 'stat__bar');
    bar.setAttribute('aria-hidden', 'true');
    const fill = h('span', 'stat__fill');
    fill.style.width = `${Math.min(stat.value / MAX_STAT_VALUE, 1) * 100}%`;
    bar.append(fill);
    item.append(
      h('span', 'stat__label', stat.label),
      h('span', 'stat__value', String(stat.value)),
      bar
    );
    list.append(item);
  });

  section.append(list);
  return section;
}

function renderCard(pokemon) {
  const card = h('article', 'card');

  // Image column
  const media = h('div', 'card__media');
  const image = h('img', 'card__image');
  image.src = pokemon.image;
  image.alt = `Official artwork of ${pokemon.name}`;
  media.append(image);

  // Details column
  const head = h('header', 'card__head');
  head.append(
    h('span', 'card__id', `No. ${String(pokemon.id).padStart(4, '0')}`),
    h('h2', 'card__name', pokemon.name),
    renderTypes(pokemon.types)
  );

  const body = h('div', 'card__body');
  body.append(
    head,
    renderFacts(pokemon),
    renderAbilities(pokemon.abilities),
    renderStats(pokemon.stats)
  );

  card.append(media, body);
  return card;
}

/* ---------- 4. Controller ---------- */

const form = document.getElementById('search-form');
const input = document.getElementById('search-input');
const button = document.getElementById('search-button');
const validation = document.getElementById('search-validation');
const examples = document.getElementById('examples');
const output = document.getElementById('output');

let activeRequest = null; // AbortController of the in-flight request

function showValidation(message) {
  validation.textContent = message;
  validation.hidden = false;
  input.classList.add('search__input--invalid');
  input.setAttribute('aria-invalid', 'true');
}

function clearValidation() {
  validation.textContent = '';
  validation.hidden = true;
  input.classList.remove('search__input--invalid');
  input.removeAttribute('aria-invalid');
}

/** Replace whatever is in the output region with a new view. */
function show(node) {
  output.replaceChildren(node);
}

function setBusy(isBusy) {
  button.disabled = isBusy;
  output.setAttribute('aria-busy', String(isBusy));
}

async function search(rawQuery) {
  const query = rawQuery.trim();

  // Prevent empty searches
  if (!query) {
    showValidation(EMPTY_MESSAGE);
    input.focus();
    return;
  }
  clearValidation();

  // Cancel any previous request so a slow response can't overwrite a newer one
  activeRequest?.abort();
  const controller = new AbortController();
  activeRequest = controller;

  setBusy(true);
  show(renderLoader(query));

  try {
    const pokemon = await fetchPokemon(query, controller.signal);
    show(renderCard(pokemon));
  } catch (err) {
    if (err.name === 'AbortError') return;
    show(renderError(err.message));
  } finally {
    if (activeRequest === controller) {
      activeRequest = null;
      setBusy(false);
    }
  }
}

// Button click and Enter key both trigger the form's submit event
form.addEventListener('submit', (event) => {
  event.preventDefault();
  search(input.value);
});

// Clear the validation message as soon as the user starts typing
input.addEventListener('input', clearValidation);

// Example chips (event delegation)
examples.addEventListener('click', (event) => {
  const chip = event.target.closest('[data-query]');
  if (!chip) return;
  input.value = chip.dataset.query;
  search(chip.dataset.query);
});

// Initial view: run a shared ?q= search, otherwise show the placeholder
const initialQuery = new URLSearchParams(window.location.search).get('q');
if (initialQuery && initialQuery.trim()) {
  input.value = initialQuery.trim();
  search(initialQuery.trim());
} else {
  show(renderPlaceholder());
}

/* ---------- Mode Switcher (Dropdown) ---------- */
const modeWrapper = document.getElementById('mode-switch-wrapper');
const modeTrigger = document.getElementById('mode-switch-trigger');
const modeItems = document.querySelectorAll('[data-switch-to]');

if (modeTrigger && modeWrapper) {
  function toggleDropdown(open) {
    const shouldOpen =
      typeof open === 'boolean'
        ? open
        : !modeWrapper.classList.contains('is-open');
    modeWrapper.classList.toggle('is-open', shouldOpen);
    modeTrigger.setAttribute('aria-expanded', String(shouldOpen));
  }

  function updateTargetUrls() {
    modeItems.forEach((link) => {
      const target = link.dataset.switchTo;
      try {
        const targetPort = target === 'react' ? '5173' : '8080';
        const targetUrl = new URL(window.location.href);
        targetUrl.port = targetPort;
        const currentQuery = input.value.trim();
        if (currentQuery) {
          targetUrl.searchParams.set('q', currentQuery);
        } else {
          targetUrl.searchParams.delete('q');
        }
        link.href = targetUrl.toString();
      } catch (err) {
        // fallback
      }
    });
  }

  updateTargetUrls();
  input.addEventListener('input', updateTargetUrls);

  modeTrigger.addEventListener('click', (e) => {
    e.stopPropagation();
    updateTargetUrls();
    toggleDropdown();
  });

  document.addEventListener('pointerdown', (e) => {
    if (!modeWrapper.contains(e.target)) {
      toggleDropdown(false);
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') toggleDropdown(false);
  });

  modeItems.forEach((link) => {
    link.addEventListener('click', (e) => {
      const target = link.dataset.switchTo;
      if (target === 'vanilla') {
        e.preventDefault();
        toggleDropdown(false);
      }
    });
  });
}

