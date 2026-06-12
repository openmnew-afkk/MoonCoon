import { Home } from "lucide-react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background -mb-24">
      <div className="text-center max-w-md px-6">
        {/* Animated 404 */}
        <div className="relative w-28 h-28 mx-auto mb-8">
          <div className="absolute inset-0 rounded-full"
            style={{
              background: "conic-gradient(from 0deg, #F59E0B, #A855F7, #EC4899, #F59E0B)",
              opacity: 0.2,
              animation: "adel-ring-spin 4s linear infinite",
            }} />
          <div className="absolute inset-2 rounded-full bg-background flex items-center justify-center">
            <span className="text-4xl font-black gradient-text" style={{ fontFamily: "Space Grotesk" }}>404</span>
          </div>
        </div>

        <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: "Space Grotesk" }}>Страница не найдена</h1>
        <p className="text-muted-foreground mb-8 text-sm leading-relaxed">
          Страница, которую вы ищете, не существует или была перемещена.
        </p>
        <Link to="/" className="btn-premium px-8 py-3.5 text-sm inline-flex items-center gap-2">
          <Home size={18} /> На главную
        </Link>

        <style>{`
          @keyframes adel-ring-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        `}</style>
      </div>
    </div>
  );
}
