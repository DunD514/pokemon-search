const MAX_STAT_VALUE = 200; // bar width is clamped at this value

/* Small presentational pieces, kept local because only the card uses them. */

function TypeBadges({ types }) {
  return (
    <ul className="badges" aria-label="Types">
      {types.map((type) => (
        <li key={type} className={`badge badge--${type}`}>
          {type}
        </li>
      ))}
    </ul>
  );
}

function Facts({ pokemon }) {
  const facts = [
    ['Height', `${pokemon.height.toFixed(1)} m`],
    ['Weight', `${pokemon.weight.toFixed(1)} kg`],
    ['Base experience', pokemon.baseExperience ?? 'N/A'],
  ];

  return (
    <dl className="facts">
      {facts.map(([label, value]) => (
        <div className="fact" key={label}>
          <dt className="fact__label">{label}</dt>
          <dd className="fact__value">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function Abilities({ abilities }) {
  return (
    <section>
      <h3 className="card__section-title">Abilities</h3>
      <ul className="abilities">
        {abilities.map((ability) => (
          <li className="ability" key={ability.name}>
            <span>{ability.name}</span>
            {ability.hidden && <span className="ability__tag">Hidden</span>}
          </li>
        ))}
      </ul>
    </section>
  );
}

function Stats({ stats }) {
  return (
    <section>
      <h3 className="card__section-title">Base stats</h3>
      <ul className="stats">
        {stats.map((stat) => (
          <li className="stat" key={stat.label}>
            <span className="stat__label">{stat.label}</span>
            <span className="stat__value">{stat.value}</span>
            <span className="stat__bar" aria-hidden="true">
              <span
                className="stat__fill"
                style={{ width: `${Math.min(stat.value / MAX_STAT_VALUE, 1) * 100}%` }}
              />
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Full profile card for one Pokémon. */
export default function PokemonCard({ pokemon }) {
  return (
    <article className="card">
      <div className="card__media">
        <img
          className="card__image"
          src={pokemon.image}
          alt={`Official artwork of ${pokemon.name}`}
        />
      </div>

      <div className="card__body">
        <header className="card__head">
          <span className="card__id">No. {String(pokemon.id).padStart(4, '0')}</span>
          <h2 className="card__name">{pokemon.name}</h2>
          <TypeBadges types={pokemon.types} />
        </header>

        <Facts pokemon={pokemon} />
        <Abilities abilities={pokemon.abilities} />
        <Stats stats={pokemon.stats} />
      </div>
    </article>
  );
}
