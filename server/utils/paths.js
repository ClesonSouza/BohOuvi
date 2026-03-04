const path = require("path");

const PUBLIC_DIR = path.join(__dirname, "../../assets");
const JSON_DIR = path.join(__dirname, "../../assets/JsonPlaylist");
const PLAYLIST_DIR = path.join(__dirname, "../../assets/Playlist");
const LOG_DIR = path.join(__dirname, "../../downloadLog");
const YT_DLP_PATH = path.join(__dirname, "../../dependencies/yt-dlp.exe");
const FFMPEG_PATH = path.join(__dirname, "../../dependencies/ffmpeg-7.1-essentials_build/bin/ffmpeg.exe");

module.exports = {
    PUBLIC_DIR,
    JSON_DIR,
    PLAYLIST_DIR,
    LOG_DIR,
    YT_DLP_PATH,
    FFMPEG_PATH
};