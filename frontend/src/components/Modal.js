import React, { useEffect, useState } from "react";

export default function Modal({ open, book, onClose, backend }) {
  const [description, setDescription] = useState("Cargando descripción...");
  const [translated, setTranslated] = useState("Traduciendo...");
  const apiBase = backend || "https://prueba-web-h7w2.onrender.com";

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

      const workId = book.key.replace("/works/", "");

      // API privada obtiene descripción (OpenLibrary) y traduce en el backend
      const res = await fetch(`${apiBase}/books/${workId}/description?target=es`);
      if (!res.ok) throw new Error("Falló al obtener descripción");

      const data = await res.json();
      setDescription(data.description || "No disponible.");
      setTranslated(data.translated || data.description || "Sin traducción");
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
            <button className="btn-outline" onClick={onClose}>
              Cerrar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
