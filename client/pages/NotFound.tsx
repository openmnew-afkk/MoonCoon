import { Home } from "lucide-react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background -mb-24 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 60% 50% at 50% 40%, hsl(var(--primary) / 0.06) 0%, transparent 60%), radial-gradient(ellipse 40% 40% at 70% 70%, hsl(var(--accent) / 0.04) 0%, transparent 50%)",
        }} />

      <div className="text-center max-w-md px-6 relative z-10">
        <div className="relative inline-block mb-6">
          <div className="w-28 h-28 rounded-3xl flex items-center justify-center mx-auto"
            style={{
              background: "linear-gradient(135deg, hsl(var(--primary) / 0.08), hsl(var(--accent) / 0.05))",
              border: "1px solid hsl(var(--primary) / 0.1)",
              boxShadow: "0 0 60px hsl(var(--primary) / 0.04)",
            }}>
            <span className="text-5xl font-black gradient-text" style={{ letterSpacing: "-0.06em" }}>404</span>
          </div>
          <div className="absolute -inset-3 rounded-3xl pointer-events-none"
            style={{
              background: "conic-gradient(from 180deg, transparent, hsl(var(--primary) / 0.08), transparent, hsl(var(--accent) / 0.05), transparent)",
              animation: "adel-ring-spin 8s linear infinite",
              filter: "blur(8px)",
            }} />
        </div>

        <h1 className="text-2xl font-bold mb-2">Страница не найдена</h1>
        <p className="text-sm text-muted-foreground mb-8 max-w-[260px] mx-auto leading-relaxed">
          Страница, которую вы ищете, не существует или была перемещена.
        </p>
        <Link to="/" className="btn-premium px-6 py-3 text-sm inline-flex items-center gap-2">
          <Home size={18} /> На главную
        </Link>
      </div>
    </div>
  );
}
