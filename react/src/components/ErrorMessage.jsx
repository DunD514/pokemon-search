/** User-facing error panel (not found, network failure, server error). */
export default function ErrorMessage({ message }) {
  return (
    <div className="error" role="alert">
      <p className="error__title">Search unsuccessful</p>
      <p className="error__text">{message}</p>
    </div>
  );
}
