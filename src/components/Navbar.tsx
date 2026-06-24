import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Home, PlusCircle, User as UserIcon, LogOut, Menu, X, Heart, Building, BarChart2 } from 'lucide-react';
import { useAuth } from './AuthContext';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setIsOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100" id="main-navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo Brand section */}
          <div className="flex">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2 text-emerald-600 hover:text-emerald-700 transition-colors" id="nav-brand-logo">
              <Building className="h-6 w-6 stroke-[2.5]" />
              <span className="font-extrabold text-xl tracking-tight text-gray-900">
                Prop<span className="text-emerald-600">Space</span>
              </span>
            </Link>
            
            {/* Desktop Navigation Links */}
            <div className="hidden sm:ml-8 sm:flex sm:space-x-4 sm:items-center">
              <Link
                to="/"
                className={`px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  isActive('/') || isActive('/properties')
                    ? 'text-emerald-600 bg-emerald-50'
                    : 'text-gray-600 hover:text-emerald-600 hover:bg-gray-50'
                }`}
                id="nav-link-browse"
              >
                Browse Properties
              </Link>
              
              {user && (
                <>
                  <Link
                    to="/dashboard"
                    className={`px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                      isActive('/dashboard')
                        ? 'text-emerald-600 bg-emerald-50'
                        : 'text-gray-600 hover:text-emerald-600 hover:bg-gray-50'
                    }`}
                    id="nav-link-dashboard"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/my-listings"
                    className={`px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                      isActive('/my-listings')
                        ? 'text-emerald-600 bg-emerald-50'
                        : 'text-gray-600 hover:text-emerald-600 hover:bg-gray-50'
                    }`}
                    id="nav-link-my-listings"
                  >
                    My Listings
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Desktop Right items */}
          <div className="hidden sm:flex sm:items-center sm:gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                {/* Publish Button */}
                <Link
                  to="/add-property"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl transition-all shadow-sm hover:shadow-md"
                  id="nav-btn-add-property"
                >
                  <PlusCircle className="h-4 w-4" />
                  List Property
                </Link>

                {/* Profile Link */}
                <Link
                  to="/profile"
                  className="flex items-center gap-2 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                  id="nav-link-profile"
                  title="Manage Profile"
                >
                  <img
                    className="h-8 w-8 rounded-full border border-emerald-100 object-cover"
                    src={user.avatarUrl}
                    alt={user.fullName}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(user.username)}`;
                    }}
                  />
                  <span className="text-sm font-medium text-gray-700 pr-1">{user.fullName.split(' ')[0]}</span>
                </Link>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                  id="nav-btn-logout"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-gray-700 hover:text-emerald-600 font-semibold text-sm rounded-xl hover:bg-gray-50 transition-colors"
                  id="nav-btn-login"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white font-semibold text-sm rounded-xl transition-colors shadow-sm"
                  id="nav-btn-register"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-hidden transition-colors"
              id="nav-mobile-hamburger"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isOpen && (
        <div className="sm:hidden border-t border-gray-100 bg-white" id="nav-mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              to="/"
              onClick={() => setIsOpen(false)}
              className={`block px-4 py-2.5 rounded-xl text-base font-semibold ${
                isActive('/') || isActive('/properties')
                  ? 'text-emerald-600 bg-emerald-50'
                  : 'text-gray-600 hover:text-emerald-600 hover:bg-gray-50'
              }`}
            >
              Browse Properties
            </Link>

            {user ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className={`block px-4 py-2.5 rounded-xl text-base font-semibold ${
                    isActive('/dashboard')
                      ? 'text-emerald-600 bg-emerald-50'
                      : 'text-gray-600 hover:text-emerald-600 hover:bg-gray-50'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/my-listings"
                  onClick={() => setIsOpen(false)}
                  className={`block px-4 py-2.5 rounded-xl text-base font-semibold ${
                    isActive('/my-listings')
                      ? 'text-emerald-600 bg-emerald-50'
                      : 'text-gray-600 hover:text-emerald-600 hover:bg-gray-50'
                  }`}
                >
                  My Listings
                </Link>
                <Link
                  to="/add-property"
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-2.5 text-emerald-600 hover:bg-emerald-50 font-bold rounded-xl flex items-center gap-2"
                >
                  <PlusCircle className="h-5 w-5" />
                  List a Property
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-2.5 text-gray-700 hover:bg-gray-50 font-semibold rounded-xl flex items-center gap-2"
                >
                  <UserIcon className="h-5 w-5 text-gray-400" />
                  My Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left block px-4 py-2.5 text-red-600 hover:bg-red-50 font-semibold rounded-xl flex items-center gap-2"
                >
                  <LogOut className="h-5 w-5" />
                  Logout
                </button>
              </>
            ) : (
              <div className="pt-4 pb-2 px-4 border-t border-gray-100 flex flex-col gap-2">
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center py-2.5 text-gray-700 hover:text-emerald-600 font-bold rounded-xl hover:bg-gray-50 border border-gray-100 block"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl block"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
