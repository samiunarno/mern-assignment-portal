
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ROLES_CONFIG } from '../constants';
import { UserRole } from '../types';
import { BookOpenIcon, UserCircleIcon, ArrowLeftOnRectangleIcon, ChevronDownIcon, Cog6ToothIcon } from './icons/Icons';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const location = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isLandingPage = location.pathname === '/';

  useEffect(() => {
    if (!isLandingPage) {
      setIsScrolled(true);
      return;
    }
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isLandingPage]);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const headerClass = isLandingPage && !isScrolled
    ? 'bg-transparent text-white fixed top-0 left-0 right-0 z-50 transition-all duration-300'
    : 'bg-card/80 backdrop-blur-sm border-b border-border shadow-sm sticky top-0 z-50 transition-all duration-300 text-foreground';

  return (
    <header className={headerClass}>
      <div className="container mx-auto px-4 h-16 flex justify-between items-center">
        <Link to={user ? "/dashboard" : "/"} className="flex items-center space-x-2 group">
          <BookOpenIcon className={`w-7 h-7 text-primary transition-transform duration-300 group-hover:rotate-[-5deg]`} />
          <span className={`text-xl font-bold ${isLandingPage && !isScrolled ? 'text-white' : 'text-foreground'}`}>Assignment Portal</span>
        </Link>
        <div className="flex items-center space-x-2 md:space-x-4">
          {user ? (
            <div className="relative" ref={dropdownRef}>
                <button onClick={() => setDropdownOpen(!isDropdownOpen)} className={`flex items-center space-x-2 p-2 rounded-md transition-colors duration-200 ${isDropdownOpen ? 'bg-accent' : ''} ${isLandingPage && !isScrolled ? 'hover:bg-white/10' : 'hover:bg-accent'}`}>
                    <UserCircleIcon className="w-6 h-6"/>
                    <span className="font-medium hidden sm:inline">{user.name}</span>
                    <ChevronDownIcon className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}/>
                </button>
                {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-card shadow-lg ring-1 ring-border focus:outline-none animate-fadeInUp" style={{animationDuration: '0.2s'}}>
                        <div className="p-2">
                            <div className="px-2 py-2 text-sm">
                                <p className="font-semibold text-foreground">{user.name}</p>
                                <p className="text-muted-foreground truncate">{user.email}</p>
                                <span className={`mt-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold text-white ${ROLES_CONFIG[user.role as UserRole].color}`}>{ROLES_CONFIG[user.role as UserRole].label}</span>
                            </div>
                            <div className="my-1 h-px bg-border" />
                             <Link to="/profile" onClick={() => setDropdownOpen(false)} className="flex items-center w-full px-2 py-2 text-sm rounded-md text-foreground hover:bg-accent hover:text-accent-foreground">
                                <Cog6ToothIcon className="w-5 h-5 mr-3" />
                                Manage Profile
                            </Link>
                            <button onClick={() => { logout(); setDropdownOpen(false); }} className="flex items-center w-full px-2 py-2 text-sm rounded-md text-destructive hover:bg-destructive/10">
                                <ArrowLeftOnRectangleIcon className="w-5 h-5 mr-3"/>
                                Logout
                            </button>
                        </div>
                    </div>
                )}
            </div>
          ) : (
            <>
              <Link to="/login" className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${isLandingPage && !isScrolled ? 'text-white hover:bg-white/10' : 'text-foreground hover:bg-accent'}`}>
                Login
              </Link>
              <Link to="/register" className="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 py-2 bg-primary text-primary-foreground shadow hover:bg-primary/90">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;