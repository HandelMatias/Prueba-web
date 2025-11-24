import React, { useState } from 'react';
import Login from './components/Login';
import Carousel from './components/Carousel';
import Favorites from './components/Favorites';
import Modal from './components/Modal';
import BookSearch from './components/BookSearch'; // ahora sin input

const BACKEND = process.env.REACT_APP_BACKEND_URL || "http://localhost:4000";

export default function App() {

  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")) || null);

  // Buscador del header
  const [searchHeader, setSearchHeader] = useState("");
  const [globalSearch, setGlobalSearch] = useState("");

  function doHeaderSearch(text) {
    if (!text.trim()) return;
    setGlobalSearch(text);

    // baja al contenedor de resultados
    setTimeout(() => {
      window.scrollTo({ top: 700, behavior: "smooth" });
    }, 200);
  }

  // Modal
  const [openModal, setOpenModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);

  function showDetails(book) {
    setSelectedBook(book);
    setOpenModal(true);
  }

  // Login
  function login(tok, usr) {
    setToken(tok);
    setUser(usr);
    localStorage.setItem("token", tok);
    localStorage.setItem("user", JSON.stringify(usr));
  }

  function logout() {
    setToken(null);
    setUser(null);
    localStorage.clear();
  }

  // Favoritos
  async function addToFavorites(book) {
    if (!token) return alert("Inicia sesión");

    const res = await fetch(`${BACKEND}/favorites`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      },
      body: JSON.stringify({ name: book.title, book })
    });

    if (!res.ok) return alert("Error al guardar");
    alert("📚 Guardado en favoritos");
  }

  return (
    <div className="container">

      {/* HEADER CON LOGO + BUSCADOR */}
      <header className="header-netflix">
        <div className="header-left">
          <h1>EduPlan</h1>

          {/* BUSCADOR CON ÍCONO */}
          <div className="header-search">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Buscar libros..."
              value={searchHeader}
              onChange={(e) => setSearchHeader(e.target.value)}
            />
          </div>

          <button className="header-btn" onClick={() => doHeaderSearch(searchHeader)}>
            Buscar
          </button>
        </div>

        {token && <button onClick={logout}>Cerrar Sesión</button>}
      </header>

      {!token ? (
        <Login backend={BACKEND} onLogin={login} />
      ) : (
        <>
          {/* CARRUSELES */}
          <Carousel
            title="📚 Populares"
            url="https://openlibrary.org/search.json?q=bestseller"
            onAdd={addToFavorites}
            onDetails={showDetails}
          />

          <Carousel
            title="🔥 Ficción Destacada"
            url="https://openlibrary.org/search.json?q=fiction"
            onAdd={addToFavorites}
            onDetails={showDetails}
          />

          <Carousel
            title="⭐ Clásicos"
            url="https://openlibrary.org/search.json?q=classic"
            onAdd={addToFavorites}
            onDetails={showDetails}
          />

          <Carousel
            title="🐉 Fantasía"
            url="https://openlibrary.org/search.json?q=fantasy"
            onAdd={addToFavorites}
            onDetails={showDetails}
          />

          {/* RESULTADOS CONTROLADOS POR EL HEADER */}
          <BookSearch
            backend={BACKEND}
            token={token}
            prefilledQuery={globalSearch}
          />

          <Favorites backend={BACKEND} token={token} />
        </>
      )}

      {/* MODAL */}
      <Modal
        open={openModal}
        book={selectedBook}
        onClose={() => setOpenModal(false)}
        onAdd={addToFavorites}
      />
    </div>
  );
}
