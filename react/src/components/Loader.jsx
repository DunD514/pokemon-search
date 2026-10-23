/** Spinner shown while a request is in flight. */
export default function Loader({ query }) {
  return (
    <div className="loader" role="status">
      <span>Searching for “{query}”…</span>
    </div>
  );
}
