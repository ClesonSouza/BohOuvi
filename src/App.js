import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/pages/home";
import Downloads from "./components/pages/downloads";
import Playlists from "./components/pages/playlists";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/pages/downloads" element={<Downloads />} />
        <Route path="/pages/playlists" element={<Playlists />} />
      </Routes>
    </Router>
  );
}

export default App;