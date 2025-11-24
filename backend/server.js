// backend/server.js
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { translateText } from "./deeplTranslate.js";

const app = express();

// CORS para producción
app.use(cors({
  origin: "*",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));

app.use(bodyParser.json());

// ===== FAVORITOS EN MEMORIA =====
let favorites = [];

// ===== LOGIN SIMPLE =====
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (email === "admin@gmail.com" && password === "123") {
    return res.json({
      token: "fake-jwt-token",
      user: { name: "Admin" }
    });
  }

  res.status(401).json({ error: "Credenciales incorrectas" });
});

// ===== GUARDAR FAVORITOS =====
app.post("/favorites", (req, res) => {
  favorites.push(req.body);
  res.json({ msg: "Guardado" });
});

// ===== LISTAR FAVORITOS =====
app.get("/favorites", (req, res) => {
  res.json(favorites);
});

// ===== TRADUCIR DESCRIPCIÓN =====
app.post("/translate", async (req, res) => {
  const { text } = req.body;

  try {
    const translated = await translateText(text);
    res.json({ translated });
  } catch (e) {
    res.status(500).json({ error: "Error al traducir" });
  }
});

// PUERTO DINÁMICO PARA RENDER
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Backend corriendo en puerto ${PORT}`);
});
