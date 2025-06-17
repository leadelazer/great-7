
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { TOOLS_CONFIG, UI_ICONS, DEFAULT_DARK_MODE } from '../constants';
import { Sun, Moon, Menu, X } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(DEFAULT_DARK_MODE);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const savedMode = localStorage.getItem('great7-darkMode');
    if (savedMode) {
      setIsDarkMode(JSON.parse(savedMode));
    }
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('great7-darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode(prev => !prev);
  }, []);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);
  
  const closeSidebar = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);


  const getPageTitle = () => {
    if (location.pathname === '/dashboard') return "Dashboard";
    const currentTool = TOOLS_CONFIG.find(tool => tool.path === location.pathname);
    return currentTool ? currentTool.name : "The Great 7";
  };

  return (
    <div className="flex h-screen bg-brand-bg-light dark:bg-brand-bg-dark">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-brand-card-light dark:bg-brand-card-dark shadow-lg transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:relative md:translate-x-0`}>
        <div className="p-5 flex justify-between items-center md:justify-start border-b border-brand-border-light dark:border-brand-border-dark">
          <Link to="/dashboard" className="text-xl font-sans font-bold text-brand-text-light dark:text-brand-text-dark flex items-center" onClick={closeSidebar}>
            <UI_ICONS.Dashboard className="mr-2 h-6 w-6 text-brand-accent" />
            The Great 7
          </Link>
          <button onClick={toggleSidebar} className="md:hidden text-brand-text-muted-light dark:text-brand-text-muted-dark">
            <X size={24} />
          </button>
        </div>
        <nav className="mt-6">
          {TOOLS_CONFIG.map((tool) => (
            <Link
              key={tool.key}
              to={tool.path}
              onClick={closeSidebar}
              className={`flex items-center px-6 py-2.5 text-sm font-mono text-brand-text-light dark:text-brand-text-dark hover:bg-brand-accent/[0.08] dark:hover:bg-brand-accent/[0.15] hover:text-brand-accent transition-all duration-200 group ${
                location.pathname === tool.path ? 'bg-brand-accent/[0.1] dark:bg-brand-accent/[0.2] text-brand-accent font-semibold border-r-2 border-brand-accent' : 'border-r-2 border-transparent'
              }`}
            >
              <tool.icon className={`mr-3 h-4 w-4 ${location.pathname === tool.path ? 'text-brand-accent' : 'text-brand-text-muted-light dark:text-brand-text-muted-dark group-hover:text-brand-accent transition-colors'}`} />
              {tool.name}
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2">
            <button
                onClick={toggleDarkMode}
                className="p-2 rounded-full text-brand-text-muted-light dark:text-brand-text-muted-dark hover:bg-brand-card-light dark:hover:bg-brand-card-dark hover:text-brand-accent transition-all duration-200"
                aria-label="Toggle dark mode"
            >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-brand-bg-light dark:bg-brand-bg-dark shadow-sm border-b border-brand-border-light dark:border-brand-border-dark p-4 flex justify-between items-center">
          <button onClick={toggleSidebar} className="md:hidden text-brand-text-muted-light dark:text-brand-text-muted-dark">
            <Menu size={24} />
          </button>
          <h1 className="text-lg font-sans font-semibold text-brand-text-light dark:text-brand-text-dark">{getPageTitle()}</h1>
          <div className="w-6 h-6"> {/* Placeholder */} </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-brand-bg-light dark:bg-brand-bg-dark p-6 md:p-8">
          <div className="animate-fadeIn">
            {children}
          </div>
        </main>
      </div>
       {/* Sidebar overlay for mobile */}
       {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black/30 backdrop-blur-sm md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}
    </div>
  );
};

export default Layout;
