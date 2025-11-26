import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';

export default function Navbar() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [aiMenuOpen, setAiMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const mainNavLinks = [
    { path: '/', label: 'Dashboard' },
    { path: '/syllabus', label: '📚 Syllabus' },
    { path: '/assignments', label: '🔔 Assignments' },
    { path: '/analytics', label: '📊 Analytics' },
    { path: '/quiz', label: '🧠 Quiz' },
  ];

  const aiFeatures = [
    { path: '/ai-tutor', label: '🤖 AI Chat Tutor', desc: 'Ask questions about your topics' },
    { path: '/ai-coach', label: '🎯 AI Study Coach', desc: 'Get personalized motivation' },
    { path: '/ai-summarizer', label: '📝 Note Summarizer', desc: 'Summarize your study notes' },
    { path: '/ai-analyzer', label: '🔍 Weakness Analyzer', desc: 'Identify areas to improve' },
  ];

  const moreLinks = [
    { path: '/create', label: 'Create Plan' },
    { path: '/achievements', label: '🏆 Achievements' },
    { path: '/reviews', label: '📈 Reviews' },
  ];

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

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {mainNavLinks.slice(0, 3).map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.path)
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-gray-100'
                }`}
              >
                {link.label}
              </Link>
            ))}
            
            {/* AI Features Dropdown */}
            <div className="relative">
              <button
                onClick={() => setAiMenuOpen(!aiMenuOpen)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center ${
                  aiFeatures.some(f => isActive(f.path))
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-600 hover:text-purple-600 hover:bg-gray-100'
                }`}
              >
                ✨ AI Features
                <svg className={`w-4 h-4 ml-1 transition-transform ${aiMenuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {aiMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  {aiFeatures.map((feature) => (
                    <Link
                      key={feature.path}
                      to={feature.path}
                      onClick={() => setAiMenuOpen(false)}
                      className={`block px-4 py-2 hover:bg-gray-50 ${
                        isActive(feature.path) ? 'bg-purple-50' : ''
                      }`}
                    >
                      <div className="font-medium text-gray-800">{feature.label}</div>
                      <div className="text-xs text-gray-500">{feature.desc}</div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {mainNavLinks.slice(3).map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.path)
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-gray-100'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-600 hover:text-gray-800 p-2"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-1">
              {mainNavLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(link.path)
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-gray-100'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              
              {/* AI Features in Mobile */}
              <div className="pt-2 mt-2 border-t border-gray-200">
                <p className="px-3 py-1 text-xs font-semibold text-gray-400 uppercase">AI Features</p>
                {aiFeatures.map((feature) => (
                  <Link
                    key={feature.path}
                    to={feature.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors block ${
                      isActive(feature.path)
                        ? 'bg-purple-100 text-purple-700'
                        : 'text-gray-600 hover:text-purple-600 hover:bg-gray-100'
                    }`}
                  >
                    {feature.label}
                  </Link>
                ))}
              </div>

              {/* More Links in Mobile */}
              <div className="pt-2 mt-2 border-t border-gray-200">
                <p className="px-3 py-1 text-xs font-semibold text-gray-400 uppercase">More</p>
                {moreLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors block ${
                      isActive(link.path)
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-blue-600 hover:bg-gray-100'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Click outside to close AI menu */}
      {aiMenuOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setAiMenuOpen(false)}
        />
      )}
    </nav>
  );
}
