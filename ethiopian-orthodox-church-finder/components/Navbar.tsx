import React from 'react';
import { ViewState } from '../types';
import { Church as ChurchIcon, Menu } from 'lucide-react';

interface NavbarProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate }) => {
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
            <button className="text-gray-600 hover:text-gray-900">About</button>
          </div>

          <div className="flex items-center space-x-4">
            <button className="hidden sm:block text-gray-900 hover:text-blue-600 font-medium">Sign In</button>
            <button 
              onClick={() => onNavigate(ViewState.REGISTER_CHURCH)}
              className="bg-slate-900 text-white px-4 py-2 rounded-md font-medium hover:bg-slate-800 transition-colors"
            >
              Register Church
            </button>
            <button className="md:hidden p-2 text-gray-500">
              <Menu size={24} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
