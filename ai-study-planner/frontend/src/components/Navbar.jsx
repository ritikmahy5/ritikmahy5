import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <svg className="w-8 h-8" viewBox="0 0 100 100">
                <defs>
                  <linearGradient id="navGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#3b82f6' }} />
                    <stop offset="100%" style={{ stopColor: '#8b5cf6' }} />
                  </linearGradient>
                </defs>
                <circle cx="50" cy="50" r="45" fill="url(#navGrad)" />
                <path d="M30 35 L50 25 L70 35 L70 55 L50 65 L30 55 Z" fill="white" opacity="0.9" />
                <path d="M40 42 L50 37 L60 42 L60 52 L50 57 L40 52 Z" fill="url(#navGrad)" />
              </svg>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AI Study Planner
              </span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/')
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-gray-100'
              }`}
            >
              Dashboard
            </Link>
            <Link
              to="/create"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/create')
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-gray-100'
              }`}
            >
              Create Plan
            </Link>
            <Link
              to="/recommendations"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/recommendations')
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-gray-100'
              }`}
            >
              Recommendations
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
