import React, { useState } from "react";
import Carousel from "./components/Carousel";
import Modal from "./components/Modal";
import BookSearch from "./components/BookSearch";

const BACKEND =
  import.meta.env.VITE_BACKEND_URL ||
  "https://prueba-web-h7w2.onrender.com";

export default function App() {
  const [searchHeader, setSearchHeader] = useState("");
  const [globalSearch, setGlobalSearch] = useState("");

  function doHeaderSearch(text) {
    if (!text.trim()) return;
    setGlobalSearch(text);

    setTimeout(() => {
      window.scrollTo({ top: 700, behavior: "smooth" });
    }, 200);
  }

  const [openModal, setOpenModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);

  function showDetails(book) {
    setSelectedBook(book);
    setOpenModal(true);
  }

  return (
    <div className="container">
      <header className="header-netflix">
        <div className="header-left">
          <h1>EduBook</h1>

          <div className="header-search">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Buscar libros..."
              value={searchHeader}
              onChange={(e) => setSearchHeader(e.target.value)}
            />
          </div>

          <button
            className="header-btn"
            onClick={() => doHeaderSearch(searchHeader)}
          >
            Buscar
          </button>
        </div>
      </header>

      <Carousel
        title="📚 Populares"
        url="https://openlibrary.org/search.json?q=bestseller"
        onDetails={showDetails}
      />

      <Carousel
        title="🔥 Ficción Destacada"
        url="https://openlibrary.org/search.json?q=fiction"
        onDetails={showDetails}
      />

      <Carousel
        title="⭐ Clásicos"
        url="https://openlibrary.org/search.json?q=classic"
        onDetails={showDetails}
      />

      <Carousel
        title="🐉 Fantasía"
        url="https://openlibrary.org/search.json?q=fantasy"
        onDetails={showDetails}
      />

      <BookSearch backend={BACKEND} prefilledQuery={globalSearch} />

      <Modal
        open={openModal}
        book={selectedBook}
        onClose={() => setOpenModal(false)}
        backend={BACKEND}
      />
    </div>
  );
}
