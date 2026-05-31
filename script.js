// ============================================================
//  CINÉ-DOKU — JavaScript v5
// ============================================================

const MIN_VOTES = 1000;

// ============================================================
//  HELPERS DE VALIDATION
// ============================================================

function releaseYear(d) {
  return d.release_date ? parseInt(d.release_date.slice(0, 4)) : 0;
}
function hasGenre(d, id) {
  return (d.genres || []).some(g => g.id === id);
}
function hasCastMember(d, personId) {
  return (d.credits?.cast || []).some(p => p.id === personId);
}
function hasDirector(d, personId) {
  return (d.credits?.crew || []).some(p => p.job === "Director" && p.id === personId);
}
function isDirectedByWoman(d) {
  const dirs = (d.credits?.crew || []).filter(p => p.job === "Director");
  return dirs.length > 0 && dirs.some(p => p.gender === 1);
}

// ============================================================
//  DICTIONNAIRE DE CATÉGORIES
//  check(details)  → boolean (synchrone, credits inclus)
//  discover        → paramètres pour /discover/movie, null si non supporté
// ============================================================

const CATEGORIES = {

  // Casting
  withLeoDiCaprio:   { label: "Avec : Leonardo DiCaprio", check: d => hasCastMember(d, 6193), discover: "with_cast=6193"  },
  withBradPitt:      { label: "Avec : Brad Pitt",         check: d => hasCastMember(d, 287),  discover: "with_cast=287"   },
  withTomHanks:      { label: "Avec : Tom Hanks",         check: d => hasCastMember(d, 31),   discover: "with_cast=31"    },
  withMerylStreep:   { label: "Avec : Meryl Streep",      check: d => hasCastMember(d, 5064), discover: "with_cast=5064"  },
  withCateBlanchett: { label: "Avec : Cate Blanchett",    check: d => hasCastMember(d, 112),  discover: "with_cast=112"   },

  // Réalisation
  directedByWoman:    { label: "Réalisé par une femme", check: d => isDirectedByWoman(d),     discover: null           },
  directedByScorsese: { label: "Réalisé par Scorsese",  check: d => hasDirector(d, 1032),     discover: "with_crew=1032" },
  directedByNolan:    { label: "Réalisé par Nolan",     check: d => hasDirector(d, 525),      discover: "with_crew=525"  },
  directedByKubrick:  { label: "Réalisé par Kubrick",   check: d => hasDirector(d, 240),      discover: "with_crew=240"  },

  // Époque
  before1980: { label: "Sorti avant 1980", check: d => releaseYear(d) < 1980,                                          discover: "primary_release_date.lte=1979-12-31" },
  before2000: { label: "Sorti avant 2000", check: d => releaseYear(d) < 2000,                                          discover: "primary_release_date.lte=1999-12-31" },
  after2010:  { label: "Sorti après 2010", check: d => releaseYear(d) > 2010,                                          discover: "primary_release_date.gte=2011-01-01" },
  decade80s:  { label: "Années 80",        check: d => { const y = releaseYear(d); return y >= 1980 && y <= 1989; },   discover: "primary_release_date.gte=1980-01-01&primary_release_date.lte=1989-12-31" },
  decade90s:  { label: "Années 90",        check: d => { const y = releaseYear(d); return y >= 1990 && y <= 1999; },   discover: "primary_release_date.gte=1990-01-01&primary_release_date.lte=1999-12-31" },
  decade00s:  { label: "Années 2000",      check: d => { const y = releaseYear(d); return y >= 2000 && y <= 2009; },   discover: "primary_release_date.gte=2000-01-01&primary_release_date.lte=2009-12-31" },

  // Notes
  ratingAbove8:  { label: "Note TMDB > 8.0", check: d => d.vote_average > 8.0,                        discover: "vote_average.gte=8.0" },
  ratingAbove75: { label: "Note TMDB > 7.5", check: d => d.vote_average > 7.5,                        discover: "vote_average.gte=7.5" },
  ratingBelow6:  { label: "Note TMDB < 6.0", check: d => d.vote_average < 6.0 && d.vote_average > 0,  discover: "vote_average.lte=5.9" },
  ratingBelow55: { label: "Note TMDB < 5.5", check: d => d.vote_average < 5.5 && d.vote_average > 0,  discover: "vote_average.lte=5.4" },

  // Langue
  langEnglish:    { label: "En langue anglaise",         check: d => d.original_language === "en",                                        discover: "with_original_language=en"       },
  langFrench:     { label: "En langue française",        check: d => d.original_language === "fr",                                        discover: "with_original_language=fr"       },
  langAsian:      { label: "Langue asiatique",           check: d => ["ja","ko","zh","cn"].includes(d.original_language),                 discover: "with_original_language=ja|ko|zh" },
  langNonEnglish: { label: "Langue autre que l'anglais", check: d => d.original_language !== "en",                                        discover: null                              },
  langNonFrEn:    { label: "Langue autre que FR/EN",     check: d => d.original_language !== "fr" && d.original_language !== "en",        discover: null                              },

  // Genres
  genreHorror:    { label: "Genre : Horreur",          check: d => hasGenre(d, 27),    discover: "with_genres=27"    },
  genreComedy:    { label: "Genre : Comédie",          check: d => hasGenre(d, 35),    discover: "with_genres=35"    },
  genreSciFi:     { label: "Genre : Science-Fiction",  check: d => hasGenre(d, 878),   discover: "with_genres=878"   },
  genreAnimation: { label: "Genre : Animation",        check: d => hasGenre(d, 16),    discover: "with_genres=16"    },
  genreAction:    { label: "Genre : Action",           check: d => hasGenre(d, 28),    discover: "with_genres=28"    },
  genreRomance:   { label: "Genre : Romance",          check: d => hasGenre(d, 10749), discover: "with_genres=10749" },
  genreDrama:     { label: "Genre : Drame",            check: d => hasGenre(d, 18),    discover: "with_genres=18"    },
  genreThriller:  { label: "Genre : Thriller",         check: d => hasGenre(d, 53),    discover: "with_genres=53"    },
};

// ============================================================
//  GRILLE DU JOUR  —  modifier ces 6 clés pour changer la grille
// ============================================================

const TODAY_GRID = {
  rows: ["decade90s", "ratingAbove8", "before2000"],
  cols: ["withLeoDiCaprio", "genreAction", "genreHorror"],
};

// ============================================================
//  CACHE API
// ============================================================

const movieCache = {};
const countCache = {};

async function fetchMovieDetails(movieId) {
  if (movieCache[movieId]) return movieCache[movieId];
  const url  = `/.netlify/functions/tmdb?type=details&movieId=${movieId}`;
  const res  = await fetch(url);
  const data = await res.json();
  movieCache[movieId] = data;
  return data;
}

// ============================================================
//  COMPTAGE DES RÉPONSES POSSIBLES
// ============================================================

async function countValidMovies(row, col) {
  const key = `${row}-${col}`;
  if (countCache[key] !== undefined) return countCache[key];

  const rowDiscover = CATEGORIES[TODAY_GRID.rows[row]].discover;
  const colDiscover = CATEGORIES[TODAY_GRID.cols[col]].discover;

  if (!rowDiscover || !colDiscover) {
    countCache[key] = null;
    return null;
  }

  try {
    const url  = `/.netlify/functions/tmdb?type=discover&rowDiscover=${encodeURIComponent(rowDiscover)}&colDiscover=${encodeURIComponent(colDiscover)}`;
    const res  = await fetch(url);
    const data = await res.json();
    countCache[key] = data.total_results ?? 0;
  } catch {
    countCache[key] = null;
  }

  return countCache[key];
}

// ============================================================
//  VALIDATION D'UN FILM
// ============================================================

async function validateMovie(movieId, row, col) {
  const details = await fetchMovieDetails(movieId);
  const rowOk   = CATEGORIES[TODAY_GRID.rows[row]].check(details);
  const colOk   = CATEGORIES[TODAY_GRID.cols[col]].check(details);

  let reason = "ok";
  if (!rowOk && !colOk) reason = "both_fail";
  else if (!rowOk)       reason = "row_fail";
  else if (!colOk)       reason = "col_fail";

  return { valid: rowOk && colOk, reason, details };
}

// ============================================================
//  SYSTÈME DE SCORE
// ============================================================

function computeScore(details) {
  let calculSimule = 100 - (details.vote_count / 250);
  return Math.round(Math.max(15, Math.min(100, calculSimule)));
}

// ============================================================
//  ÉTAT DU JEU
// ============================================================

let totalScore   = 0;
let lives        = 3;
let activeCell   = null;
let usedMovies   = new Set();
let searchTimer  = null;
let isValidating = false;

// ============================================================
//  SÉLECTEURS DOM
// ============================================================

const modal        = document.getElementById("search-modal");
const searchInput  = document.getElementById("search-input");
const resultsList  = document.getElementById("results-list");
const closeBtn     = document.getElementById("close-modal");
const scoreDisplay = document.getElementById("score-display");
const livesDisplay = document.getElementById("lives-display");
const cellHint     = document.getElementById("cell-hint");

// ============================================================
//  INIT GRILLE
// ============================================================

function initGrid() {
  TODAY_GRID.cols.forEach((key, i) => {
    document.getElementById(`col-header-${i}`).textContent = CATEGORIES[key].label;
  });
  TODAY_GRID.rows.forEach((key, i) => {
    document.getElementById(`row-header-${i}`).textContent = CATEGORIES[key].label;
  });
}

// ============================================================
//  AFFICHAGE STATS
// ============================================================

function updateStats() {
  scoreDisplay.textContent = `Score : ${totalScore} / 900`;
  livesDisplay.textContent = "❤️".repeat(lives) + "🖤".repeat(3 - lives);
}

function setModalMessage(html, color = "#aaa") {
  resultsList.innerHTML = `<li style="padding:10px;color:${color};line-height:1.5;">${html}</li>`;
}

// ============================================================
//  VIES & FIN DE PARTIE
// ============================================================

function loseLife() {
  lives--;
  updateStats();
  if (lives <= 0) {
    closeModal();
    setTimeout(() => endGame(false), 300);
  }
}

function checkWin() {
  if (document.querySelectorAll(".game-cell").length === 0) {
    setTimeout(() => endGame(true), 400);
  }
}

function endGame(win) {
  const filled = 9 - document.querySelectorAll(".game-cell").length;
  const title  = win ? "🎬 Grille complétée !" : "💀 Game Over";
  const body   = win
    ? `Score final : ${totalScore} / 900`
    : `Tu as complété ${filled}/9 cases.\nScore : ${totalScore} / 900`;

  document.querySelector(".modal-content").innerHTML = `
    <h2 style="color:#e50914;margin-top:0;">${title}</h2>
    <p style="color:#ccc;white-space:pre-line;font-size:16px;">${body}</p>
    <button onclick="shareResult()"
      style="margin-top:16px;padding:12px 20px;background:#e50914;color:white;
             border:none;border-radius:6px;cursor:pointer;font-size:15px;width:100%;font-weight:bold;">
      📤 Partager mon résultat
    </button>
  `;
  modal.classList.remove("hidden");
}

// ============================================================
//  PARTAGE WORDLE-STYLE  🟩🟥
// ============================================================

function buildShareEmoji() {
  let out = "";
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      out += document.querySelector(`.game-cell[data-row="${r}"][data-col="${c}"]`) ? "🟥" : "🟩";
    }
    out += "\n";
  }
  return out;
}

function shareResult() {
  const date = new Date().toLocaleDateString("fr-FR");
  const text = `🎬 Ciné-Doku — ${date}\nScore : ${totalScore}/900\n\n${buildShareEmoji()}`;
  if (navigator.share) {
    navigator.share({ text }).catch(() => copyToClipboard(text));
  } else {
    copyToClipboard(text);
  }
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => alert("Résultat copié !"));
}

// ============================================================
//  REMPLISSAGE D'UNE CASE VALIDÉE
// ============================================================

function fillCell(cellEl, details, points) {
  const title  = details.title || details.original_title;
  const year   = details.release_date ? details.release_date.slice(0, 4) : "?";
  const poster = details.poster_path
    ? `<img src="https://image.tmdb.org/t/p/w92${details.poster_path}" style="width:48px;border-radius:4px;margin-bottom:6px;">`
    : "🎬";
  const pointsColor = points >= 70 ? "#d4a000" : points >= 40 ? "#2a3659" : "#6c7a9c";

  cellEl.innerHTML = `
    ${poster}
    <span style="font-family:'Montserrat',sans-serif;font-size:11px;font-weight:bold;line-height:1.2;margin-top:4px;color:#1c2841;">${title}</span>
    <span style="font-size:10px;color:#6c7a9c;margin-top:2px;">${year}</span>
    <span style="font-family:'Montserrat',sans-serif;font-size:12px;font-weight:bold;color:${pointsColor};margin-top:4px;">+${points} pts</span>
  `;
  cellEl.style.background  = "#ffffff";
  cellEl.style.border      = "2px solid #f3c623";
  cellEl.style.boxShadow   = "0 4px 15px rgba(243, 198, 35, 0.2)";
  cellEl.style.cursor      = "default";
  cellEl.classList.remove("game-cell");
  cellEl.removeEventListener("click", onCellClick);
}

// ============================================================
//  SÉLECTION D'UN FILM
// ============================================================

async function onMovieSelected(movieId) {
  if (!activeCell || isValidating) return;
  isValidating = true;

  const { row, col, element } = activeCell;
  setModalMessage("⏳ Vérification en cours...", "#e50914");
  searchInput.disabled = true;

  try {
    const { valid, reason, details } = await validateMovie(movieId, row, col);

    if (valid) {
      const pts = computeScore(details);
      totalScore += pts;
      usedMovies.add(movieId);
      fillCell(element, details, pts);
      updateStats();
      closeModal();
      checkWin();
    } else {
      totalScore = Math.max(0, totalScore - 20);

      const msgs = {
        both_fail: "❌ Ce film ne respecte ni la ligne, ni la colonne.",
        row_fail:  "❌ Ce film ne respecte pas la <strong>ligne</strong>.",
        col_fail:  "❌ Ce film ne respecte pas la <strong>colonne</strong>.",
      };
      setModalMessage(msgs[reason] || "❌ Mauvaise réponse.", "#e50914");

      loseLife();
      searchInput.disabled = false;
      searchInput.focus();
    }
  } catch {
    setModalMessage("🌐 Erreur réseau. Réessaie.", "#888");
    searchInput.disabled = false;
  } finally {
    isValidating = false;
  }
}

// ============================================================
//  RECHERCHE TMDB
// ============================================================

async function searchMovies(query) {
  if (!query || query.length < 2) { resultsList.innerHTML = ""; return; }

  try {
    const url  = `/.netlify/functions/tmdb?type=search&query=${encodeURIComponent(query)}`;
    const res  = await fetch(url);
    const data = await res.json();

    const movies = (data.results || [])
      .filter(m => m.vote_count >= MIN_VOTES && !usedMovies.has(m.id))
      .slice(0, 8);

    resultsList.innerHTML = "";

    if (!movies.length) {
      setModalMessage("Aucun résultat. Essaie un titre plus connu !");
      return;
    }

    movies.forEach(m => {
      const li = document.createElement("li");
      li.className = "result-item";
      li.style.display = "flex";
      li.style.alignItems = "center";

      const poster = m.poster_path
        ? `<img src="https://image.tmdb.org/t/p/w92${m.poster_path}" style="width: 35px; height: 50px; object-fit: cover; border-radius: 4px; margin-right: 12px; flex-shrink: 0;">`
        : `<div style="width: 35px; height: 50px; background: #444; border-radius: 4px; margin-right: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">🎬</div>`;

      li.innerHTML = `${poster} <span style="font-weight: bold; font-size: 15px; line-height: 1.2;">${m.title}</span>`;

      li.addEventListener("click", () => onMovieSelected(m.id));
      resultsList.appendChild(li);
    });

  } catch {
    setModalMessage("Erreur de recherche.", "#888");
  }
}

// ============================================================
//  MODALE
// ============================================================

async function openModal(row, col, element) {
  if (lives <= 0) return;
  activeCell            = { row, col, element };
  searchInput.value     = "";
  searchInput.disabled  = false;
  resultsList.innerHTML = "";
  cellHint.textContent  = "⏳ Calcul des réponses possibles…";

  element.innerHTML = `<span style="font-size:12px; color:#666;">⏳...</span>`;

  modal.classList.remove("hidden");
  searchInput.focus();

  const count = await countValidMovies(row, col);

  if (count === null) {
    cellHint.textContent = "🎬 Impossible de deviner le nombre exact pour ce croisement.";
    element.innerHTML = `<span style="font-size:18px; font-weight:bold; color:#555;">🎬 ?</span>`;
  } else {
    cellHint.textContent = `🎬 ${count} réponse${count > 1 ? "s" : ""} possible${count > 1 ? "s" : ""} pour cette case`;
    element.innerHTML = `<span style="font-size:18px; font-weight:bold; color:#888;">🎬 ${count}</span>`;
  }
}

function closeModal() {
  modal.classList.add("hidden");
  activeCell           = null;
  cellHint.textContent = "";
}

// ============================================================
//  ÉVÉNEMENTS
// ============================================================

function onCellClick(e) {
  const el = e.currentTarget;
  openModal(parseInt(el.dataset.row), parseInt(el.dataset.col), el);
}

document.querySelectorAll(".game-cell").forEach(cell => {
  cell.addEventListener("click", onCellClick);
});

searchInput.addEventListener("input", () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => searchMovies(searchInput.value.trim()), 400);
});

closeBtn.addEventListener("click", closeModal);
modal.addEventListener("click", e => { if (e.target === modal) closeModal(); });

// ============================================================
//  DÉMARRAGE
// ============================================================

initGrid();
updateStats();
