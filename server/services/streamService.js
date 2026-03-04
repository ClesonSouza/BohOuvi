const fs = require("fs");
const path = require("path");
const { PLAYLIST_DIR } = require("../utils/paths");

function loadMusicFile(playlist, music) {
  const musicPath = path.join(PLAYLIST_DIR, playlist, music);

  if (!fs.existsSync(musicPath)) return null;

  return {
    path: musicPath,
    size: fs.statSync(musicPath).size
  };
}

module.exports = { loadMusicFile };