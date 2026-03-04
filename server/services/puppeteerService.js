const puppeteer = require("puppeteer");
const { sleep } = require("../utils/tinyUtils");
const { sendStatus } = require("../server");
async function scrapingPlaylist(url) {
  const browser = await puppeteer.launch({ headless: true }); //Se for false abre o navegador
  const page = await browser.newPage();

  console.log("Acessando a playlist...");
  sendStatus({
    type: "progression",
    message: "Acessando a playlist..."
  });

  await page.goto(url, { waitUntil: "networkidle2" }); //Acessando a URL e espera carregar

  let lastHeight = 0;
  while (true) {
    const newHeight = await page.evaluate("document.documentElement.scrollHeight"); //Executa esse código no console
    if (newHeight === lastHeight) break;
    lastHeight = newHeight;
    await page.evaluate("window.scrollTo(0, document.documentElement.scrollHeight)");
    await sleep(1500);
  }

  const videos = await page.evaluate(() => {
    const items = Array.from(document.querySelectorAll("ytd-playlist-video-renderer"));

    return items.map(video => {
      const titleElement = video.querySelector("#video-title");//Titulo do video
      const title = titleElement ? titleElement.textContent.trim() : "Sem título";

      const url = titleElement ? titleElement.href : "";//Id da url do video
      const id = url ? new URL(url).searchParams.get("v") : "";

      const channelElement = video.querySelector("ytd-channel-name a");//Nome do canal do video
      const channel = channelElement ? channelElement.textContent.trim() : "Sem canal";

      return { id, title, channel };
    });
  });

  await browser.close();

  console.log(`Músicas encontrados: ${videos.length}`);
  sendStatus({
    type: "progression",
    message: `Músicas encontradas: ${videos.length}`
  });

  return videos; //Retorna um array com todos os vídeos carregados
}

module.exports = { scrapingPlaylist };