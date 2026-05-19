export default function Pagination({ meta, onChange }) {
  if (!meta || meta.last_page <= 1) return null;

  const pages = [];
  for (let i = 1; i <= meta.last_page; i++) pages.push(i);

  return (
    <div className="pagination">
      <button
        className="btn btn-sm"
        disabled={meta.current_page === 1}
        onClick={() => onChange(meta.current_page - 1)}
      >
        Prev
      </button>
      {pages.map((p) => (
        <button
          key={p}
          className={"btn btn-sm " + (p === meta.current_page ? "active" : "")}
          onClick={() => onChange(p)}
        >
          {p}
        </button>
      ))}
      <button
        className="btn btn-sm"
        disabled={meta.current_page === meta.last_page}
        onClick={() => onChange(meta.current_page + 1)}
      >
        Next
      </button>
    </div>
  );
}
