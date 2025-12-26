import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Associados from './pages/Associados';
import Jogos from './pages/Jogos';
import Calendario from './pages/Calendario';
import Estatisticas from './pages/Estatisticas';
import Dashboard from './pages/Dashboard';
import Grupos from './pages/Grupos';
import RankingGrupo from './pages/RankingGrupo';

const NavLink: React.FC<{ to: string; icon: string; children: React.ReactNode }> = ({ to, icon, children }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 font-medium ${
        isActive
          ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm'
          : 'text-blue-100 hover:text-white hover:bg-white/10'
      }`}
    >
      <span className="text-lg">{icon}</span>
      <span>{children}</span>
    </Link>
  );
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <nav className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white shadow-xl border-b border-blue-500">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <Link to="/" className="flex items-center space-x-3 hover:opacity-90 transition">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                  <svg className="w-6 h-6" viewBox="0 0 32 32" fill="currentColor">
                    <circle cx="16" cy="16" r="16" fill="url(#ballGradient)" opacity="0.8"/>
                    <defs>
                      <radialGradient id="ballGradient" cx="0.3" cy="0.3" r="0.8">
                        <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                        <stop offset="100%" stopColor="#2563eb" stopOpacity="1" />
                      </radialGradient>
                    </defs>
                    <rect x="10" y="14" width="12" height="4" rx="0.5" fill="none" stroke="currentColor" strokeWidth="0.5"/>
                    <circle cx="16" cy="16" r="1.5" fill="none" stroke="currentColor" strokeWidth="0.3"/>
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">PeladaHub</h1>
                  <p className="text-xs text-blue-200 font-medium">Gestão de Jogos</p>
                </div>
              </Link>

              <div className="hidden md:flex items-center space-x-1">
                <NavLink to="/" icon="🏠">Dashboard</NavLink>
                <NavLink to="/associados" icon="👥">Associados</NavLink>
                <NavLink to="/grupos" icon="⚽">Grupos</NavLink>
                <NavLink to="/jogos" icon="🎯">Jogos</NavLink>
                <NavLink to="/calendario" icon="📅">Calendário</NavLink>
                <NavLink to="/estatisticas" icon="📊">Estatísticas</NavLink>
              </div>

              {/* Mobile menu button */}
              <div className="md:hidden">
                <button className="text-white hover:text-blue-200 transition">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </nav>

        <main className="container mx-auto px-4 py-8 max-w-7xl">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/associados" element={<Associados />} />
            <Route path="/grupos" element={<Grupos />} />
            <Route path="/grupos/:grupoId/ranking" element={<RankingGrupo />} />
            <Route path="/jogos" element={<Jogos />} />
            <Route path="/calendario" element={<Calendario />} />
            <Route path="/estatisticas" element={<Estatisticas />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
