import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useTheme } from './context/ThemeContext';
import Header from './components/UI/Header';
import Sidebar from './components/UI/Sidebar';
import SplashScreen from './components/UI/SplashScreen';
import WelcomeScreen from './components/UI/WelcomeScreen';
import PageNotFound from './components/UI/PageNotFound';
import Editor from './components/Editor/Editor';

function App() {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Apply theme to the document
    document.documentElement.classList.toggle('dark', theme === 'dark');
    
    // Simulate initial loading (can be replaced with actual data loading)
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, [theme]);

  if (loading) {
    return <SplashScreen />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<WelcomeScreen />} />
            <Route path="/documents/:id" element={<Editor />} />
            <Route path="/404" element={<PageNotFound />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;