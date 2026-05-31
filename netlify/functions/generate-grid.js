const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE = "https://api.themoviedb.org/3";
const MIN_VOTES = 1000;
const MIN_ANSWERS = 3;
const MAX_ANSWERS = 500;

const CATEGORIES = [
  { key: "withLeoDiCaprio",   label: "Avec : Leonardo DiCaprio", discover: "with_cast=6193"  },
  { key: "withBradPitt",      label: "Avec : Brad Pitt",         discover: "with_cast=287"   },
  { key: "withTomHanks",      label: "Avec : Tom Hanks",         discover: "with_cast=31"    },
  { key: "withMerylStreep",   label: "Avec : Meryl Streep",      discover: "with_cast=5064"  },
  { key: "withCateBlanchett", label: "Avec : Cate Blanchett",    discover: "with_cast=112"   },
  { key: "directedByScorsese",label: "Réalisé par Scorsese",     discover: "with_crew=1032"  },
  { key: "directedByNolan",   label: "Réalisé par Nolan",        discover: "with_crew=525"   },
  { key: "directedByKubrick", label: "Réalisé par Kubrick",      discover: "with_crew=240"   },
  { key: "before1980",        label: "Sorti avant 1980",         discover: "primary_release_date.lte=1979-12-31" },
  { key: "before2000",        label: "Sorti avant 2000",         discover: "primary_release_date.lte=1999-12-31" },
  { key: "after2010",         label: "Sorti après 2010",         discover: "primary_release_date.gte=2011-01-01" },
  { key: "decade80s",         label: "Années 80",                discover: "primary_release_date.gte=1980-01-01&primary_release_date.lte=1989-12-31" },
  { key: "decade90s",         label: "Années 90",                discover: "primary_release_date.gte=1990-01-01&primary_release_date.lte=1999-12-31" },
  { key: "decade00s",         label: "Années 2000",              discover: "primary_release_date.gte=2000-01-01&primary_release_date.lte=2009-12-31" },
  { key: "ratingAbove8",      label: "Note TMDB > 8.0",          discover: "vote_average.gte=8.0" },
  { key: "ratingAbove75",     label: "Note TMDB > 7.5",          discover: "vote_average.gte=7.5" },
  { key: "langEnglish",       label: "En langue anglaise",       discover: "with_original_language=en" },
  { key: "langFrench",        label: "En langue française",      discover: "with_original_language=fr" },
  { key: "genreHorror",       label: "Genre : Horreur",          discover: "with_genres=27"    },
  { key: "genreComedy",       label: "Genre : Comédie",          discover: "with_genres=35"    },
  { key: "genreSciFi",        label: "Genre : Science-Fiction",  discover: "with_genres=878"   },
  { key: "genreAnimation",    label: "Genre : Animation",        discover: "with_genres=16"    },
  { key: "genreAction",       label: "Genre : Action",           discover: "with_genres=28"    },
  { key: "genreRomance",      label: "Genre : Romance",          discover: "with_genres=10749" },
  { key: "genreDrama",        label: "Genre : Drame",            discover: "with_genres=18"    },
  { key: "genreThriller",     label: "Genre : Thriller",         discover: "with_genres=53"    },
];

async function countMovies(rowDiscover, colDiscover) {
  const url = `${TMDB_BASE}/discover/movie?api_key=${TMDB_API_KEY}&vote_count.gte=${MIN_VOTES}&${rowDiscover}&${colDiscover}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.total_results ?? 0;
}

function shuffle(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

exports.handler = async function () {
  const today = new Date().toISOString().slice(0, 10);

  // Vérifier si une grille existe déjà pour aujourd'hui
  const { data: existing } = await supabase
    .from("daily_grids")
    .select("date")
    .eq("date", today)
    .single();

  if (existing) {
    return { statusCode: 200, body: JSON.stringify({ message: "Grille déjà existante." }) };
  }

  // Essayer de trouver une combinaison valide
  let attempts = 0;
  while (attempts < 20) {
    attempts++;

    const shuffled = shuffle([...CATEGORIES]);
    const rowCats = shuffled.slice(0, 3);
    const colCats = shuffled.slice(3, 6);

    let valid = true;

    for (const row of rowCats) {
      for (const col of colCats) {
        const count = await countMovies(row.discover, col.discover);
        if (count < MIN_ANSWERS || count > MAX_ANSWERS) {
          valid = false;
          break;
        }
      }
      if (!valid) break;
    }

    if (valid) {
      const { error } = await supabase.from("daily_grids").insert({
        date: today,
        rows: rowCats.map(c => c.key),
        cols: colCats.map(c => c.key),
      });

      if (error) {
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
      }

      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "Grille générée !",
          rows: rowCats.map(c => c.label),
          cols: colCats.map(c => c.label),
        }),
      };
    }
  }

  return {
    statusCode: 500,
    body: JSON.stringify({ error: "Impossible de générer une grille valide après 20 essais." }),
  };
};
