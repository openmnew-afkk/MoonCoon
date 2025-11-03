import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "@/components/MainLayout";
import { useEffect, useState } from "react";
import { enableCopyProtection } from "@/lib/copyProtection";
import { useTelegram } from "@/hooks/useTelegram";

// Pages
import Feed from "./pages/Feed";
import Explore from "./pages/Explore";
import Create from "./pages/Create";
import Profile from "./pages/Profile";
import AI from "./pages/AI";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import Splash from "./pages/Splash";

const queryClient = new QueryClient();

const AppContent = () => {
  const { webApp, user, isReady } = useTelegram();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    enableCopyProtection();
    
    // Принудительно устанавливаем темную тему
    document.documentElement.classList.add('dark');
    document.documentElement.style.colorScheme = 'dark';
    document.body.style.backgroundColor = 'hsl(217 32.6% 10%)';
    document.body.style.color = 'hsl(210 40% 98%)';
    
    if (webApp) {
      // Настраиваем приложение
      webApp.expand();
      webApp.enableClosingConfirmation();
      
      // Устанавливаем темный цвет заголовка и фона
      if (webApp.setHeaderColor) {
        webApp.setHeaderColor('#0f1419');
      }
      if (webApp.setBackgroundColor) {
        webApp.setBackgroundColor('#0f1419');
      }
    }
  }, [webApp]);

  if (showSplash) {
    return <Splash onComplete={() => setShowSplash(false)} />;
  }

  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Feed />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/create" element={<Create />} />
          <Route path="/ai" element={<AI />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AppContent />
      </TooltipProvider>
    </QueryClientProvider>
  );
};

createRoot(document.getElementById("root")!).render(<App />);
