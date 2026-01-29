import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate, useLocation } from 'react-router-dom';
import AuditLogPage from './components/AuditLogPage';
import Datenschutz from './components/Datenschutz';
import Nutzung from './components/Nutzung';
import PanelManager from './components/PanelManager';
import StatisticsPage from './components/StatisticsPage';
import AdminDashboard from './components/AdminDashboard';
import UserManagement from './components/UserManagement';
import './styles/theme.css';
import DarkModeToggle from './components/DarkModeToggle';

function Home({ auth }) {
  if (!auth?.user) {
    return (
      <div style={{ textAlign: 'center', marginTop: '4em' }}>
        <img src="/Hintergrundlogo.png" alt="Swiss Lounge Logo"
          style={{
            width: '100%',
            maxWidth: '600px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
          }}
        />
        <p style={{ marginTop: '2em' }}>🔐 Bitte logge dich ein, um fortzufahren.</p>
      </div>
    );
  }

  return (
    <div>
      <h2>🏠 Willkommen im Dashboard</h2>
      <PanelManager />
    </div>
  );
}

function AppWrapper() {
  const location = useLocation();
  const isLegalPage = location.pathname === '/datenschutz' || location.pathname === '/nutzung';

  const [auth, setAuth] = useState({ user: null, isBotmaster: false, isAdmin: false, isDiscordAdmin: false });
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authFailed, setAuthFailed] = useState(false);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    fetch('/api/auth/me', {
      credentials: 'include'
    })
      .then(async res => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data?.error || 'Nicht eingeloggt');
        }
        return res.json();
      })
      .then(data => {
        setAuth(data);
        const consentGiven = localStorage.getItem('consentGiven');
        if (data.user && !consentGiven) {
          setShowConsentModal(true);
        }
      })
      .catch(err => {
        setAuth({ user: null, isBotmaster: false, isAdmin: false, isDiscordAdmin: false });
        setAuthFailed(true);
        setAuthError(err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  const loginUrl = '/api/auth/login';
  const isAdmin = auth?.isAdmin || auth?.isBotmaster;
  const role = auth?.isBotmaster ? 'botmaster' : auth?.isAdmin ? 'admin' : 'user';

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'GET',
        credentials: 'include',
      });
      window.location.href = '/';
    } catch (error) {
      console.error('Fehler beim Logout:', error);
      alert('Logout fehlgeschlagen.');
    }
  };

  const handleConsent = () => {
    localStorage.setItem('consentGiven', 'true');
    setShowConsentModal(false);
  };

  const renderMainRoutes = () => {
    if (loading) {
      return <p style={{ padding: '2em' }}>🔄 Lade Benutzerdaten...</p>;
    }

    if (!auth?.user && authFailed && authError?.includes('Zugriff verweigert')) {
      return (
        <div style={{ padding: '2em', color: 'red', textAlign: 'center' }}>
          ❌ Zugang verweigert – Administratorrechte erforderlich!
          <div style={{ marginTop: '1em' }}>
            <a href={loginUrl}>🔁 Mit anderem Discord-Account einloggen</a>
          </div>
        </div>
      );
    }

    return (
      <Routes>
        <Route path="/" element={<Home auth={auth} />} />
        <Route path="/stats" element={auth.user ? <StatisticsPage auth={auth} disableExport={true} /> : <Navigate to="/" replace />} />
        <Route path="/admin/*" element={isAdmin ? <AdminDashboard auth={auth} /> : <p>⛔ Kein Zugriff. Nur Admins erlaubt.</p>} />
        <Route path="/admin/users" element={isAdmin ? <UserManagement auth={auth} /> : <Navigate to="/" replace />} />
        <Route path="/datenschutz" element={<Datenschutz />} />
        <Route path="/nutzung" element={<Nutzung />} />
      </Routes>
    );
  };

  return (
    <>
      <header style={{
        padding: '1em',
        backgroundColor: 'var(--card)',
        marginBottom: '1em',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5em' }}>
          <img src="/SwissLoungeLogo.jpg" alt="Logo" style={{ height: '40px', borderRadius: '6px' }} />
          <h1 style={{ margin: 0 }}>Discord Bot Dashboard</h1>
        </div>

        {auth.user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1em', flexWrap: 'wrap' }}>
            👤 {auth.user.username}#{auth.user.discriminator}
            {role && (
              <span style={{
                marginLeft: '0.5em',
                padding: '0.2em 0.5em',
                borderRadius: '4px',
                fontSize: '0.8em',
                color: '#fff',
                backgroundColor:
                  role === 'botmaster' ? '#673ab7' :
                  role === 'admin' ? '#2196f3' :
                  '#777'
              }}>
                {role}
              </span>
            )}
            <Link to="/">🏠 Home</Link>
            <Link to="/stats">📊 Statistik</Link>
            {isAdmin && <Link to="/admin">🛠 Einstellungen</Link>}
            <button onClick={handleLogout}>🚪 Logout</button>
            <DarkModeToggle />
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1em' }}>
            <a href={loginUrl}>🔐 Mit Discord anmelden</a>
            <DarkModeToggle />
          </div>
        )}
      </header>

      <main style={{ padding: '1em' }}>
        {renderMainRoutes()}
      </main>

      <footer style={{ marginTop: '2em', textAlign: 'center', fontSize: '0.9em' }}>
        <Link to="/datenschutz">📄 Datenschutz</Link> • <Link to="/nutzung">📑 Nutzungsbedingungen</Link>
      </footer>

      {showConsentModal && !isLegalPage && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
          <div style={{ backgroundColor: '#fff', padding: '2em', borderRadius: '8px', maxWidth: '500px' }}>
            <h3>📜 Zustimmung erforderlich</h3>
            <p>
              Durch die Nutzung dieses Dashboards stimmst du unserer{' '}
              <Link to="/datenschutz" target="_blank">Datenschutzerklärung</Link> und den{' '}
              <Link to="/nutzung" target="_blank">Nutzungsbedingungen</Link> zu.
            </p>
            <button onClick={handleConsent}>✅ Ich stimme zu</button>
          </div>
        </div>
      )}
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
}
