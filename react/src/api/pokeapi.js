/**
 * Data layer: fetch a Pokémon from PokéAPI and normalise the response.
 * Mirrors the "Data layer" section of vanilla/script.js.
 */

const API_BASE = 'https://pokeapi.co/api/v2/pokemon/';
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

/** "lightning-rod" -> "Lightning Rod" */
export function formatName(slug) {
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
export async function fetchPokemon(rawQuery, signal) {
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
