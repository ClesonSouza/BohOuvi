const fs = require("fs");
const path = require("path");
const { JSON_DIR, PLAYLIST_DIR } = require("../utils/paths");

function deleteFolder(folderPath) {
    if (!fs.existsSync(folderPath)) return;

    fs.readdirSync(folderPath).forEach((file) => { //Executa a função para cada item
        const filePath = path.join(folderPath, file);
        if (fs.lstatSync(filePath).isDirectory()) {
            deleteFolder(filePath); //Se for pasta chama a função denovo para deletar os arquivos
        } else {
            fs.unlinkSync(filePath); //Se for arquivo deleta
        }
    });

    fs.rmdirSync(folderPath); //Remove a pasta vazia
}

function deletePlaylistService(playlistName) {
    const playlistPath = path.join(PLAYLIST_DIR, playlistName);
    const jsonPath = path.join(JSON_DIR, `${playlistName}.json`);

    let deletedPlaylist = false;
    let deletedJson = false;

    if (fs.existsSync(playlistPath)) {
        try {
            deleteFolder(playlistPath); //passa o caminho da playlist para ser deletada
            deletedPlaylist = true;
            console.log(`Pasta da playlist removida: ${playlistPath}`);
        } catch (err) {
            console.error("Erro ao remover pasta:", err);
        }
    } else {
        console.log(`Pasta da playlist não encontrada: ${playlistPath}`);
    }

    if (fs.existsSync(jsonPath)) {
        try {
            fs.unlinkSync(jsonPath); //Deleta o json da playlist
            deletedJson = true;
            console.log(`Arquivo JSON da playlist removido: ${jsonPath}`);
        } catch (err) {
            console.error("Erro ao remover JSON:", err);
        }
    } else {
        console.log(`Arquivo JSON da playlist não encontrado: ${jsonPath}`);
    }

    return { deletedPlaylist, deletedJson };
}

module.exports = { deletePlaylistService };