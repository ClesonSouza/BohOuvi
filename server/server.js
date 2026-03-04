const express = require("express");
const cors = require("cors");
const http = require("http");
const  WebSocket = require("ws");
const { initProjectPaths } = require("./utils/initPaths");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const PORT = 3002;

let clients = []; //Conexões abertas

wss.on("connection", (ws) => {
    console.log("Conexão estabelecida");
    clients.push(ws)
    
    ws.on("close", () => {
        clients = clients.filter(client => client !== ws);
        console.log("Conexão fechada");
    });
});

//Manda uma mensagem em JSON para o cliente conectado
function sendStatus(message) {
    clients.forEach(ws => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(message));
        }
    });
}

async function startServer() {
    await initProjectPaths();

    app.use(cors());
    app.use(express.json());

    const routes = require("./routes/playlistRoutes")
    app.use("/api", routes);

    server.listen(PORT, () => {
    console.log(`Servidor e WebSocket abertos na porta ${PORT}`);
});
}

startServer();

module.exports = {app, server, sendStatus};