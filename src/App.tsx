import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import SongDownloadsDrawer from "./components/Downloads";
import { FullscreenDialog } from "./components/Fullscreen";
import Header from "./components/Header";
import ToastContainer from "./components/Toast";
import { DrawerProvider } from "./context/Dialog";
import { DownloadsProvider } from "./context/Downloads";
import CollectionPage from "./pages/CollectionPage";
import GameSelectionPage from "./pages/GameSelectionPage";
import OrganizePage from "./pages/organize/page";
import IndexPage from "./pages/page";

function App() {
  return (
    <DrawerProvider>
      <DownloadsProvider>
        <ToastContainer />
        <FullscreenDialog />
        <Router>
          <Header />
          <SongDownloadsDrawer />
          <Routes>
            <Route path="/" element={<IndexPage />} />
            <Route path="/collection" element={<CollectionPage />} />
            <Route path="/game-selection" element={<GameSelectionPage />} />
            <Route path="/organize" element={<OrganizePage />} />
          </Routes>
        </Router>
      </DownloadsProvider>
    </DrawerProvider>
  );
}

export default App;
