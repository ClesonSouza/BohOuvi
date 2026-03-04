const fs = require("fs");
const path = require("path");
const { PUBLIC_DIR, JSON_DIR } = require("../utils/paths");

function listPlaylists(callback) {
  fs.readdir(JSON_DIR, (err, playlists) => { //Le todo o diretório
    if (err) return callback(err);
    const playlistNames = playlists.map(f => path.parse(f).name); //Remove a extensão
    callback(null, playlistNames);
  });
}

function removeMusic(playlist, idMusic, callback) {
  const jsonPath = path.join(JSON_DIR, `${playlist}.json`);
  if (!fs.existsSync(jsonPath)) {
    return callback({ status: 404, message: "Playlist não existe" });
  }

  fs.readFile(jsonPath, "utf8", (err, playlistJson) => {
    if (err) return callback({ status: 500, message: "Erro ao ler JSON" });

    let data;
    try {
      data = JSON.parse(playlistJson);
    } catch (e) {
      return callback({ status: 500, message: "JSON inválido" });
    }

    if (!Array.isArray(data.musicas)) {
      return callback({ status: 500, message: "Formato de playlist inválido" });
    }

    const idx = data.musicas.findIndex(m => m.id === idMusic);
    if (idx === -1) {
      return callback({ status: 404, message: "Música com este ID não encontrada" });
    }

    const [removed] = data.musicas.splice(idx, 1);//Splice edita o array original então aqui a musica sai do array

    fs.writeFile(jsonPath, JSON.stringify(data, null, 2), err => {
      if (err) return callback({ status: 500, message: "Erro ao escrever JSON" });

      const audioPath = path.join(PUBLIC_DIR, "Playlist", removed.caminho);

      fs.unlink(audioPath, unlinkErr => {
        if (unlinkErr) {
          console.warn("Não foi possível remover o áudio:", audioPath, unlinkErr.message);
        } else {
          console.log("Áudio removido:", removed.musica);
        }

        callback(null, true);
      });
    });
  });
}

module.exports = { listPlaylists, removeMusic };