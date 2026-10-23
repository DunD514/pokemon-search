const EXAMPLES = ['pikachu', 'charizard', 'gengar', 'mr-mime', '150'];

/**
 * Controlled search form plus example shortcuts.
 * Submitting the <form> covers both the Search button and the Enter key.
 */
export default function SearchBar({
  value,
  onChange,
  onSubmit,
  onExample,
  validation,
  disabled,
}) {
  function handleSubmit(event) {
    event.preventDefault();
    onSubmit();
  }

  return (
    <>
      <form className="search" onSubmit={handleSubmit} noValidate>
        <label htmlFor="search-input" className="visually-hidden">
          Pokémon name or Dex number
        </label>
        <input
          id="search-input"
          className={`search__input${validation ? ' search__input--invalid' : ''}`}
          type="text"
          placeholder="e.g. pikachu or 25"
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-describedby="search-validation"
          aria-invalid={validation ? 'true' : undefined}
        />
        <button className="search__button" type="submit" disabled={disabled}>
          Search
        </button>
      </form>

      {validation && (
        <p id="search-validation" className="search__validation" role="alert">
          {validation}
        </p>
      )}

      <div className="examples">
        <span className="examples__label">Try</span>
        {EXAMPLES.map((name) => (
          <button
            key={name}
            type="button"
            className="examples__button"
            onClick={() => onExample(name)}
          >
            {name}
          </button>
        ))}
      </div>
    </>
  );
}
