const fs = require("fs");
const path = require("path");
const { scrapingPlaylist } = require("./puppeteerService");
const { downloadAudio } = require("./downloadPlaylist");
const { clearTitle } = require("../utils/tinyUtils");
const { sendStatus } = require("../server");
const { createLogger } = require("../utils/logger");
const { JSON_DIR, PLAYLIST_DIR } = require("../utils/paths");

async function updatePlaylistService(playlistName, playlistUrl) {
    const logger = createLogger();
    const oldJsonPath = path.join(JSON_DIR, `${playlistName}.json`);

    if (!fs.existsSync(oldJsonPath)) {
        throw new Error("JSON da playlist não encontrado.");
    }

    // Lê o JSON atual da playlist
    const oldJson = JSON.parse(fs.readFileSync(oldJsonPath, "utf8"));
    const oldMusics = Array.isArray(oldJson.musicas) ? oldJson.musicas : [];
    const oldTitles = oldMusics.map(item => item.musica);

    sendStatus({
        type: "progression",
        message: "Verificando atualizações da playlist..."
    });

    // Busca nova lista de vídeos
    const newVideos = await scrapingPlaylist(playlistUrl);
    const newTitles = newVideos.map(v => v.title);

    // Detecta diferenças
    const addMusics = newVideos.filter(v => !oldTitles.includes(v.title)); // Novas
    const removeMusics = oldMusics.filter(item => !newTitles.includes(item.musica)); // Removidas

    if (addMusics.length === 0 && removeMusics.length === 0) {
        sendStatus({
            type: "done",
            message: "Nenhuma alteração encontrada na playlist."
        });
        return;
    }

    // Remove músicas que saíram da playlist
    removeMusics.forEach(item => {
        const musicPath = path.join("public", item.caminho);
        if (fs.existsSync(musicPath)) fs.unlinkSync(musicPath);
    });

    let completed = 0;

    // Baixa apenas as novas músicas e mantém a ordem original
    const downloads = newVideos.map(async (video) => {
        // Se já existe no JSON anterior, reaproveita
        const existing = oldMusics.find(item => item.musica === video.title);
        let jsonData = null;

        try {
            if (existing) {
                jsonData = existing;
            } else {
                // Faz download da nova música
                await downloadAudio(
                    video,
                    path.join(PLAYLIST_DIR, playlistName),
                    logger
                );

                const cleanTitle = clearTitle(video.title);

                jsonData = {
                    id: video.id,
                    musica: video.title,
                    cantor: video.channel,
                    caminho: `${playlistName}/${cleanTitle}.mp3`
                };
            }
        } catch (err) {
            // Se falhar o download, não quebra a atualização inteira
            logger.error(`Falha ao baixar "${video.title}": ${err.message}`);
            jsonData = null;
        }

        completed++;
        const percentage = Math.round((completed / newVideos.length) * 100);

        sendStatus({
            type: "percentage",
            percentage,
            title: video.title
        });

        return jsonData; // pode ser null se falhar
    });

    // Aguarda todos os downloads terminarem
    const newList = (await Promise.all(downloads)).filter(Boolean);

    // Garante que a ordem do novo JSON siga a da playlist no YouTube
    const orderedList = newTitles.map(title => newList.find(item => item.musica === title)).filter(Boolean);

    // Monta novo JSON atualizado
    const jsonCompleted = {
        playlist: playlistName,
        url: playlistUrl,
        musicas: orderedList
    };

    fs.writeFileSync(oldJsonPath, JSON.stringify(jsonCompleted, null, 2));

    sendStatus({
        type: "done",
        message: `Atualização concluída: ${addMusics.length} adicionada(s), ${removeMusics.length} removida(s).`
    });
    console.log("Atualizou");
}

module.exports = { updatePlaylistService };