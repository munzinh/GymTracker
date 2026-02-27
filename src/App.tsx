import { useState } from 'react';
import { AppProvider } from './context/AppContext';
import { Navbar } from './components/shared/Navbar';
import { LoginScreen } from './components/Auth/LoginScreen';
import { FitnessCalculator } from './components/Calculator/FitnessCalculator';

export interface CurrentUser {
  id: string;
  name: string;
}

const LS_CURRENT_USER = 'cutlean-current-user';

function AppContent() {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(() => {
    try {
      const stored = localStorage.getItem(LS_CURRENT_USER);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const handleLogin = (id: string, name: string) => {
    setCurrentUser({ id, name });
  };

  const handleLogout = () => {
    localStorage.removeItem(LS_CURRENT_USER);
    setCurrentUser(null);
  };

  if (!currentUser) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen" style={{ background: '#090909' }}>
      <Navbar currentUser={currentUser} onLogout={handleLogout} />

      {/* Main content - Now only the calculator (NutritionHub) */}
      <main className="max-w-2xl mx-auto px-4 py-5 pb-24 md:pb-8">
        <FitnessCalculator userId={currentUser.id} />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
