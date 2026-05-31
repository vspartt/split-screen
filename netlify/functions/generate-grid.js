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

const CATEGORY_GROUPS = {

  // ── ACTEURS INTERNATIONAUX ──────────────────────────────────────────
  casting_intl: [
    { key: "withLeoDiCaprio",    label: "Avec : Leonardo DiCaprio",  discover: "with_cast=6193"   },
    { key: "withBradPitt",       label: "Avec : Brad Pitt",          discover: "with_cast=287"    },
    { key: "withTomHanks",       label: "Avec : Tom Hanks",          discover: "with_cast=31"     },
    { key: "withMerylStreep",    label: "Avec : Meryl Streep",       discover: "with_cast=5064"   },
    { key: "withCateBlanchett",  label: "Avec : Cate Blanchett",     discover: "with_cast=112"    },
    { key: "withRobertDeNiro",   label: "Avec : Robert De Niro",     discover: "with_cast=380"    },
    { key: "withAlPacino",       label: "Avec : Al Pacino",          discover: "with_cast=1158"   },
    { key: "withDenzelWashington",label: "Avec : Denzel Washington", discover: "with_cast=5292"   },
    { key: "withMorganFreeman",  label: "Avec : Morgan Freeman",     discover: "with_cast=192"    },
    { key: "withAnthonyHopkins", label: "Avec : Anthony Hopkins",    discover: "with_cast=4173"   },
    { key: "withJackNicholson",  label: "Avec : Jack Nicholson",     discover: "with_cast=514"    },
    { key: "withJoaquinPhoenix", label: "Avec : Joaquin Phoenix",    discover: "with_cast=73421"  },
    { key: "withChristianBale",  label: "Avec : Christian Bale",     discover: "with_cast=3894"   },
    { key: "withMattDamon",      label: "Avec : Matt Damon",         discover: "with_cast=1892"   },
    { key: "withRyanGosling",    label: "Avec : Ryan Gosling",       discover: "with_cast=30614"  },
    { key: "withKeanuReeves",    label: "Avec : Keanu Reeves",       discover: "with_cast=6384"   },
    { key: "withWillSmith",      label: "Avec : Will Smith",         discover: "with_cast=2888"   },
    { key: "withSamuelLJackson", label: "Avec : Samuel L. Jackson",  discover: "with_cast=2231"   },
    { key: "withJohnnyDepp",     label: "Avec : Johnny Depp",        discover: "with_cast=85"     },
    { key: "withDustinHoffman",  label: "Avec : Dustin Hoffman",     discover: "with_cast=1184"   },
    { key: "withBruceWillis",    label: "Avec : Bruce Willis",       discover: "with_cast=62"     },
    { key: "withSylvesterStallone", label: "Avec : Sylvester Stallone", discover: "with_cast=16483" },
    { key: "withArnoldSchwarzenegger", label: "Avec : Arnold Schwarzenegger", discover: "with_cast=1100" },
    { key: "withNicolasKidman",  label: "Avec : Nicole Kidman",      discover: "with_cast=2227"   },
    { key: "withCharlizetTheron", label: "Avec : Charlize Theron",   discover: "with_cast=6885"   },
    { key: "withNataliePortman", label: "Avec : Natalie Portman",    discover: "with_cast=524"    },
    { key: "withScarlettJohansson", label: "Avec : Scarlett Johansson", discover: "with_cast=1245" },
    { key: "withAngelinaJolie",  label: "Avec : Angelina Jolie",     discover: "with_cast=11701"  },
    { key: "withJuliaRoberts",   label: "Avec : Julia Roberts",      discover: "with_cast=1204"   },
    { key: "withSandraOh",       label: "Avec : Sandra Bullock",     discover: "with_cast=2179"   },
    { key: "withJodiFoster",     label: "Avec : Jodie Foster",       discover: "with_cast=3932"   },
    { key: "withSigourneyWeaver", label: "Avec : Sigourney Weaver",  discover: "with_cast=10205"  },
  ],

  // ── ACTEURS FRANÇAIS ────────────────────────────────────────────────
  casting_fr: [
    { key: "withJeanReno",       label: "Avec : Jean Reno",          discover: "with_cast=3061"   },
    { key: "withVincentCassel",  label: "Avec : Vincent Cassel",     discover: "with_cast=1331"   },
    { key: "withOmarSy",         label: "Avec : Omar Sy",            discover: "with_cast=55730"  },
    { key: "withMarionCotillard",label: "Avec : Marion Cotillard",   discover: "with_cast=7421"   },
    { key: "withAudreyTautou",   label: "Avec : Audrey Tautou",      discover: "with_cast=6729"   },
    { key: "withGerardDepardieu",label: "Avec : Gérard Depardieu",   discover: "with_cast=463"    },
    { key: "withAlainDelon",     label: "Avec : Alain Delon",        discover: "with_cast=1248"   },
    { key: "withJeanPaulBelmondo",label: "Avec : Jean-Paul Belmondo",discover: "with_cast=1062"   },
    { key: "withIsabelleHuppert",label: "Avec : Isabelle Huppert",   discover: "with_cast=2734"   },
    { key: "withSophieMarceau",  label: "Avec : Sophie Marceau",     discover: "with_cast=18987"  },
    { key: "withCatherineDeneuve",label: "Avec : Catherine Deneuve", discover: "with_cast=2262"   },
  ],

  // ── RÉALISATEURS ────────────────────────────────────────────────────
  director: [
    { key: "directedByScorsese",  label: "Réalisé par Scorsese",       discover: "with_crew=1032"  },
    { key: "directedByNolan",     label: "Réalisé par Nolan",          discover: "with_crew=525"   },
    { key: "directedByKubrick",   label: "Réalisé par Kubrick",        discover: "with_crew=240"   },
    { key: "directedBySpielberg", label: "Réalisé par Spielberg",      discover: "with_crew=488"   },
    { key: "directedByTarantino", label: "Réalisé par Tarantino",      discover: "with_crew=138"   },
    { key: "directedByCoppola",   label: "Réalisé par Coppola",        discover: "with_crew=1776"  },
    { key: "directedByFincher",   label: "Réalisé par Fincher",        discover: "with_crew=7467"  },
    { key: "directedByRidleyScott",label: "Réalisé par Ridley Scott",  discover: "with_crew=578"   },
    { key: "directedByTimBurton", label: "Réalisé par Tim Burton",     discover: "with_crew=510"   },
    { key: "directedByEastwood",  label: "Réalisé par Clint Eastwood", discover: "with_crew=190"   },
    { key: "directedByWoodyAllen",label: "Réalisé par Woody Allen",    discover: "with_crew=1243"  },
    { key: "directedByWesAnderson",label: "Réalisé par Wes Anderson",  discover: "with_crew=5655"  },
    { key: "directedByVilleneuve",label: "Réalisé par Villeneuve",     discover: "with_crew=137427"},
    { key: "directedByCameron",   label: "Réalisé par James Cameron",  discover: "with_crew=2710"  },
    { key: "directedByLynch",     label: "Réalisé par David Lynch",    discover: "with_crew=5765"  },
    { key: "directedByWoman",     label: "Réalisé par une femme",      discover: null              },
  ],

  // ── ÉPOQUES ─────────────────────────────────────────────────────────
  decade: [
    { key: "before1980", label: "Sorti avant 1980", discover: "primary_release_date.lte=1979-12-31" },
    { key: "decade80s",  label: "Années 80",        discover: "primary_release_date.gte=1980-01-01&primary_release_date.lte=1989-12-31" },
    { key: "decade90s",  label: "Années 90",        discover: "primary_release_date.gte=1990-01-01&primary_release_date.lte=1999-12-31" },
    { key: "decade00s",  label: "Années 2000",      discover: "primary_release_date.gte=2000-01-01&primary_release_date.lte=2009-12-31" },
    { key: "after2010",  label: "Sorti après 2010", discover: "primary_release_date.gte=2011-01-01" },
  ],

  // ── NOTES ───────────────────────────────────────────────────────────
  rating: [
    { key: "ratingAbove8",  label: "Note TMDB > 8.0", discover: "vote_average.gte=8.0" },
    { key: "ratingAbove75", label: "Note TMDB > 7.5", discover: "vote_average.gte=7.5" },
  ],

  // ── GENRES ──────────────────────────────────────────────────────────
  genre: [
    { key: "genreHorror",    label: "Genre : Horreur",         discover: "with_genres=27"    },
    { key: "genreComedy",    label: "Genre : Comédie",         discover: "with_genres=35"    },
    { key: "genreSciFi",     label: "Genre : Science-Fiction", discover: "with_genres=878"   },
    { key: "genreAnimation", label: "Genre : Animation",       discover: "with_genres=16"    },
    { key: "genreAction",    label: "Genre : Action",          discover: "with_genres=28"    },
    { key: "genreRomance",   label: "Genre : Romance",         discover: "with_genres=10749" },
    { key: "genreDrama",     label: "Genre : Drame",           discover: "with_genres=18"    },
    { key: "genreThriller",  label: "Genre : Thriller",        discover: "with_genres=53"    },
    { key: "genreWestern",   label: "Genre : Western",         discover: "with_genres=37"    },
    { key: "genreMusical",   label: "Genre : Musical",         discover: "with_genres=10402" },
    { key: "genreWar",       label: "Genre : Guerre",          discover: "with_genres=10752" },
    { key: "genreCrime",     label: "Genre : Crime",           discover: "with_genres=80"    },
  ],

  // ── LANGUES ─────────────────────────────────────────────────────────
  language: [
    { key: "langEnglish", label: "En langue anglaise",  discover: "with_original_language=en" },
    { key: "langFrench",  label: "En langue française", discover: "with_original_language=fr" },
    { key: "langSpanish", label: "En langue espagnole", discover: "with_original_language=es" },
    { key: "langItalian", label: "En langue italienne", discover: "with_original_language=it" },
    { key: "langJapanese",label: "En langue japonaise", discover: "with_original_language=ja" },
    { key: "langKorean",  label: "En langue coréenne",  discover: "with_original_language=ko" },
  ],
};

async function countMovies(rowDiscover, colDiscover) {
  // On saute les catégories sans discover (ex: réalisé par une femme)
  if (!rowDiscover || !colDiscover) return null;
  const url = `${TMDB_BASE}/discover/movie?api_key=${TMDB_API_KEY}&vote_count.gte=${MIN_VOTES}&${rowDiscover}&${colDiscover}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.total_results ?? 0;
}

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function pickCategories() {
  // On choisit 6 groupes différents
  const groupNames = shuffle(Object.keys(CATEGORY_GROUPS));
  const selected = groupNames.slice(0, 6);

  const cats = selected.map(g => {
    const group = CATEGORY_GROUPS[g];
    return group[Math.floor(Math.random() * group.length)];
  });

  return {
    rowCats: cats.slice(0, 3),
    colCats: cats.slice(3, 6),
  };
}

exports.handler = async function () {
  const today = new Date().toISOString().slice(0, 10);

  const { data: existing } = await supabase
    .from("daily_grids")
    .select("date")
    .eq("date", today)
    .single();

  if (existing) {
    return { statusCode: 200, body: JSON.stringify({ message: "Grille déjà existante." }) };
  }

  let attempts = 0;
  while (attempts < 50) {
    attempts++;

    const { rowCats, colCats } = pickCategories();
    let valid = true;

    for (const row of rowCats) {
      for (const col of colCats) {
        const count = await countMovies(row.discover, col.discover);
        // Si null (catégorie sans discover), on ignore cette case
        if (count === null) continue;
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
          message: `Grille générée en ${attempts} essai(s) !`,
          rows: rowCats.map(c => c.label),
          cols: colCats.map(c => c.label),
        }),
      };
    }
  }

  return {
    statusCode: 500,
    body: JSON.stringify({ error: "Impossible de générer une grille valide après 50 essais." }),
  };
};
