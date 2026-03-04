const fs = require("fs");
const path = require("path");
const { LOG_DIR } = require("./paths");

if (!fs.existsSync(LOG_DIR)) { //Garantindo a pasta
  fs.mkdirSync(LOG_DIR, { recursive: true }); //Cria se não existir
}

// Limita a 4 arquivos de log
function cleanupOldLogs(maxLogs = 3) {
  const files = fs
    .readdirSync(LOG_DIR)
    .filter(f => f.endsWith(".txt")) //Vendo todos os arquivos da pasta
    .map(file => {
      const fullPath = path.join(LOG_DIR, file);
      const stats = fs.statSync(fullPath);
      return {
        file,
        time: stats.birthtime.getTime(), //Ve qual mais antigo
      };
    })
    .sort((a, b) => b.time - a.time);

  files.slice(maxLogs).forEach(({ file }) => {
    fs.unlinkSync(path.join(LOG_DIR, file)); //Apagando o mais antigo
  });
}

// Cria log por execução
function createLogger() {
  cleanupOldLogs();

  const logFile = path.join(
    LOG_DIR,
    `log-${new Date().toISOString().replace(/[:.]/g, "-")}.txt` //gerando nome do log
  );

  function log(level, message) {
    const line = `[${new Date().toLocaleString()}] [${level.toUpperCase()}] ${message}\n`;
    fs.appendFileSync(logFile, line);
    
    // Continua aparecendo no terminal
    if (level === "error") console.error(message);
    else if (level === "warn") console.warn(message);
    else console.log(message);
  }

  return { //Tipos de log
    info: (msg) => log("info", msg),
    warn: (msg) => log("warn", msg),
    error: (msg) => log("error", msg),
    file: logFile,
  };
}

module.exports = { createLogger };
