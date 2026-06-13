import "./global.css";

import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import MainLayout from "@/components/MainLayout";
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

  return (
    <BrowserRouter>
      <Routes>
        {/* Плеер — без MainLayout (полноэкранный) */}
        <Route path="/player/:movieId" element={<Player />} />

        {/* Остальные страницы с навигацией */}
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
