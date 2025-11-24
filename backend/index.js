require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetchFn = global.fetch || ((...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args)));

const app = express();
const PORT = process.env.PORT || 4000;
const DEEPL_KEY = process.env.DEEPL_KEY || process.env.DEEPL_AUTH_KEY;
const DEEPL_API_URL = process.env.DEEPL_API_URL;

app.use(cors());
app.use(express.json());

// Utilidad de traducción (se usa en 2 endpoints)
const TRANSLATE_URLS = (process.env.TRANSLATE_URL || "https://libretranslate.de/translate,https://translate.astian.org/translate")
  .split(",")
  .map((u) => u.trim())
  .filter(Boolean);

async function translateWithMyMemory(text, targetLang, sourceLang) {
  const src = sourceLang === "AUTO" ? "en" : sourceLang.toLowerCase();
  const tgt = targetLang.toLowerCase();
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${src}|${tgt}`;

  const response = await fetchFn(url);
  if (!response.ok) throw new Error(`MyMemory HTTP ${response.status}`);

  const data = await response.json();
  const translated = data?.responseData?.translatedText;
  if (!translated) throw new Error("MyMemory sin traducción");

  return translated;
}

async function translateText(text, target = "es", source = "auto") {
  const targetLang = (target || "es").toUpperCase();
  const sourceLang = (source || "auto").toUpperCase();
  const deeplBase = DEEPL_API_URL || (DEEPL_KEY && DEEPL_KEY.includes(":fx") ? "https://api-free.deepl.com" : "https://api.deepl.com");

  // 1) DeepL si hay clave
  if (DEEPL_KEY) {
    try {
      const response = await fetchFn(`${deeplBase}/v2/translate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": `DeepL-Auth-Key ${DEEPL_KEY}`
        },
        body: new URLSearchParams({
          text,
          target_lang: targetLang,
          ...(sourceLang !== "AUTO" ? { source_lang: sourceLang } : {})
        })
      });

      if (!response.ok) {
        const body = await response.text();
        throw new Error(`DeepL HTTP ${response.status} body=${body}`);
      }

      const data = await response.json();
      const translated = data?.translations?.[0]?.text;
      if (translated) return translated;

      throw new Error(`DeepL sin traducción (${JSON.stringify(data)})`);
    } catch (err) {
      console.warn(`translateText DeepL falló: ${err.message}`);
    }
  }

  // 2) LibreTranslate y alternativos
  for (const url of TRANSLATE_URLS) {
    try {
      const response = await fetchFn(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          q: text,
          source: sourceLang === "AUTO" ? "auto" : sourceLang.toLowerCase(),
          target,
          format: "text"
        })
      });

      if (!response.ok) {
        const body = await response.text();
        throw new Error(`HTTP ${response.status} body=${body}`);
      }

      const contentType = (response.headers.get("content-type") || "").toLowerCase();
      if (!contentType.includes("application/json")) throw new Error("Respuesta no JSON");

      const data = await response.json();
      const translated = data.translatedText || data.translation;
      if (translated) return translated;

      throw new Error(`Sin campo translatedText (${JSON.stringify(data)})`);
    } catch (err) {
      console.warn(`translateText intento fallido en ${url}: ${err.message}`);
      continue;
    }
  }

  // 3) Fallback MyMemory (público)
  try {
    return await translateWithMyMemory(text, targetLang, sourceLang);
  } catch (err) {
    console.warn(`translateText MyMemory falló: ${err.message}`);
  }

  // 4) Fallback final
  return text;
}

// TRADUCCIÓN directa
app.post("/translate", async (req, res) => {
  const { text, target = "es", source = "auto" } = req.body || {};

  if (!text || !text.trim()) {
    return res.status(400).json({ message: "Texto requerido" });
  }

  try {
    const translated = await translateText(text, target, source);
    res.json({ translated });
  } catch (error) {
    console.error("/translate error", error.message);
    res.status(500).json({ message: "No se pudo traducir", fallback: text });
  }
});

// Descripción de libro + traducción (usa API pública desde el backend)
app.get("/books/:workId/description", async (req, res) => {
  const { workId } = req.params;
  const target = req.query.target || "es";

  if (!workId) return res.status(400).json({ message: "workId requerido" });

  try {
    const resp = await fetchFn(`https://openlibrary.org/works/${workId}.json`);
    if (!resp.ok) throw new Error(`OpenLibrary ${resp.status}`);

    const data = await resp.json();
    let desc = "No disponible.";
    if (typeof data.description === "string") desc = data.description;
    else if (data.description?.value) desc = data.description.value;

    let translated = desc;
    try {
      translated = await translateText(desc, target, "EN"); // descripciones suelen venir en inglés
    } catch (e) {
      console.error("translate description fallback", e.message);
    }

    res.json({ description: desc, translated });
  } catch (error) {
    console.error("/books/:workId/description error", error.message);
    res.status(500).json({ message: "No se pudo obtener la descripción" });
  }
});

// SERVIDOR
app.listen(PORT, () =>
  console.log(`API privada corriendo en http://localhost:${PORT}`)
);
