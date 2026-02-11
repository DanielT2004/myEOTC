import React, { useState, useEffect, useRef } from 'react';
import { ViewState, UserProfile } from '../types';
import { Church as ChurchIcon, Menu, User, LogOut, Settings, ChevronDown } from 'lucide-react';
import { authService } from '../services/authService';

interface NavbarProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  user: UserProfile | null;
  onUserChange: () => void;
  onShowLogin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  currentView, 
  onNavigate, 
  user,
  onUserChange,
  onShowLogin 
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    try {
      await authService.signOut();
      onUserChange();
      setShowUserMenu(false);
      onNavigate(ViewState.HOME);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleNavigate = (view: ViewState) => {
    onNavigate(view);
    setShowUserMenu(false);
  };

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div 
            className="flex items-center cursor-pointer" 
            onClick={() => onNavigate(ViewState.HOME)}
          >
            <div className="bg-slate-900 p-2 rounded-lg mr-2">
              <ChurchIcon className="h-6 w-6 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900 hidden sm:block">
              Ethiopian Orthodox Church Finder
            </span>
            <span className="font-bold text-xl tracking-tight text-slate-900 sm:hidden">
              EOC Finder
            </span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => onNavigate(ViewState.HOME)}
              className={`${currentView === ViewState.HOME ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Home
            </button>
            <button 
              onClick={() => onNavigate(ViewState.SEARCH)}
              className={`${currentView === ViewState.SEARCH ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Find Churches
            </button>
            <button 
              onClick={() => onNavigate(ViewState.EVENTS)}
              className={`${currentView === ViewState.EVENTS ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Events
            </button>
            {user?.role === 'super_admin' && (
              <button 
                onClick={() => handleNavigate(ViewState.ADMIN_DASHBOARD)}
                className={`${currentView === ViewState.ADMIN_DASHBOARD ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-gray-900'}`}
              >
                Admin
              </button>
            )}
            {(user?.role === 'church_admin' || user?.role === 'super_admin') && (
              <button 
                onClick={() => handleNavigate(ViewState.CHURCH_ADMIN_DASHBOARD)}
                className={`${currentView === ViewState.CHURCH_ADMIN_DASHBOARD ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-gray-900'}`}
              >
                My Dashboard
              </button>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <button 
                  onClick={() => handleNavigate(ViewState.REGISTER_CHURCH)}
                  className="bg-slate-900 text-white px-4 py-2 rounded-md font-medium hover:bg-slate-800 transition-colors hidden sm:block"
                >
                  Register Church
                </button>
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
                  >
                    <div className="h-8 w-8 rounded-full bg-slate-900 flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <span className="hidden sm:block text-sm font-medium text-gray-700">
                      {user.full_name || user.email}
                    </span>
                    <ChevronDown size={16} className="text-gray-500" />
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                      <div className="px-4 py-2 border-b border-gray-200">
                        <p className="text-sm font-medium text-gray-900">{user.full_name || 'User'}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded">
                          {user.role === 'super_admin' ? 'Super Admin' : user.role === 'church_admin' ? 'Church Admin' : 'User'}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          handleNavigate(ViewState.REGISTER_CHURCH);
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Register Church
                      </button>
                      {(user.role === 'church_admin' || user.role === 'super_admin') && (
                        <button
                          onClick={() => handleNavigate(ViewState.CHURCH_ADMIN_DASHBOARD)}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                        >
                          <Settings size={16} />
                          My Dashboard
                        </button>
                      )}
                      {user.role === 'super_admin' && (
                        <button
                          onClick={() => handleNavigate(ViewState.ADMIN_DASHBOARD)}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Admin Dashboard
                        </button>
                      )}
                      <button
                        onClick={handleSignOut}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                      >
                        <LogOut size={16} />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <button
                  onClick={onShowLogin}
                  className="hidden sm:block text-gray-900 hover:text-blue-600 font-medium"
                >
                  Sign In
                </button>
                <button 
                  onClick={() => {
                    if (!user) {
                      onShowLogin();
                    } else {
                      onNavigate(ViewState.REGISTER_CHURCH);
                    }
                  }}
                  className="bg-slate-900 text-white px-4 py-2 rounded-md font-medium hover:bg-slate-800 transition-colors"
                >
                  Register Church
                </button>
              </>
            )}
            <button className="md:hidden p-2 text-gray-500">
              <Menu size={24} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
