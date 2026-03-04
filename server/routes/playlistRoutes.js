const express = require("express");
const router = express.Router();
const { getPlaylist, createPlaylist, updatePlaylist, deleteMusic, deletePlaylist, getJson, streamMusic, } = require("../controllers/playlistController");

router.get("/playlists", getPlaylist);
router.post("/playlists", createPlaylist);
router.put("/playlists/update", updatePlaylist);
router.delete("/playlists/delete/:playlistName/music", deleteMusic);
router.delete("/playlists/delete/:playlistName", deletePlaylist);

//Envio de arquivos
router.get("/json/:playlist", getJson);
router.get("/stream/:playlist/:music", streamMusic);

module.exports = router;