import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div
      className="page-enter"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "70dvh",
        textAlign: "center",
        padding: "40px 20px",
      }}
    >
      <div style={{ fontSize: 72, marginBottom: 16 }}>🎬</div>
      <h1 style={{ fontSize: 28, fontWeight: 800 }}>
        <span className="gradient-text">404</span>
      </h1>
      <p style={{ fontSize: 15, color: "var(--text-secondary)", marginTop: 8 }}>
        Страница не найдена
      </p>
      <button
        className="btn-accent"
        style={{ marginTop: 24 }}
        onClick={() => navigate("/")}
      >
        На главную
      </button>
    </div>
  );
}
