import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import PlaylistsList from "../elements/playlistsList/playlistsList";
import MusicsList from "../elements/musicsList/musicsList";
import MusicPlayer from "../elements/musicPlayer/musicPlayer";
import ProgressBox from "../elements/progressBox/progressBox";
import '../../App.css';

function Playlists() {
  const navigate = useNavigate();

  const [playlists, setPlaylists] = useState([]);
  const [json, setJson] = useState(() => localStorage.getItem("localJson") || "");
  const [data, setData] = useState(() => JSON.parse(localStorage.getItem(`localData_${json}`)) || []);
  const [baseData, setBaseData] = useState([]);
  const [music, setMusic] = useState({});
  const [volume, setVolume] = useState(() => { const v = parseFloat(localStorage.getItem("localVolume")); return isNaN(v) ? 1 : v; });
  const [volumeBkp, setVolumeBkp] = useState(() => { const v = parseFloat(localStorage.getItem("localVolumeBkp")); return isNaN(v) ? 1 : v; });  
  const [mute, setMute] = useState(() =>  JSON.parse(localStorage.getItem("localMute")) ?? false);
  const [index, setIndex] = useState(() => Number(localStorage.getItem(`localIndex_${json}`) ?? 0));
  const [dontPlay, setDontPlay] = useState(() => JSON.parse(localStorage.getItem(`localDontPlay_${json}`)) ?? []);
  const [queue, setQueue] = useState(() => JSON.parse(localStorage.getItem(`localQueue_${json}`)) ?? []);
  const [isRandom, setIsRandom] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [selectorName, setSelectorName] = useState("");
  const [selectorUrl, setSelectorUrl] = useState("");
  const [downloadStarted, setDownloadStarted] = useState(() => sessionStorage.getItem("downloadSession") === "true");
  const [mobileMenu, setMobileMenu] = useState(() => window.matchMedia("(max-width: 480px)").matches ? 1 : 0);

  //============================//
  // UseEffect Backup - Começo  //
  //============================//

  // Sincronizando o sessionStorage com outras abas
  useEffect(() => {
    const handleStorage = () => setDownloadStarted(sessionStorage.getItem("downloadSession") === "true");
    window.addEventListener("storage", handleStorage); // Escutando o evento de storage
    return () => window.removeEventListener("storage", handleStorage); // Parando de escutando o evento de storage
  }, []);

  useEffect(() => {
    if(mute === true){
      setVolume(0);
    }
  }, [mute]);

  useEffect(() => {
    if (!json) return;

    localStorage.setItem("localJson", json);
    setData(JSON.parse(localStorage.getItem(`localData_${json}`)))
    setDontPlay(JSON.parse(localStorage.getItem(`localDontPlay_${json}`)))
    setQueue(JSON.parse(localStorage.getItem(`localQueue_${json}`)))
    setIndex(Number(localStorage.getItem(`localIndex_${json}`)))
  }, [json]);

  useEffect(() => {
     localStorage.setItem(`localData_${json}`,JSON.stringify(data));
  }, [data, json]);

  useEffect(() => {
    if (!json) return;
    localStorage.setItem(`localDontPlay_${json}`,JSON.stringify(dontPlay));
  }, [dontPlay, json]);

  useEffect(() => {
    if (!json) return;
    localStorage.setItem(`localQueue_${json}`,JSON.stringify(queue));
  }, [queue, json]);

  useEffect(() => {
    if (!json) return;
    localStorage.setItem(`localIndex_${json}`, index);
  }, [index, json]);

  //============================//
  // UseEffect Backup - fim     //
  //============================//
  
  //============================//
  // APIs - Começo              //
  //============================//

  //Lista de Playlists disponíveis
  useEffect(() => {
    fetch("http://localhost:3002/api/playlists")
      .then(res => res.json())
      .then(json => setPlaylists(json))
      .catch(err => console.error("Erro ao buscar playlists:", err));
  }, []);

  //Músicas da playlist selecionada
  useEffect(() => {
    if (!json) return;
  
    const playlistKey = `localData_${json}`; //Acessando todo o backup que tiver

    fetch(`http://localhost:3002/api/json/${encodeURI(json)}`)
      .then(res => {
        if (!res.ok) throw new Error(res.status);
        return res.json();
      })
      .then(playlistJson => {
        const mus = playlistJson.musicas || [];
  
        setSelectorName(playlistJson.playlist);
        setSelectorUrl(playlistJson.url);
        setBaseData(mus);
  
        const savedRaw = localStorage.getItem(playlistKey);
        const saved = savedRaw ? JSON.parse(savedRaw) : null;

        if (Array.isArray(saved) && saved.length > 0) {
          setData(saved);
        } else { //Playlist Nova sem backup
          setData(mus);
          setMusic(mus[0] || {});
          localStorage.setItem(playlistKey, JSON.stringify(mus));
        }
      })
      .catch(err => console.error("Erro no fetch:", err));
  }, [json]);

  //============================//
  // APIs - Fim                 //
  //============================//

  //============================//
  // UseCallback - Começo       //
  //============================//

  const handleSetData = useCallback((newData) => {
    if (!Array.isArray(newData)) return;
    setData(prev => {
      const same = prev && prev.length === newData.length && prev.every((p, i) => p.id === newData[i].id); //Compara os arrays par ver se  tem alguma alteração
      if (same) return prev;
      return newData;
    });

    //Limpando os valores da playlist
    setIndex(0);
    setDontPlay([]);
    setQueue([]);
  }, []);

  const nextIndex = useCallback((curr, direction) => {
    if (!data || data.length === 0) return null;
    const total = data.length;
    let next = curr; //index atual

    for (let i = 0; i < total; i++) {
      next = direction === "forward"
        ? (next < total - 1 ? next + 1 : 0) //Se for passar
        : (next > 0 ? next - 1 : total - 1); //Se for voltar

      const idNext = data[next]?.id;

      //Se a musica encontrada for valida ele passa ela em next senão continua o for
      if (!dontPlay?.includes(idNext)) return next;
    }
    return null;
  }, [data, dontPlay]);

  const handleSetMusic = useCallback((m) => {
    if (!m || !m.id) return;
    const idx = data.findIndex(x => x.id === m.id); //Procura dentro de data uma musica com o mesmo id q a pedida
    if (idx !== -1) {
      setIndex(idx);
    }
  }, [data]);

  const removeMusicFromState = useCallback((removedId) => {
    setData(prev => {
      if (!prev || prev.length === 0) return prev;
      const removedIndex = prev.findIndex(m => m.id === removedId);
      if (removedIndex === -1) return prev;
      
      
      const updated = prev.filter(m => m.id !== removedId); // Cria um array sem a música removida
      localStorage.setItem(`localData_${json}`, JSON.stringify(updated));
      
      let newIndex = index; // usa o index atual

      if (updated.length === 0) {
        localStorage.removeItem(`localCurrentTime_${json}`);
        newIndex = 0;
      } else {
        if (removedIndex < index) { // Música removida antes da atual
          newIndex = index - 1;
        } else if (removedIndex === index) { // Música removida é a atual
          if (removedIndex >= updated.length) {
            newIndex = updated.length - 1; // Se for a última
          } else {
            newIndex = removedIndex; // Se não for a última
          }
          localStorage.removeItem(`localCurrentTime_${json}`); // Removendo o tempo pq a música está selecionada
        } else {
          newIndex = index; // Se for depois da atual nada muda
        }

        // Garantindo que seja a música certa
        if (music && music.id) {
          const restoredIndex = updated.findIndex(m => m.id === music.id);
          if (restoredIndex !== -1) {
            newIndex = restoredIndex;
          }
        }
        // garante limites válidos
        newIndex = Math.max(0, Math.min(newIndex, updated.length - 1));
      }

      setIndex(newIndex);

      return updated;
    });

    // Removendo a música deletada de outras partes
    setBaseData(prev => prev.filter(m => m.id !== removedId));
    setDontPlay(prev => prev ? prev.filter(id => id !== removedId) : []);
    setQueue(prev => prev ? prev.filter(q => q.id !== removedId) : []);
  }, [json, music, index]);

  // Deletando tudo sobre a playlist
  const clearPlaylistState = useCallback((playlistName) => {
    if (!playlistName) return;
  
    // limpa localStorage específico da playlist
    localStorage.removeItem(`localData_${playlistName}`);
    localStorage.removeItem(`localDontPlay_${playlistName}`);
    localStorage.removeItem(`localQueue_${playlistName}`);
    localStorage.removeItem(`localIndex_${playlistName}`);
    localStorage.removeItem(`localCurrentTime_${playlistName}`);
  
    // se for a playlist atualmente selecionada
    if (json === playlistName) {
      localStorage.removeItem("localJson");
  
      setJson("");
      setData([]);
      setBaseData([]);
      setDontPlay([]);
      setQueue([]);
      setIndex(0);
      setMusic({});
      setSelectorName("");
      setSelectorUrl("");
    }
  }, [json]);

  // Forçando recarregamento da playlist
  const refreshCurrentPlaylist = useCallback(() => {
    if (!json) return;
  
    setData([]);
    setBaseData([]);
    setDontPlay([]);
    setQueue([]);
    setIndex(0);
  
    localStorage.removeItem(`localData_${json}`);
    localStorage.removeItem(`localDontPlay_${json}`);
    localStorage.removeItem(`localQueue_${json}`);
    localStorage.removeItem(`localIndex_${json}`);
    localStorage.removeItem(`localCurrentTime_${json}`);
  
    // Zera o estado e imediatamente restaura para forçar o useEffect a rodar 2 vezes
    setJson(prev => {
      setTimeout(() => setJson(prev), 0);
      return "";
    });
  }, [json]);
  
  const handleSetVolume = useCallback((v) => setVolume(v), []);
  const handleSetVolumeBkp = useCallback((v) => setVolumeBkp(v), []);
  const handleSetMute = useCallback((b) => setMute(b), []);
  const handleSetIsRepeat = useCallback((b) => setIsRepeat(b), []);

  //============================//
  // UseCallback - Fim          //
  //============================//

  //============================//
  // UseEffect - Começo         //
  //============================//

  // Garantindo que as músicas do dontPlay não toquem
  useEffect(() => {
    if (!data || data.length === 0) {
      setMusic({});
      return;
    }
    let idx = Math.max(0, Math.min(index, data.length - 1));
    let current = data[idx];
  
    if (!current || dontPlay?.includes(current.id)) {
      const next = nextIndex(idx, "forward");
      if (next === null) {
        setMusic({});
        return;
      }
      setIndex(next);
      return;
    }

    setMusic(prev => (prev?.id === current.id ? prev : current));
  }, [index, data, dontPlay, nextIndex]);  

  // Remove da fila músicas marcadas como dontPlay
  useEffect(() => {
    setQueue(prev => {
      if (!Array.isArray(prev)) return [];
      return prev.filter(q => !dontPlay?.includes(q.id));
    });
  }, [dontPlay]);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 768px)");
  
    const handleChange = (e) => {
      setMobileMenu(e.matches ? 1 : 0); //matches true se menor que 768px
    };
  
    media.addEventListener("change", handleChange); //Sempre que a tela mudar
  
    return () => {
      media.removeEventListener("change", handleChange);
    };
  }, []);

  //============================//
  // UseEffect - Fim            //
  //============================//

  return (
    <div className="main">
      {!downloadStarted && (<h1 className='playlist-title'>{json} | {index + 1}</h1> )}
      {downloadStarted && (<h1 className='playlist-title'>Atualizando: {json}</h1> )}
      <button className='voltar' onClick={() => navigate("/")}><FaArrowLeft /></button>

      {downloadStarted && (
        <ProgressBox 
          onSetDownloadStarted={setDownloadStarted}
          onRefreshPlaylist={refreshCurrentPlaylist}
        />
      )}

      <div className="layoutApp"> 
        {!downloadStarted && (
          <PlaylistsList
            playlists={playlists}
            selectorName={selectorName}
            selectorUrl={selectorUrl}
            checkedJson={json}
            mobileMenu={mobileMenu}
            onSetJson={setJson}
            onSetDownloadStarted={setDownloadStarted}
            onSetMobileMenu={setMobileMenu}
            onClearPlaylist={clearPlaylistState}
            onRemovePlaylistFromList={(name) =>
              setPlaylists(prev => prev.filter(p => p !== name)) // Garantindo que a playlist deletada não apareça na lista de playlists
            }
          />
        )}
        <div className="rightPanel">
          {!downloadStarted && json && (
            <MusicsList
              playlistList={data}
              playlistBase={baseData}
              index={index}
              dontPlay={dontPlay}
              queue={queue}
              volume={volume}
              volumeBkp={volumeBkp}
              selectorName={selectorName}
              isRandom={isRandom}
              isRepeat={isRepeat}
              mobileMenu={mobileMenu}
              json={json}
              onSetData={handleSetData}
              onSetMusic={handleSetMusic}
              onSetIndex={setIndex}
              onNextIndex={nextIndex}
              onSetDontPlay={setDontPlay}
              onSetVolume={handleSetVolume}
              onSetVolumeBkp={handleSetVolumeBkp}
              onSetMute={handleSetMute}
              onSetIsRandom={setIsRandom}
              onSetIsRepeat={handleSetIsRepeat}
              onSetQueue={setQueue}
              onSetMobileMenu={setMobileMenu}
              onRemoveMusic={removeMusicFromState}
            />
          )}

          {!downloadStarted && json && (
            <MusicPlayer
              data={data}
              index={index}
              dontPlay={dontPlay}
              queue={queue}
              volume={volume}
              isRandom={isRandom}
              isRepeat={isRepeat}
              json={json}
              onSetIndex={setIndex}
              onNextIndex={nextIndex}
              onSetQueue={setQueue}
            />
          )}
        </div>
      </div>
      
    </div>
  );
}

export default Playlists;