import React from 'react';
import { SunIcon, MoonIcon } from './icons/ThemeIcons';

type ViewMode = 'customer' | 'adminLogin' | 'adminDashboard';
type Theme = 'light' | 'dark';

interface HeaderProps {
    viewMode: ViewMode;
    setViewMode: (mode: ViewMode) => void;
    theme: Theme;
    toggleTheme: () => void;
}

const PearIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M17.31,4.02C14.86,2.1,11.5,2.4,9.51,4.8A7.78,7.78,0,0,0,8,9.85c.1,3,1.6,5.7,4,7.4s5.2,2.2,7.9,1.4a7.7,7.7,0,0,0,5.4-4.8c1-2.2.4-4.9-1.2-6.6S17.31,4.02,17.31,4.02ZM12.8,2.05a.75.75,0,0,1,.75.75,4.5,4.5,0,0,1-1.5,3.3.75.75,0,0,1-1.2-.6,4.5,4.5,0,0,1,2-3.45Z"/>
    </svg>
);


const LockIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
  </svg>
);


export const Header: React.FC<HeaderProps> = ({ viewMode, setViewMode, theme, toggleTheme }) => {
  const handleAdminClick = () => {
    if (viewMode === 'adminDashboard') {
        setViewMode('customer'); // "Logout" action
    } else {
        setViewMode('adminLogin');
    }
  };
    
  return (
    <header className="bg-base-100/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50 border-b border-base-300/50 dark:border-slate-700/50">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between h-20">
          <div 
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => setViewMode('customer')}
            title="Back to store"
           >
            <PearIcon className="text-text-primary dark:text-slate-50 h-7 w-7"/>
            <span className="text-2xl font-bold bg-brand-gradient from-brand-primary to-brand-secondary bg-clip-text text-transparent tracking-wider">
              PEAR
            </span>
          </div>
          <div className="flex items-center space-x-4">
             <button
                onClick={toggleTheme}
                className="text-text-secondary dark:text-slate-400 hover:text-text-primary dark:hover:text-slate-200 transition-colors"
                aria-label="Toggle theme"
             >
                {theme === 'light' ? <MoonIcon className="h-6 w-6" /> : <SunIcon className="h-6 w-6" />}
             </button>
            <button 
                onClick={handleAdminClick}
                className="flex items-center space-x-2 text-text-secondary dark:text-slate-400 hover:text-text-primary dark:hover:text-slate-200 transition-colors"
            >
                <LockIcon className="h-5 w-5"/>
                <span className="text-sm font-semibold">
                    {viewMode === 'adminDashboard' ? 'Logout' : 'Admin'}
                </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};