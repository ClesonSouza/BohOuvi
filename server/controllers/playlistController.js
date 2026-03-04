const path = require("path");
const fs = require("fs");
const { listPlaylists, removeMusic } = require("../services/playlistService");
const { downloadPlaylist } = require("../services/downloadPlaylist");
const { updatePlaylistService } = require("../services/updatePlaylist");
const { deletePlaylistService } = require("../services/deletePlaylist");
const { loadJsonPlaylist } = require("../services/jsonService");
const { loadMusicFile } = require("../services/streamService");
const { PLAYLIST_DIR } = require("../utils/paths");

// GET - Listar playlists
async function getPlaylist(req, res) {
  listPlaylists((err, playlists) => {
    if (err) {
      console.error("Erro lendo arquivos:", err);
      return res.status(500).json({ erro: "Erro ao listar arquivos" });
    }
    res.json(playlists);
  });
}

// POST - Criar playlist
async function createPlaylist(req, res) {
  const { playlistName, playlistUrl } = req.body;

  if (!playlistName || !playlistUrl) {
    return res.status(400).json({ erro: "Nome e URL são obrigatórios" });
  }

  const downloadDir = path.join(PLAYLIST_DIR, playlistName);

  if (!fs.existsSync(downloadDir)) {
    fs.mkdirSync(downloadDir, { recursive: true });
  }

  try {
    res.status(202).json({});
    await downloadPlaylist(playlistName, playlistUrl, downloadDir);
  } catch (error) {
    console.error("Erro ao criar playlist:", error);
    res.status(500).json({ erro: "Erro ao criar a playlist" });
  }
}

// PUT - Atualizar playlist
async function updatePlaylist(req, res) {
  const { playlistName, playlistUrl } = req.body;

  if (!playlistName || !playlistUrl) {
    return res.status(400).json({ erro: "Nome e URL são obrigatórios" });
  }

  try {
    updatePlaylistService(playlistName, playlistUrl);
    res.json({ message: "Atualização iniciada. Acompanhe o progresso!" });
  } catch (error) {
    console.error("Erro ao atualizar playlist:", error);
    res.status(500).json({ erro: "Falha ao atualizar a playlist" });
  }
}

// DELETE - Remover música da playlist
async function deleteMusic(req, res) {
  const { playlistName } = req.params;
  const { id } = req.body;

  removeMusic(playlistName, id, (err, success) => {
    if (err) {
      return res.status(err.status || 500).json({ erro: err.message });
    }
    res.json({ success });
  });
}

// DELETE - Deletar playlist
async function deletePlaylist(req, res) {
  const { playlistName } = req.params;

  try {
    deletePlaylistService(playlistName);
    res.status(200).json({});
  } catch (error) {
    console.error("Erro ao deletar playlist:", error);
    res.status(500).json({ error: "Erro ao deletar a playlist." });
  }
}

// GET - Arquivo Json
async function getJson(req, res) {
  try {
    let { playlist } = req.params;
    playlist = decodeURIComponent(playlist);

    const jsonData = loadJsonPlaylist(playlist);

    if (!jsonData) {
      return res.status(404).json({ error: "JSON não encontrado" });
    }

    res.setHeader("Content-Type", "application/json"); //Define com json
    res.send(jsonData); //Envia o arquivo

  } catch (err) {
    console.error("Erro JSON:", err);
    res.status(500).send("Erro JSON");
  }
}

// GET - Música
async function streamMusic(req, res) {
  try {
    let { playlist, music } = req.params;
    playlist = decodeURIComponent(playlist);
    music = decodeURIComponent(music);

    const file = loadMusicFile(playlist, music);

    if (!file) {
      return res.status(404).send("Arquivo não encontrado");
    }

    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Content-Length", file.size);
    res.setHeader("Accept-Ranges", "bytes"); //Pode carregar partes específicas

    const fileBuffer = fs.readFileSync(file.path);
    res.end(fileBuffer);
  } catch (err) {
    console.error("Erro no stream:", err);
    res.status(500).send("Erro no stream");
  }
}

module.exports = {
  getPlaylist,
  createPlaylist,
  updatePlaylist,
  deleteMusic,
  deletePlaylist,
  getJson,
  streamMusic,
};