import { GameProvider } from "./context/GameContext";
import { AIProvider } from "./context/AIContext";
import Home from "./pages/Home";

function App() {
  return (
    <GameProvider>
      <AIProvider>
        <Home />
      </AIProvider>
    </GameProvider>
  );
}

export default App;