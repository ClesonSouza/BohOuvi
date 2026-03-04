import React, { useState } from "react";
import "./formDownload.css";

function FormDownload({ onSetDownloadStarted }) {
  const [playlistName, setPlaylistName] = useState("");
  const [playlistUrl, setPlaylistUrl] = useState("");

  async function sendForm(e) {
    e.preventDefault();

    if (!validation()) return; //Garantir que as informações são válidas

    try {
      const response = await fetch("http://localhost:3002/api/playlists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playlistName, playlistUrl }),
      });

      if (response.ok) {
        setPlaylistName("");
        setPlaylistUrl("");
        sessionStorage.setItem("downloadSession", "true")
        onSetDownloadStarted(true)
      } else {
        console.error("Erro ao enviar os dados");
      }
    } catch (error) {
      console.error("Erro na requisição:", error);
    }
  }

  function validation() {
    if (!folderValidation(playlistName)) {
      setPlaylistName("");
      alert("Esse não é um Nome válido para uma playlist!");
      return false;
    }

    if (!playlistUrl.includes("youtube.com/playlist?list=")) {
      //URL de playlist do youtube
      setPlaylistUrl("");
      alert("Esse não é um URL de playlist válido!");
      return false;
    }

    return true;
  }

  function folderValidation(folderName) {
    if (typeof folderName !== "string") return false;

    if (!folderName || folderName.trim().length === 0) return false;
    
    if (
      /[<>:"/\\|?*\x00-\x1F]|[.]$|^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(?:\..*)?$/i.test(
        folderName
      )
    )
      return false; // Verificar se a string tem caracteres inválidos

    if (folderName === "." || folderName === "..") return false;

    if (folderName.length > 255) return false;

    return true;
  }

  return (
    <>
      <form className="formDownload" onSubmit={sendForm}>
        <h2>Crie sua Playlist</h2>
        <div className="inputBox">
          <input
            id="playlist-name"
            type="text"
            value={playlistName}
            onChange={(e) => setPlaylistName(e.target.value)}
            onBlur={(e) => setPlaylistName(e.target.value.trim())} //Assim que sai de foco faz o trim
            required
          />
          <label htmlFor="playlist-name">Nome da Playlist</label>
        </div>

        <div className="inputBox">
          <input
            id="playlist-url"
            type="text"
            value={playlistUrl}
            onChange={(e) => setPlaylistUrl(e.target.value)}
            onBlur={(e) => setPlaylistUrl(e.target.value.trim())}
            required
          />
          <label htmlFor="playlist-url">URL da Playlist</label>
        </div>

        <button type="submit">Criar</button>
      </form>
    </>
  );
}

export default FormDownload;