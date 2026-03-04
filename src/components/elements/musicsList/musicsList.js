import React, { useRef, useState, useCallback } from 'react';
import './musicsList.css';

function MusicsList({
  index = 0,
  volume = 1,
  volumeBkp = 1,
  playlistList = [],
  playlistBase = [],
  dontPlay = [],
  queue = [],
  isRandom,
  isRepeat,
  mobileMenu,
  json,
  onSetData,
  onSetMusic,
  onSetIndex,
  onNextIndex,
  onSetDontPlay,
  onSetVolume,
  onSetVolumeBkp,
  onSetMute,
  onSetIsRandom,
  onSetIsRepeat,
  onSetQueue,
  onSetMobileMenu,
  onRemoveMusic,
}) {
  const refsMusicas = useRef([]);
  const [search, setSearch] = useState('');

  //============================//
  // APIs - Começo              //
  //============================//

  async function removeMusic(item) {
    if (!window.confirm(`Tem certeza que deseja deletar?\nMúsica: "${item.musica}"`)) return;

    try {
      const response = await fetch(`http://localhost:3002/api/playlists/delete/${json}/music`, {
        method: 'DELETE',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id }),
      });

      const data = await response.json();

      if (response.ok) {
        onRemoveMusic(item.id);
      } else {
        console.log(`Erro: ${data.error}`);
      }
    } catch (error) {
      console.error('Erro ao deletar música:', error);
    }
  }

  //============================//
  // APIs - Fim                 //
  //============================//

  //============================//
  // UseCallBack - Começo       //
  //============================//

  //Toca a música
  const playMusic = useCallback((i) => {
    const item = playlistList[i];
    if (!item) return;
    if (dontPlay?.includes(item.id)) {
      const next = onNextIndex(i, 'forward'); //Se tiver no dontPlay usa a função no componete geral para buscar o próximo válido
      if (next !== null) {
        onSetIndex(next);
      }
      return;
    }
    onSetMusic(item); //Aqui recebe a musica para no componente principal set o index
  }, [playlistList, dontPlay, onNextIndex, onSetMusic, onSetIndex]);

  const changeDontPlay = useCallback((id) => {
    onSetDontPlay(prev => {
      const safePrev = prev ?? [];
  
      if (safePrev.includes(id)) { //Se já estiver retorna um novo array sem ele
        return safePrev.filter(item => item !== id);
      }
  
      return [...safePrev, id]; //Senão estiver retorna um novo array com ele
    });
  }, [onSetDontPlay]);

  const toggleQueue = useCallback((id) => {
    onSetQueue(prev => {
      const safePrev = prev ?? [];
  
      if (safePrev.some(q => q.id === id)) { // Id já está na fila remove e reordena
        return safePrev.filter(q => q.id !== id);
      }
  
      return [...safePrev, { id }]; // Id não estava na fila então é adicionado no final
    });
  }, [onSetQueue]);
  
  const handleMuteToggle = useCallback(() => {
    onSetMute(prev => {
      const newMute = !prev;
      if (newMute) {
        onSetVolume(0);
        localStorage.setItem("localMute", JSON.stringify(true));
      } else {
        const restored = typeof volumeBkp === "number" && volumeBkp > 0 ? volumeBkp : 1;
        onSetVolume(restored);
        localStorage.setItem("localVolume", restored);
        localStorage.setItem("localMute", JSON.stringify(false));
      }
      return newMute;
    });
  }, [onSetMute, onSetVolume, volumeBkp]);

  const randomMusic = useCallback(() => {
    if (!playlistList || playlistList.length === 0) return;
    const available = playlistList?.filter(item => !dontPlay?.includes(item.id)); // Filtra músicas válidas
    if (!available || !available.length) {
      onSetMusic({}); // reseta se não houver disponíveis
      return;
    }
    const chosen = available[Math.floor(Math.random() * available.length)];
    onSetMusic(chosen);
  }, [playlistList, dontPlay, onSetMusic]);

  const currentMusic = useCallback(() => { // Scrola até a música selecionada
    if (refsMusicas.current[index]) {
      refsMusicas.current[index].scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [index]);

  const playlistOriginal = useCallback(() => {
    if (!playlistBase || playlistBase.length === 0) return;

    onSetData(playlistBase);
  }, [playlistBase, onSetData]);
  
  const playlistRandom = useCallback(() => {
    if (!playlistList || playlistList.length === 0) return;

    const embaralhadas = [...playlistList].sort(() => Math.random() - 0.5);

    onSetData(embaralhadas);
  }, [playlistList, onSetData]);
  
  //============================//
  // UseCallBack - Fim          //
  //============================//

  return (
    <>
      {mobileMenu !== 1 && (
        <div className="lista-musicas">
          <h3>
            <div className='mobile'>
              <button className='list-mobile-button' onClick={() => onSetMobileMenu(1)}>
                <span className="material-symbols-rounded">swap_horiz</span>
              </button>
            </div>
            <div className='mobile-title'>Músicas da Playlist</div>
          </h3>
          <div className="campo-busca">
            <span className="icone-busca material-symbols-rounded">search</span>
            <input type="text" className="barra-de-busca" placeholder="Buscar música ou cantor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="botoes-ordem">
            <button onClick={() => onSetIsRandom(prev => !prev)} className="lista-random">
              <span className="material-symbols-rounded">
                {isRandom ? 'autorenew' : 'format_list_bulleted'}
              </span>
            </button>

            <button type="button" onClick={() => onSetIsRepeat(prev => !prev)} className="lista-random repetir">
              <span className="material-symbols-rounded">{isRepeat ? 'repeat' : 'arrow_forward'}</span>
            </button>

            <button className="lista-random" onClick={randomMusic}><span className="material-symbols-rounded">shuffle</span></button>

            <button className="lista-random" onClick={currentMusic}><span className="material-symbols-rounded">star</span></button>

            <button className="lista-random" onClick={playlistOriginal}><span className="material-symbols-rounded">refresh</span></button>

            <button className="lista-random" onClick={playlistRandom}><span className="material-symbols-rounded">compare_arrows</span></button>
          </div>

          <div className="volume-control">
            <span className="material-symbols-rounded" style={{ cursor: "pointer" }} onClick={handleMuteToggle}>{volume === 0 ? "volume_off" : "volume_up"}</span>
            <input type="range" min="0" max="1" step="0.01"
              value={typeof volume === 'number' ? volume : 1}
              
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                onSetVolume(value);
                localStorage.setItem("localVolume", value);
                if (value === 0) {
                  onSetMute(true);
                  localStorage.setItem("localMute", JSON.stringify(true));
                } else {
                  onSetMute(false);
                  localStorage.setItem("localMute", JSON.stringify(false));
                }
              }}

              onMouseUp={(e) => { // Salvando o último volumeBkp
                const value = parseFloat(e.target.value);
                if (value > 0) {
                  onSetVolumeBkp(value);
                  localStorage.setItem("localVolumeBkp", value);
                }
              }}
              
              onTouchEnd={(e) => { // Salvando o último volumeBkp se não tiver mutado
                const value = parseFloat(e.target.value);
                if (value > 0) {
                  onSetVolumeBkp(value);
                  localStorage.setItem("localVolumeBkp", value);
                }
              }}
              
              style={{ cursor: "pointer" }}
            />
          </div>

          <ul>
            {(playlistList || [])
              .filter((item) =>
                (item.musica ?? '').toLowerCase().includes(search.toLowerCase()) ||
                (item.cantor ?? '').toLowerCase().includes(search.toLowerCase())
              )
              .map((item) => {
                const i = playlistList?.findIndex(m => m.id === item.id) ?? -1;
                const queueIndex = queue?.findIndex(q => q.id === item.id) ?? -1;            

                return (
                  <li key={item.id} ref={(el) => (refsMusicas.current[i] = el)} className="item-musica">
                    <div className="orderBox" onClick={() => toggleQueue(item.id)}>
                      {queueIndex !== -1 ? queueIndex + 1 : ''}
                    </div>

                    <div className="info-musica" style={{ opacity: dontPlay?.includes(item.id) ? 0.5 : 1 }}>
                      {item.musica} - {item.cantor}
                      {index === i && (
                        <span className="material-symbols-rounded estrela">star</span>
                      )}
                    </div>

                    <div className="botoes-musica">
                      <button onClick={() => playMusic(i)} className="btn-musica">
                        <span className="material-symbols-rounded">play_arrow</span>
                      </button>

                      <button onClick={() => changeDontPlay(item.id)} className="btn-musica">
                        <span className="material-symbols-rounded">
                          {dontPlay?.includes(item.id) ? 'check_circle' : 'block'}
                        </span>
                      </button>

                      <button onClick={() => removeMusic(item)} className="btn-musica">
                        <span className="material-symbols-rounded">delete</span>
                      </button>
                    </div>
                  </li>
                );
              })}
          </ul>
        </div>
      )}
    </>
  );
}

export default MusicsList;