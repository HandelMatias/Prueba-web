require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'secret_demo';

app.use(cors());
app.use(bodyParser.json());

// =========================
//   FRONTEND (React/Vite)
// =========================

app.use(express.static(path.join(__dirname, '../frontend/dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

// =========================
//     Usuarios demo
// =========================

const users = [
  { id: 1, username: 'admin', password: 'admin123', role: 'SuperUsuario' },
  { id: 2, username: 'profesor', password: 'prof123', role: 'Profesor' }
];

let favorites = [];
let nextFavId = 1;

// =========================
//         LOGIN
// =========================

app.post('/auth/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (!user) return res.status(401).json({ message: 'Credenciales inválidas' });

  const payload = { id: user.id, username: user.username, role: user.role };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

  res.json({ token, user: payload });
});

// =========================
//     MIDDLEWARE JWT
// =========================

function auth(req, res, next) {
  const header = req.headers["authorization"];
  const token = header && header.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Token requerido" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Token inválido" });
    req.user = user;
    next();
  });
}

// =========================
//        FAVORITOS
// =========================

app.get("/favorites", auth, (req, res) => {
  res.json(favorites);
});

app.post("/favorites", auth, (req, res) => {
  const { name, book } = req.body;

  if (!name || !book)
    return res.status(400).json({ message: "Faltan datos" });

  const fav = {
    id: nextFavId++,
    name,
    book,
    ownerId: req.user.id,
    createdAt: new Date()
  };

  favorites.push(fav);
  res.status(201).json(fav);
});

app.delete("/favorites/:id", auth, (req, res) => {
  const id = parseInt(req.params.id);
  const index = favorites.findIndex((f) => f.id === id);

  if (index === -1) return res.status(404).json({ message: "No encontrado" });

  const fav = favorites[index];
  if (fav.ownerId !== req.user.id && req.user.role !== "SuperUsuario") {
    return res.status(403).json({ message: "Sin permisos" });
  }

  favorites.splice(index, 1);
  res.json({ message: "Eliminado" });
});

// =========================
//        SERVIDOR
// =========================

app.listen(PORT, () =>
  console.log(`Servidor corriendo en el puerto ${PORT}`)
);
