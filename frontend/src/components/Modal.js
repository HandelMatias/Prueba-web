import React, { useEffect, useState } from "react";

export default function Modal({ open, book, onClose, onAdd }) {
  const [description, setDescription] = useState("Cargando descripción...");
  const [translated, setTranslated] = useState("Traduciendo...");

  useEffect(() => {
    if (book) loadDescription();
  }, [book]);

  async function loadDescription() {
    setDescription("Cargando descripción...");
    setTranslated("Traduciendo...");

    try {
      if (!book.key) {
        setDescription("No hay descripción disponible.");
        setTranslated("No hay descripción disponible.");
        return;
      }

      // Obtener descripción original
      const workId = book.key.replace("/works/", "");
      const url = `https://openlibrary.org/works/${workId}.json`;

      const res = await fetch(url);
      const data = await res.json();

      let desc = "No disponible.";

      if (typeof data.description === "string") desc = data.description;
      else if (data.description?.value) desc = data.description.value;

      setDescription(desc);

      // ===== Traducir desde tu backend =====
      const tr = await fetch("http://localhost:4000/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ text: desc })
      });

      const trData = await tr.json();
      setTranslated(trData.translated);

    } catch (e) {
      setDescription("Error al cargar.");
      setTranslated("Error al traducir.");
    }
  }

  if (!open || !book) return null;

  function cover(b) {
    if (b.cover_i)
      return `https://covers.openlibrary.org/b/id/${b.cover_i}-L.jpg`;
    return "https://via.placeholder.com/300x450?text=No+Cover";
  }

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        
        <img className="modal-cover" src={cover(book)} alt={book.title} />

        <div className="modal-info">
          <h2>{book.title}</h2>

          <p className="modal-author">
            {book.author_name ? book.author_name.join(", ") : "Autor desconocido"}
          </p>

          <h3>Descripción original:</h3>
          <p className="modal-desc">{description}</p>

          <h3>Descripción traducida:</h3>
          <p className="modal-desc">{translated}</p>

          <div className="modal-buttons">
            <button className="btn-primary" onClick={() => onAdd(book)}>
              + Agregar a Favoritos
            </button>

            <button className="btn-outline" onClick={onClose}>
              Cerrar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
