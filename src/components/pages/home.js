import '../../App.css';
import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="main">
      <h1>Bem-Vindo ao BohOuvi</h1>
      <div className="opcoes">
        <Link to="/pages/downloads"><button className='buttonPrincipal'>Criar Playlist</button></Link>
        <Link to="/pages/playlists"><button className='buttonPrincipal'>Ouça Sua Playlist</button></Link>
      </div>
      <footer class="footer">
        <p class="footer-title">Boh Ouvi <span>v1.0</span></p>
        <p class="footer-copy">© 2026</p>
        <div class="footer-links">
          <a href="#">GitHub</a>
          <span>•</span>
          <a href="#">LinkedIn</a>
        </div>
      </footer>
    </div>
  );
}

export default Home;