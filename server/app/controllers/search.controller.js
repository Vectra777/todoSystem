const db = require("../models");
const Team = db.teams;
const Employee = db.employees;
const { Op, fn, col, where } = db.Sequelize;


// Fuzzy/autocomplete search using Levenshtein distance for typo tolerance
function levenshtein(a, b) {
  if (!a) return b ? b.length : 0;
  if (!b) return a.length;
  a = a.toLowerCase();
  b = b.toLowerCase();
  const matrix = Array.from({ length: a.length + 1 }, () => []);
  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  return matrix[a.length][b.length];
}

function similarityScore(a, b) {
  const dist = levenshtein(a, b);
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  return 1 - dist / maxLen; // 1 = exact, 0 = completely different
}

exports.fuzzy = async (req, res) => {
  const q = (req.query.q || "").trim();
  if (!q)
    return res.status(400).send({ message: "Query parameter q is required" });

  try {
    // Fetch candidates (bounded) and compute similarity in JS
    const [teams, employees] = await Promise.all([
      Team.findAll({
        attributes: ["id", "team_name", "description"],
        limit: 200,
      }),
      Employee.findAll({
        attributes: ["id", "firstname", "lastname", "email", "role"],
        limit: 1000,
      }),
    ]);

    const qLower = q.toLowerCase();

    const teamResults = teams
      .map((t) => {
        const name = (t.team_name || "").toString();
        const desc = (t.description || "").toString();
        const nameScore = similarityScore(qLower, name.toLowerCase());
        const descScore = similarityScore(qLower, desc.toLowerCase());
        const score = Math.max(nameScore, descScore);
        return {
          type: "team",
          id: t.id,
          team_name: t.team_name,
          description: t.description,
          score,
        };
      })
      .filter((r) => r.score > 0.35);

    const employeeResults = employees
      .map((e) => {
        const fullname = `${e.firstname || ""} ${e.lastname || ""}`.trim();
        const firstScore = similarityScore(
          qLower,
          (e.firstname || "").toLowerCase()
        );
        const lastScore = similarityScore(
          qLower,
          (e.lastname || "").toLowerCase()
        );
        const fullScore = similarityScore(qLower, fullname.toLowerCase());
        const score = Math.max(firstScore, lastScore, fullScore);
        return {
          type: "employee",
          id: e.id,
          firstname: e.firstname,
          lastname: e.lastname,
          email: e.email,
          role: e.role,
          score,
        };
      })
      .filter((r) => r.score > 0.35);

    // Combine and sort by score desc
    const combined = [...teamResults, ...employeeResults]
      .sort((a, b) => b.score - a.score)
      .slice(0, 50);

    res.send({ query: q, results: combined });
  } catch (err) {
    res
      .status(500)
      .send({ message: err.message || "Error running fuzzy search" });
  }
};
