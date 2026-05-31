const fetch = require("node-fetch");

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE    = "https://api.themoviedb.org/3";
const MIN_VOTES    = 1000;

exports.handler = async function (event) {
  const { type, movieId, query, rowDiscover, colDiscover } = event.queryStringParameters;

  try {

    // 1. Détails d'un film (pour valider une réponse)
    if (type === "details") {
      const url = `${TMDB_BASE}/movie/${movieId}?api_key=${TMDB_API_KEY}&language=fr-FR&append_to_response=credits`;
      const res  = await fetch(url);
      const data = await res.json();
      return { statusCode: 200, body: JSON.stringify(data) };
    }

    // 2. Recherche d'un film (barre de recherche)
    if (type === "search") {
      const url = `${TMDB_BASE}/search/movie?api_key=${TMDB_API_KEY}&language=fr-FR&query=${encodeURIComponent(query)}`;
      const res  = await fetch(url);
      const data = await res.json();
      return { statusCode: 200, body: JSON.stringify(data) };
    }

    // 3. Comptage des réponses possibles
    if (type === "discover") {
      const url = `${TMDB_BASE}/discover/movie?api_key=${TMDB_API_KEY}&vote_count.gte=${MIN_VOTES}&${rowDiscover}&${colDiscover}`;
      const res  = await fetch(url);
      const data = await res.json();
      return { statusCode: 200, body: JSON.stringify(data) };
    }

    return { statusCode: 400, body: JSON.stringify({ error: "Type inconnu" }) };

  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};