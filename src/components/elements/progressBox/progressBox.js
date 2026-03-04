import React, { useEffect, useRef, useState } from "react";
import "./progressBox.css";

function ProgressBox({ onSetDownloadStarted, onRefreshPlaylist }) {
  const socketRef = useRef(null); //Valor persistente entre renders

  const [status, setStatus] = useState(
    () => sessionStorage.getItem("status") || ""
  ); //Status enviado do backend

  const [progress, setProgress] = useState(() => {
    const value = sessionStorage.getItem("progress");
    return value !== null ? Number(value) : 0;
  }); //Porcentagem de download

  const [currentMusic, setCurrentMusic] = useState(
    () => sessionStorage.getItem("currentMusic") || ""
  ); //Musica atual q está sendo baixada

  useEffect(() => {
    //Entrando no webSocket
    if (socketRef.current) return; //Já entrou

    const socket = new WebSocket("ws://localhost:3002");
    socketRef.current = socket;

    socket.onopen = () => {
      //Conexão estabelecida
      console.log("WebSocket conectado");
    };

    socket.onerror = (err) => {
      console.error("WebSocket erro:", err);
    };

    socket.onclose = () => {
      //Conexão fechada
      console.log("WebSocket desconectado");
    };

    socket.onmessage = (e) => {
      //Evento de receber mensagens no backend
      try {
        const msg = JSON.parse(e.data); //transforma o q chegou do backend em json

        if (msg.type === "progression") {
          //Mensagem sobre progresso
          setStatus(msg.message);
          sessionStorage.setItem("status", msg.message);
        } else if (msg.type === "percentage") {
          //Mensagem sobre porcentagem de conclusão
          setProgress(msg.percentage ?? 0);
          setCurrentMusic(msg.title || "");

          sessionStorage.setItem("progress", String(msg.percentage ?? 0));
          sessionStorage.setItem("currentMusic", msg.title || "");
        } else if (msg.type === "done") {
          //Mensagem que concluiu no backend
          setStatus(msg.message);
          setProgress(100);

          sessionStorage.setItem("status", msg.message);
          sessionStorage.setItem("progress", "100"); 
          onRefreshPlaylist(); //Para quando Atualiza
        }
      } catch (err) {
        console.error("Erro ao processar mensagem WebSocket:", err);
      }
    };

    return () => {
      socket.close();
      socketRef.current = null;
    }; //Quando acaba encera a conexão
  }, [onSetDownloadStarted, onRefreshPlaylist]);

  useEffect(() => {
    if(progress === 100){
      setTimeout(() => {
        alert(status);
      }, 600);  
      setTimeout(() => {
        sessionStorage.removeItem("status");
        sessionStorage.removeItem("progress");
        sessionStorage.removeItem("currentMusic");
        sessionStorage.removeItem("downloadSession");
        onSetDownloadStarted(false);
      }, 800);
    }
  }, [progress, status, onSetDownloadStarted])

  return (
    <div className="formDownload">
      {status && <p>{status}</p>}

      <p>
        {currentMusic ? `Baixando: ${currentMusic}` : "Preparando download..."}
      </p>

      <div className="progressBar">
        <div className="progressBarFill" style={{ width: `${progress}%` }} />
      </div>

      <p>{progress}% concluído</p>
    </div>
  );
}

export default ProgressBox;