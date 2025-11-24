
import React, { useEffect, useState } from "react";

export default function BookSearch({ prefilledQuery = "" }) {
  const [books, setBooks] = useState([]);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (prefilledQuery.trim()) {
      search(prefilledQuery);
    }
  }, [prefilledQuery]);

  async function search(query) {
    setMsg("Buscando...");

    const res = await fetch(
      `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}`
    );
    const data = await res.json();

    setBooks(data.docs.slice(0, 20));
    setMsg("");
  }

  function cover(b) {
    if (b.cover_i)
      return `https://covers.openlibrary.org/b/id/${b.cover_i}-M.jpg`;
    return "https://via.placeholder.com/100x150?text=No+Cover";
  }

  return (
    <div className="card">
      <h2>Resultados</h2>

      <p className="msg">{msg}</p>

      {books.map((b, i) => (
        <div key={i} className="result-item">
          <img src={cover(b)} alt={b.title} />

          <div style={{ flex: 1 }}>
            <div className="book-title">{b.title}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

