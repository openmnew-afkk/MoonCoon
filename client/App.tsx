import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "@/components/MainLayout";
import { useEffect, useState, useCallback } from "react";
import { enableAppProtection } from "@/lib/security";
import AdminGate from "@/components/AdminGate";
import { useTelegram } from "@/hooks/useTelegram";
import { initTheme } from "@/lib/theme";

// Pages
import Feed from "./pages/Feed";
import Explore from "./pages/Explore";
import Create from "./pages/Create";
import Profile from "./pages/Profile";
import SettingsPage from "./pages/SettingsPage";
import AI from "./pages/AI";
import Goals from "./pages/Goals";
import StarsHistory from "./pages/StarsHistory";
import PhotoReports from "./pages/PhotoReports";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import Splash from "./pages/Splash";
import BirthdayGreeting from "@/components/BirthdayGreeting";

const queryClient = new QueryClient();

const AppContent = () => {
  const { webApp, user, isReady } = useTelegram();
  const [showSplash, setShowSplash] = useState(true);
  const [showGreeting, setShowGreeting] = useState(false);
  
  const handleSplashComplete = useCallback(() => {
    setShowSplash(false);
    setShowGreeting(true);
  }, []);

  useEffect(() => {
    enableAppProtection();
    initTheme(webApp ?? undefined);

    if (webApp) {
      webApp.expand();
      webApp.enableClosingConfirmation();
    }
  }, [webApp]);

  if (showSplash) {
    return <Splash onComplete={handleSplashComplete} />;
  }

  if (showGreeting) {
    return <BirthdayGreeting onComplete={() => setShowGreeting(false)} />;
  }

  return (
    <>
      <AdminGate onAuthenticated={() => {}} />
      <BrowserRouter>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Feed />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/create" element={<Create />} />
          <Route path="/ai" element={<AI />} />
          <Route path="/goals" element={<Goals />} />
          <Route path="/stars-history" element={<StarsHistory />} />
          <Route path="/photo-reports" element={<PhotoReports />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
    </>
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
