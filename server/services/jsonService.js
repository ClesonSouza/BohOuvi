const fs = require("fs");
const path = require("path");
const { JSON_DIR } = require("../utils/paths");

function loadJsonPlaylist(playlist) {
  const jsonPath = path.join(JSON_DIR, `${playlist}.json`);

  if (!fs.existsSync(jsonPath)) return null;

  return fs.readFileSync(jsonPath, "utf-8"); //Lendo o arquivo
}

module.exports = { loadJsonPlaylist };