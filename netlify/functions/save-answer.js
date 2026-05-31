const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Méthode non autorisée" }) };
  }

  const { date, row_index, col_index, movie_id, movie_title } = JSON.parse(event.body);

  if (!date || row_index === undefined || col_index === undefined || !movie_id || !movie_title) {
    return { statusCode: 400, body: JSON.stringify({ error: "Paramètres manquants" }) };
  }

  // Enregistrer la réponse
  const { error } = await supabase.from("answers").insert({
    date,
    row_index,
    col_index,
    movie_id,
    movie_title,
  });

  if (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }

  // Calculer le pourcentage de joueurs ayant trouvé ce film pour cette case
  const { count: totalAnswers } = await supabase
    .from("answers")
    .select("*", { count: "exact", head: true })
    .eq("date", date)
    .eq("row_index", row_index)
    .eq("col_index", col_index);

  const { count: movieCount } = await supabase
    .from("answers")
    .select("*", { count: "exact", head: true })
    .eq("date", date)
    .eq("row_index", row_index)
    .eq("col_index", col_index)
    .eq("movie_id", movie_id);

  const percentage = totalAnswers > 0 ? Math.round((movieCount / totalAnswers) * 100) : 100;

  return {
    statusCode: 200,
    body: JSON.stringify({ percentage }),
  };
};