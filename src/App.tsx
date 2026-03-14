import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Header from "./components/Header";
import CollectionPage from "./pages/CollectionPage";
import GameSelectionPage from "./pages/GameSelectionPage";
import IndexPage from "./pages/page";

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<IndexPage />} />
        <Route path="/collection" element={<CollectionPage />} />
        <Route path="/game-selection" element={<GameSelectionPage />} />
      </Routes>
    </Router>
  );
}

export default App;
