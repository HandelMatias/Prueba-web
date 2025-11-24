// backend/deeplTranslate.js

import fetch from "node-fetch";

// TOKEN PRIVADO DE DEEPL (SEGURO EN BACKEND)
const DEEPL_KEY = "206268c0-ec95-46d4-aaa2-9b4fd0857334:fx";

// Función para traducir texto
export async function translateText(text, target = "ES") {
  const url = "https://api-free.deepl.com/v2/translate";

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `DeepL-Auth-Key ${DEEPL_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      text: text,
      target_lang: target
    })
  });

  const data = await res.json();

  if (!data.translations) {
    return "No se pudo traducir.";
  }

  return data.translations[0].text;
}
