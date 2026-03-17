import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import SongDownloadsDrawer from "./components/Downloads";
import Header from "./components/Header";
import { DrawerProvider } from "./context/Dialog";
import { DownloadsProvider } from "./context/Downloads";
import CollectionPage from "./pages/CollectionPage";
import GameSelectionPage from "./pages/GameSelectionPage";
import IndexPage from "./pages/page";

function App() {
  return (
    <DrawerProvider>
      <DownloadsProvider>
        <Router>
          <Header />
          <SongDownloadsDrawer />
          <Routes>
            <Route path="/" element={<IndexPage />} />
            <Route path="/collection" element={<CollectionPage />} />
            <Route path="/game-selection" element={<GameSelectionPage />} />
          </Routes>
        </Router>
      </DownloadsProvider>
    </DrawerProvider>
  );
}

export default App;
