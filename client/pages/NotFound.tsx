import { Home } from "lucide-react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background -mb-24">
      <div className="glass-card text-center max-w-md">
        <div className="text-6xl mb-4">404</div>
        <h1 className="text-2xl font-bold mb-2">Страница не найдена</h1>
        <p className="text-muted-foreground mb-6">
          Страница, которую вы ищете, не существует или была перемещена.
        </p>
        <Link
          to="/"
          className="glass-button rounded-2xl px-6 py-3 inline-flex items-center gap-2 bg-primary/20 text-primary hover:bg-primary/30"
        >
          <Home size={20} />
          На главную
        </Link>
      </div>
    </div>
  );
}
