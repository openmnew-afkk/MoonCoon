import { Home } from "lucide-react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] -mb-24">
      <div className="text-center max-w-md px-6">
        <span className="ios-title-large block text-[var(--text-primary)] mb-4">404</span>

        <h1 className="ios-title text-[var(--text-primary)] mb-2">
          Страница не найдена
        </h1>
        <p className="ios-body text-[var(--text-secondary)] mb-8 leading-relaxed">
          Страница, которую вы ищете, не существует или была перемещена.
        </p>
        <Link to="/" className="ios-btn-text inline-flex items-center gap-2">
          <Home size={16} /> На главную
        </Link>
      </div>
    </div>
  );
}
