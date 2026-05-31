const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

exports.handler = async function () {
  const today = new Date().toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from("daily_grids")
    .select("rows, cols")
    .eq("date", today)
    .single();

  if (error || !data) {
    return {
      statusCode: 404,
      body: JSON.stringify({ error: "Pas de grille pour aujourd'hui." }),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ rows: data.rows, cols: data.cols }),
  };
};