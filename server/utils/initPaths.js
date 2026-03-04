const fs = require("fs");
const AdmZip = require("adm-zip");
const { Readable } = require("stream");
const path = require("path");
const { execSync } = require("child_process");

const {
  PUBLIC_DIR,
  JSON_DIR,
  PLAYLIST_DIR,
  YT_DLP_PATH,
  FFMPEG_PATH
} = require("./paths");

// Criar pasta se não existir
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true }); //Cria todas as pastas necessárias
  }
}

function deleteFolder(folderPath) {
  if (fs.existsSync(folderPath)) {
    fs.rmSync(folderPath, { recursive: true, force: true }); //Apagando tudo e ignora o erro se houver
  }
}

function getYtDlpVersion() {
  if (!fs.existsSync(YT_DLP_PATH)) return null;
  try {
    return execSync(`"${YT_DLP_PATH}" --version`, { stdio: "pipe" }) //pega esse output no código
      .toString()
      .trim();
  } catch {
    return null;
  }
}

// Acessando a api para ver qual a última versão
async function getLatestYtDlpVersion() {
  const res = await fetch(
    "https://api.github.com/repos/yt-dlp/yt-dlp/releases/latest",
    { headers: { "User-Agent": "node" } }
  );

  if (!res.ok) throw new Error("Erro ao buscar versão do yt-dlp");

  const data = await res.json();
  return data.tag_name; //Versão
}

async function updateYtDlpIfNeeded() {
  const localVersion = getYtDlpVersion();
  const latestVersion = await getLatestYtDlpVersion();

  if (localVersion !== latestVersion) {
    await downloadFile(
      "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe",
      YT_DLP_PATH
    );
  }
}

async function downloadFile(url, outputPath) {
  const res = await fetch(url); //Acessa a url que contem o download
  if (!res.ok) throw new Error("Erro: " + res.status);

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  const fileStream = fs.createWriteStream(outputPath); //Escrevendo o arquivo na memória

  const nodeStream = Readable.fromWeb(res.body); //Convertendo

  await new Promise((resolve, reject) => {
    nodeStream.pipe(fileStream); //Arquivo criado
    nodeStream.on("error", reject);
    fileStream.on("finish", resolve);
  });
}

async function downloadAndExtractZip(url, zipPath, extractPath) {
  await downloadFile(url, zipPath);

  const zip = new AdmZip(zipPath);
  zip.extractAllTo(extractPath, true); //Extraindo o Zip (sobrescreve arquivos existentes)

  fs.unlinkSync(zipPath); //Remove o .zip
}

async function initProjectPaths() {
  ensureDir(PUBLIC_DIR);
  ensureDir(JSON_DIR);
  ensureDir(PLAYLIST_DIR);
  ensureDir(path.dirname(YT_DLP_PATH));
  ensureDir(path.dirname(FFMPEG_PATH));

  // yt-dlp
  await updateYtDlpIfNeeded();

  // ffmpeg
  if (!fs.existsSync(FFMPEG_PATH)) {

    const ffmpegZip = path.join(path.dirname(FFMPEG_PATH), "ffmpeg.zip");
    const ffmpegFolder = path.join(path.dirname(FFMPEG_PATH), "ffmpeg-temp");

    await downloadAndExtractZip(
      "https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip",
      ffmpegZip,
      ffmpegFolder
    );

    // Procurando ffmpeg.exe dentro do zip
    function findFFmpegExe(dir) {
      const files = fs.readdirSync(dir, { withFileTypes: true }); //Retorna como (Dirent) para saber q é pasta/arquivo não string
      for (const file of files) { //Percorrendo todo o conteúdo
        const fullPath = path.join(dir, file.name);
        if (file.isDirectory()) { //Pasta
          const found = findFFmpegExe(fullPath);
          if (found) return found; //Chama a função recursivamente dentro dessa subpasta
        } else if (file.name === "ffmpeg.exe") { //Verificando se é o arquivo
          return fullPath;
        }
      }
    }

    const foundFFmpeg = findFFmpegExe(ffmpegFolder);
    if (!foundFFmpeg) throw new Error("ffmpeg.exe não encontrado no ZIP");

    fs.copyFileSync(foundFFmpeg, FFMPEG_PATH);//Coloca no lugara certo
    deleteFolder(ffmpegFolder); //Apagando a paste temporária
  }

  console.log("Iniciação Concluída!");
}

module.exports = { initProjectPaths };