import React, { useEffect, useRef, useState } from "react";

export default function Carousel({ title, url, onDetails }) {
  const [items, setItems] = useState([]);
  const boxRef = useRef(null);
  const scrollInterval = useRef(null);

  useEffect(() => {
    async function load() {
      const res = await fetch(url);
      const data = await res.json();
      setItems(data.docs.slice(0, 20));
    }
    load();
  }, [url]);

  function cover(b) {
    if (b.cover_i)
      return `https://covers.openlibrary.org/b/id/${b.cover_i}-L.jpg`;
    return "https://via.placeholder.com/160x240?text=No+Cover";
  }

  // === AUTO-SCROLL POR POSICIÓN DEL MOUSE ===
  function handleMouseMove(e) {
    const box = boxRef.current;
    const rect = box.getBoundingClientRect();
    const posX = e.clientX - rect.left; // posición del mouse dentro del carrusel
    const width = rect.width;

    clearInterval(scrollInterval.current);

    scrollInterval.current = setInterval(() => {
      if (posX > width * 0.75) {
        // mover a la derecha
        box.scrollLeft += 8;
      } else if (posX < width * 0.25) {
        // mover a la izquierda
        box.scrollLeft -= 8;
      }
    }, 10);
  }

  function stopScroll() {
    clearInterval(scrollInterval.current);
  }

  return (
    <div className="carousel-section">
      <div className="carousel-title">{title}</div>

      <div
        className="carousel-container"
        ref={boxRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={stopScroll}
      >
        {items.map((b, i) => (
          <div key={i} className="carousel-item">
            <img src={cover(b)} alt={b.title} />

            <div className="carousel-overlay">
              <strong>{b.title}</strong>
              <button className="btn-small btn-outline" onClick={() => onDetails(b)}>
                Ver más detalles
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
