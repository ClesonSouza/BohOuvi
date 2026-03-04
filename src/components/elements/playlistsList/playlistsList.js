import React from 'react';
import './playlistsList.css';

function PlaylistsList({
  playlists,
  selectorName,
  selectorUrl,
  checkedJson,
  mobileMenu,
  onSetJson,
  onSetDownloadStarted,
  onSetMobileMenu,
  onClearPlaylist,
  onRemovePlaylistFromList,
}) {

  const handleSelect = (pl) => {
    onSetJson(pl);
  };

  // API - PUT
  async function updatePlaylist(selectorName, selectorUrl) {
    if (!window.confirm(`Tem certeza que deseja atualizar?\nPlaylist: "${selectorName}"\n URL: ${selectorUrl}`)) return;

    try {
      sessionStorage.setItem("downloadSession", "true");
      onSetDownloadStarted(true);

      const response = await fetch(`http://localhost:3002/api/playlists/update`, {
        method: 'PUT',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playlistName: selectorName, playlistUrl: selectorUrl }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message);
      } else {
        console.log("Erro ao solicitar atualização.");
        console.log(`Erro: ${data.error}`);
        sessionStorage.removeItem("downloadSession");
        onSetDownloadStarted(false);
      }
    } catch (error) {
      console.log("Falha na requisição de atualização.");
      console.error('Erro ao atualizar playlist:', error);
      sessionStorage.removeItem("downloadSession");
      onSetDownloadStarted(false);
    }
  }

  // API - DELETE
  async function deletePlaylist(playlistName) {
    if (!window.confirm(`Tem certeza que deseja deletar?\nPlaylist: "${playlistName}"`)) return;

    try {
      const response = await fetch(`http://localhost:3002/api/playlists/delete/${playlistName}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        alert("Playlist Deletada com Sucesso");
        onClearPlaylist(playlistName);
        onRemovePlaylistFromList(playlistName);
      } else {
        console.log(`Erro: ${data.error}`);
      }
    } catch (error) {
      console.error('Erro ao deletar playlist:', error);
    }
  }

  return (
    <>
      {mobileMenu !== 2 && (
        <div className="menu">
          <form className="listPlaylist">
            <h2><div className='mobile'><button onClick={() => onSetMobileMenu(2)}><span className="material-symbols-rounded">swap_horiz</span></button></div>Lista de Playlists</h2>
            {playlists.length > 0 ? (
              <>
                {playlists.map((pl, i) => (
                  <label key={i} className="optionsPlaylist">
                    <input type="radio" name="playlist"
                      value={pl}
                      checked={checkedJson === pl}
                      onChange={() => handleSelect(pl)}
                    />
                    <span className="textPlaylist">{pl}</span>
                    <div className="buttonsPlaylist">
                      {checkedJson === pl ? (
                        <button type="button" onClick={() => updatePlaylist(selectorName, selectorUrl)}>
                          <span className="material-symbols-rounded">upload</span>
                        </button>
                      ) : ''}
                      <button type="button" onClick={() => deletePlaylist(pl)}>
                        <span className="material-symbols-rounded">delete_forever</span>
                      </button>
                    </div>
                  </label>
                ))}
              </>
            ) : (
              <div className='optionsPlaylist'>Carregando playlists...</div>
            )}
          </form>
        </div>
      )}
    </>
  );
}

export default PlaylistsList;