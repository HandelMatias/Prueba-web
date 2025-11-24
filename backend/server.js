// backend/server.js
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { translateText } from "./deeplTranslate.js";

const app = express();
app.use(cors());
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

// ===== 🔥 NUEVO ENDPOINT: TRADUCIR DESCRIPCIÓN =====
app.post("/translate", async (req, res) => {
  const { text } = req.body;

  try {
    const translated = await translateText(text);
    res.json({ translated });
  } catch (e) {
    res.status(500).json({ error: "Error al traducir" });
  }
});

app.listen(4000, () => {
  console.log("Backend corriendo en http://localhost:4000");
});
