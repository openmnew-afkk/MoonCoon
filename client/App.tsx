import "./global.css";

import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import MainLayout from "@/components/MainLayout";
import Splash from "@/components/Splash";
import { useTelegram } from "@/hooks/useTelegram";

// Pages
import Home from "./pages/Home";
import Search from "./pages/Search";
import MovieDetail from "./pages/MovieDetail";
import Player from "./pages/Player";
import MusicPage from "./pages/MusicPage";
import NotFound from "./pages/NotFound";

const AppContent = () => {
  const { webApp } = useTelegram();
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashComplete = useCallback(() => {
    setShowSplash(false);
  }, []);

  useEffect(() => {
    if (webApp) {
      webApp.expand();
      webApp.setHeaderColor("#0a0a0a");
      webApp.setBackgroundColor("#0a0a0a");
      try {
        webApp.enableClosingConfirmation();
      } catch {}
    }
  }, [webApp]);

  if (showSplash) {
    return <Splash onComplete={handleSplashComplete} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Плеер — без навигации (полноэкранный) */}
        <Route path="/player/:movieId" element={<Player />} />

        {/* Остальные страницы с нижней навигацией */}
        <Route
          path="*"
          element={
            <MainLayout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/search" element={<Search />} />
                <Route path="/movie/:movieId" element={<MovieDetail />} />
                <Route path="/music" element={<MusicPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </MainLayout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

createRoot(document.getElementById("root")!).render(<AppContent />);
