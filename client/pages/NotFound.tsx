import { Home } from "lucide-react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background -mb-24">
      <div className="text-center max-w-md px-6">
        <div className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6"
          style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.1), rgba(139,92,246,0.06))", border: "1px solid rgba(59,130,246,0.12)" }}>
          <span className="text-4xl font-black gradient-text">404</span>
        </div>
        <h1 className="text-2xl font-bold mb-2">Страница не найдена</h1>
        <p className="text-muted-foreground mb-6">
          Страница, которую вы ищете, не существует или была перемещена.
        </p>
        <Link to="/" className="btn-premium px-6 py-3 text-sm inline-flex items-center gap-2">
          <Home size={18} /> На главную
        </Link>
      </div>
    </div>
  );
}
