const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");
const { scrapingPlaylist } = require("./puppeteerService");
const { clearTitle } = require("../utils/tinyUtils");
const { sendStatus } = require("../server");
const { createLogger } = require("../utils/logger");
const { JSON_DIR, YT_DLP_PATH, FFMPEG_PATH } = require("../utils/paths");

async function downloadAudio(video, downloadDir, logger, retries = 2) {
    const title = video.title;
    const cleanTitle = clearTitle(title);
    const outputTemplate = path.join(downloadDir, `${cleanTitle}.%(ext)s`);

    return new Promise((resolve, reject) => {
        const terminal = spawn(
            `"${YT_DLP_PATH}"`,
            [
                "--extract-audio",
                "--audio-format", "mp3",
                "--audio-quality", "0",
                "--ffmpeg-location", `"${FFMPEG_PATH}"`,
                "--output", `"${outputTemplate}"`,
                `https://www.youtube.com/watch?v=${video.id}`
            ],
            { shell: true }
        );

        terminal.stdout.on("data", data => { //Função para auxiliar enviando status mais organizados
            logger.info(`yt-dlp: ${data.toString().trim()}`); //Erro nessa linha
        });
    
        terminal.stderr.on("data", data => {
            logger.error(`yt-dlp erro: ${data.toString().trim()}`);
        });
    
        terminal.on("close", code => {
            if (code === 0) {
                logger.info(`Concluído: ${title}`);
                resolve(outputTemplate.replace("%(ext)s", "mp3"));
            } else {
                logger.warn(`Erro ao processar "${title}" (código ${code})`);
                if (retries > 0) {
                    logger.warn(`Tentando novamente "${title}"`);
                    resolve(downloadAudio(video, downloadDir, logger, retries - 1));
                } else {
                    reject(new Error(`Falha em ${title}`));
                }
            }
        });
    
        terminal.on("error", err => {
            logger.error(`Spawn error em "${title}": ${err.message}`);
            reject(err);
        });
    });
}

// Controle de concorrência
async function downloadLimited(tasks, limit = 10) {
    const results = [];
    let i = 0;

    async function runNext() {
        if (i >= tasks.length) return; //Contagem de musicas para baixar
        const currentIndex = i++;
        try {
            results[currentIndex] = await tasks[currentIndex](); //Liberando para a tarefa
        } catch (err) {
            results[currentIndex] = null;
        }
        await runNext();
    }

    const workers = Array(Math.min(limit, tasks.length)).fill(null).map(runNext); //Garante não criar mas workers do que tasks e vai preenchendo os 10 pra depois chamar dnv
    await Promise.all(workers);
    return results;
} //Monta a lista, cria 10 tarefas, 10 downloads simultâneos

async function downloadPlaylist(playlistName, playlistUrl, downloadDir) {
    const logger = createLogger();
    sendStatus({
        type: "progression",
        message: "Iniciando Busca...",
    });

    const videos = await scrapingPlaylist(playlistUrl);
    logger.info(`Encontrados ${videos.length} músicas`);
    
    sendStatus({
        type: "progression",
        message: `Playlist com ${videos.length} músicas`,
    });

    const jsonData = new Array(videos.length); //Array vazio do tamanho da playlist

    const tasks = videos.map((video, i) => async () => {
        try {
            await downloadAudio(video, downloadDir, logger);
            const cleanTitle = clearTitle(video.title);
            jsonData[i] = { //Preenchendo o array
                id: video.id,
                musica: video.title,
                cantor: video.channel,
                caminho: `${playlistName}/${cleanTitle}.mp3`,
            };
        } catch (err) {
            logger.error(`Falha ao baixar: ${video.title}`);
            jsonData[i] = null;
        }

        const progress = jsonData.filter(Boolean).length;
        const percentage = Math.round((progress / videos.length) * 100);
        sendStatus({ type: "percentage", message: progress, total: videos.length, percentage, title: video.title });
    });


    await downloadLimited(tasks, 10);

    sendStatus({
        type: "progression",
        message: "Gerando arquivo da playlist...",
    });

    const jsonCompleted = {
        playlist: playlistName,
        url: playlistUrl,
        musicas: jsonData.filter(Boolean),
    };

    const jsonPath = path.join(JSON_DIR, `${playlistName}.json`);
    fs.writeFileSync(jsonPath, JSON.stringify(jsonCompleted, null, 2));

    sendStatus({
        type: "done",
        message: "Download concluído!",
    });
    console.log("Playlist Baixada!");
}

module.exports = { downloadPlaylist, downloadAudio };