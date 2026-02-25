import { useState } from 'react';
import { AppProvider } from './context/AppContext';
import { Navbar } from './components/shared/Navbar';
import { Dashboard } from './components/Dashboard/Dashboard';
import { DailyForm, LogHistory } from './components/Tracking/DailyForm';
import { WeeklyCheck } from './components/Tracking/WeeklyCheck';
import { StrengthTracker } from './components/Strength/StrengthTracker';
import { ProgressScore } from './components/Progress/ProgressScore';
import { GoalSetting } from './components/Goals/GoalSetting';
import type { TabId } from './types';

function AppContent() {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');

  return (
    <div className="min-h-screen" style={{ background: '#090909' }}>
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main content */}
      <main className="max-w-2xl mx-auto px-4 py-5 pb-24 md:pb-8">
        {activeTab === 'dashboard' && <Dashboard />}

        {activeTab === 'tracking' && (
          <div className="space-y-4">
            <DailyForm />
            <WeeklyCheck />
            <LogHistory />
          </div>
        )}

        {activeTab === 'strength' && <StrengthTracker />}

        {activeTab === 'progress' && <ProgressScore />}

        {activeTab === 'goals' && <GoalSetting />}
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
