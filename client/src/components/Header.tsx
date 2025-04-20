import { Link } from 'wouter';
import { useState } from 'react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-primary to-secondary dark:from-black dark:to-gray-800 shadow-lg transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/">
              <a className="text-2xl font-bold text-white dark:text-primary flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Novel Translator
              </a>
            </Link>
          </div>
          
          {/* Navigation */}
          <nav className="hidden md:flex space-x-4">
            <Link href="/">
              <a className="text-white hover:bg-white/10 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Home
              </a>
            </Link>
            <a href="#" className="text-white hover:bg-white/10 px-3 py-2 rounded-md text-sm font-medium transition-colors">
              Library
            </a>
            <a href="#" className="text-white hover:bg-white/10 px-3 py-2 rounded-md text-sm font-medium transition-colors">
              About
            </a>
          </nav>
          
          {/* Theme Toggle */}
          <div className="flex items-center">
            <ThemeToggle />
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMobileMenu}
              className="text-white hover:bg-white/10 transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-secondary dark:bg-gray-800 transition-colors">
            <Link href="/">
              <a className="text-white block px-3 py-2 rounded-md text-base font-medium hover:bg-white/10 transition-colors">
                Home
              </a>
            </Link>
            <a href="#" className="text-white block px-3 py-2 rounded-md text-base font-medium hover:bg-white/10 transition-colors">
              Library
            </a>
            <a href="#" className="text-white block px-3 py-2 rounded-md text-base font-medium hover:bg-white/10 transition-colors">
              About
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
