import { useEffect, useRef, useState } from 'react';
import SearchBar from './components/SearchBar.jsx';
import PokemonCard from './components/PokemonCard.jsx';
import Loader from './components/Loader.jsx';
import ErrorMessage from './components/ErrorMessage.jsx';
import ModeSwitch from './components/ModeSwitch.jsx';
import { fetchPokemon } from './api/pokeapi.js';
import './App.css';

const EMPTY_MESSAGE = 'Enter a Pokémon name or ID to search.';

/**
 * App owns all state. The UI is a pure function of:
 *   status:  'idle' | 'loading' | 'success' | 'error'
 *   pokemon, error, validation, query
 * There is no manual DOM work — we only describe what each state looks like.
 */
export default function App() {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('idle');
  const [pokemon, setPokemon] = useState(null);
  const [error, setError] = useState('');
  const [validation, setValidation] = useState('');
  const [searchedFor, setSearchedFor] = useState('');

  const controllerRef = useRef(null); // AbortController of the in-flight request

  // Check URL search params for shared query and cleanup on unmount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get('q');
    if (initialQuery && initialQuery.trim()) {
      setQuery(initialQuery.trim());
      search(initialQuery.trim());
    }

    return () => controllerRef.current?.abort();
  }, []);

  async function search(rawQuery) {
    const trimmed = rawQuery.trim();

    if (!trimmed) {
      setValidation(EMPTY_MESSAGE);
      return;
    }

    setValidation('');

    // Cancel any previous request so a slow response can't overwrite a newer one
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    setSearchedFor(trimmed);
    setStatus('loading');

    try {
      const result = await fetchPokemon(trimmed, controller.signal);
      setPokemon(result);
      setStatus('success');
    } catch (err) {
      if (err.name === 'AbortError') return;
      setError(err.message);
      setStatus('error');
    } finally {
      if (controllerRef.current === controller) controllerRef.current = null;
    }
  }

  function handleQueryChange(value) {
    setQuery(value);
    if (validation) setValidation(''); // clear message as soon as the user types
  }

  function handleExample(name) {
    setQuery(name);
    search(name);
  }

  const isLoading = status === 'loading';

  return (
    <main className="app">
      <ModeSwitch currentMode="react" currentQuery={searchedFor || query} />

      <header className="app__header">
        <p className="eyebrow">PokéAPI Reference</p>
        <h1 className="app__title">Pokémon Search</h1>
        <p className="app__subtitle">
          Look up any Pokémon by name or National Dex number.
        </p>
      </header>

      <SearchBar
        value={query}
        onChange={handleQueryChange}
        onSubmit={() => search(query)}
        onExample={handleExample}
        validation={validation}
        disabled={isLoading}
      />

      <section className="output" aria-live="polite" aria-busy={isLoading}>
        {status === 'idle' && (
          <div className="placeholder">
            <p className="placeholder__title">No Pokémon selected</p>
            <p>Search above to see its profile here.</p>
          </div>
        )}
        {status === 'loading' && <Loader query={searchedFor} />}
        {status === 'error' && <ErrorMessage message={error} />}
        {status === 'success' && <PokemonCard pokemon={pokemon} />}
      </section>

      <footer className="app__footer">
        Data provided by{' '}
        <a href="https://pokeapi.co/" target="_blank" rel="noopener noreferrer">
          PokéAPI
        </a>
        .
      </footer>
    </main>
  );
}
