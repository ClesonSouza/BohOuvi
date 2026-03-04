import React, { useEffect, useRef, useState } from 'react';
import './musicPlayer.css';

function MusicPlayer({
  data,
  index,
  dontPlay,
  queue,
  volume,
  isRandom,
  isRepeat,
  json,
  onSetIndex,
  onNextIndex,
  onSetQueue,
}) {

  const audioRef = useRef(null);
  const [currentMusic, setCurrentMusic] = useState({});
  const [currentTime, setCurrentTime] = useState(()  => Number(localStorage.getItem(`localCurrentTime_${json}`)) || 0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [localIndex, setLocalIndex] = useState(index || 0);

  //============================//
  // UseEffect - Começo         //
  //============================//

  // atualiza índice local quando index do pai muda
  useEffect(() => {
    if (!data || data.length === 0) return;
    if (index < 0 || index >= data.length) return;
    setLocalIndex(index);
    setCurrentMusic(data[index]);
  }, [index, data]);

  //Configuração do auto-play
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
  
    const savedTime = Number(localStorage.getItem(`localCurrentTime_${json}`)) || 0;
  
    audio.load();
  
    audio.currentTime = savedTime;
    setCurrentTime(savedTime);
  
    if (isPlaying) {
      audio.play().catch(err => {
        console.warn('Autoplay bloqueado:', err);
        setIsPlaying(false);
      });
    }
  }, [currentMusic, json, isPlaying]);
  
  // seta o volume
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = isNaN(volume) ? 1 : volume;
  }, [volume]);

  // seta o loop
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.loop = isRepeat;
  }, [isRepeat]);

  // pula se a música atual estiver marcada como dontPlay
  useEffect(() => {
    if (!data || data.length === 0) return;
    if (!currentMusic?.id) return;

    if (dontPlay?.includes(currentMusic.id)) {
      const idx = data.findIndex(m => m.id === currentMusic.id);
      const next = onNextIndex(idx, 'forward');
      if (next !== null) {
        onSetIndex(next);
      } else {
        setIsPlaying(false);
      }
    }
  }, [dontPlay, currentMusic, data, onNextIndex, onSetIndex]);

  //============================//
  // UseEffect - Fim            //
  //============================//

  //============================//
  // pequenas Funções - Começo  //
  //============================//

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio) return;
    const time = audio.currentTime;
    setCurrentTime(time);
    localStorage.setItem(`localCurrentTime_${json}`, time);
  };

  const controlMusic = e => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = e.target.value;
    setCurrentTime(e.target.value);
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) setDuration(audioRef.current.duration);
  };

  const handlePlay = () => {
    audioRef.current?.play(); // O ? garante que existe
    setIsPlaying(true);
  };

  const handlePause = () => {
    audioRef.current?.pause();
    setIsPlaying(false);
  };

  const buttonPlayPause = () => (isPlaying ? handlePause() : handlePlay());

  const formatDuration = secs => {
    if (isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  //============================//
  // pequenas Funções - Fim     //
  //============================//

  //============================//
  // Funções - Começo           //
  //============================//

  // Pede a música da frente
  function skipMusic() {
    if (!data || data.length === 0) return;
  
    if (queue?.length > 0) {
      const [nextInQueue, ...rest] = queue; //Divide em 2 primero da fila e depois o resto
  
      const idx = data.findIndex(m => m.id === nextInQueue.id);
      if (idx !== -1) {
        onSetQueue(rest); //Remove da fila pois rest e a fila sem a primeira música
        onSetIndex(idx);
        return;
      } else {
        // Música não existe mais remove e tenta de novo
        onSetQueue(rest);
        skipMusic();
        return;
      }
    }
  
    if (isRandom) {
      const randIndex = ramdomMusic();
      if (randIndex !== null) onSetIndex(randIndex);
    } else {
      const nextIndex = onNextIndex(localIndex, 'forward');
      if (nextIndex !== null) onSetIndex(nextIndex);
      else setIsPlaying(false);
    }
  }
  
  // Pede a música anterior
  function backMusic() {
    if (!data || data.length === 0) return;

    if (isRandom) {
      const randIndex = ramdomMusic();
      if (randIndex !== null && randIndex !== localIndex) {
        onSetIndex(randIndex);
      }
    } else {
      const prevIndex = onNextIndex(localIndex, 'backward');
      if (prevIndex !== null && prevIndex !== localIndex) {
        onSetIndex(prevIndex);
      }
    }
  }

  // Traz a música uma música aleatória
  function ramdomMusic() {
    if (!data || data.length === 0) return null;
    const valid = data
      .map((item, idx) => ({ item, idx })) //Novo array com index
      .filter(({ item }) => !dontPlay?.includes(item.id)); //Remove todos os itens que estão no dontPlay para criar o novo array

    if (valid.length === 0) return null;
    const escolha = valid[Math.floor(Math.random() * valid.length)];//Escolhe um index válido
    return escolha.idx;
  }

  //============================//
  // Funções - Fim              //
  //============================//

  return (
    <div className="playerMusic">
      <div className="musica">
        <h3>{currentMusic?.musica || 'Uma Música Aí'}</h3>
        <h4>{currentMusic?.cantor || 'Mano Ninguém'}</h4>

        <div className="playerCard">
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={controlMusic}
          />
          <audio
            ref={audioRef}
            src={currentMusic?.caminho 
              ? `http://localhost:3002/api/stream/${encodeURI(currentMusic.caminho)}` // torna espaços legíveis na url
              : null}
            onLoadedMetadata={handleLoadedMetadata}
            onTimeUpdate={handleTimeUpdate}
            onEnded={skipMusic}
          />

          <div className="trackDuration">
            <p>{formatDuration(currentTime)}</p>
            <p>{formatDuration(duration)}</p>
          </div>

          <div className="control">
            <button onClick={backMusic}>
              <span className="material-symbols-rounded">keyboard_double_arrow_left</span>
            </button>

            <button onClick={buttonPlayPause}>
              <span className="material-symbols-rounded">
                {isPlaying ? 'pause' : 'play_arrow'}
              </span>
            </button>

            <button onClick={skipMusic}>
              <span className="material-symbols-rounded">keyboard_double_arrow_right</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MusicPlayer;