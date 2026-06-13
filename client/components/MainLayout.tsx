import { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";

/* ── SVG Icons ── */
const HomeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const MusicIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18V5l12-2v13" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="16" r="3" />
  </svg>
);

interface Props {
  children: ReactNode;
}

export default function MainLayout({ children }: Props) {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;

  const tabs = [
    { key: "/", label: "Главная", icon: <HomeIcon /> },
    { key: "/search", label: "Поиск", icon: <SearchIcon /> },
    { key: "/music", label: "Музыка", icon: <MusicIcon /> },
  ];

  return (
    <>
      <main style={{ paddingBottom: 8 }}>{children}</main>

      <nav className="bottom-nav">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`nav-item ${path === tab.key ? "active" : ""}`}
            onClick={() => navigate(tab.key)}
            style={{ background: "none", border: "none", fontFamily: "inherit" }}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>
    </>
  );
}
