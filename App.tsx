import React, { useEffect, useState, useLayoutEffect } from 'react';
import ChatInterface from './components/Chat/ChatInterface';
import { FeaturesSection, SEOBlock } from './components/Landing/MarketingSections';
import ExamplesSection from './components/Landing/ExamplesSection';
import { Hexagon } from 'lucide-react';

function App() {
  const [scrolled, setScrolled] = useState(false);

  useLayoutEffect(() => {
    // Disable browser's automatic scroll restoration
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

    // Only scroll to top on initial mount, not on every render
    window.scrollTo({ top: 0, behavior: 'instant' });

    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToExamples = (e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById('examples')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-dark-900">
      
      {/* Navbar - Sticky & Glassy */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${scrolled ? 'bg-dark-900/80 backdrop-blur-md border-white/5 py-4' : 'bg-transparent border-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <Hexagon className="text-white fill-brand-600" size={28} strokeWidth={1.5} />
            <span className="text-xl font-bold tracking-tight text-white font-mono">BrandForge</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#examples" onClick={scrollToExamples} className="text-sm font-medium text-gray-300 hover:text-white transition-colors hidden sm:block font-mono">Examples</a>
            <a href="#" className="text-sm font-medium text-gray-300 hover:text-white transition-colors hidden sm:block font-mono">Pricing</a>
            <button className="text-sm font-medium bg-white text-dark-900 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors font-mono">
              Sign In
            </button>
          </div>
        </div>
      </nav>

      {/* Hero / Chat Section (Above the fold - Dark) */}
      <section className="relative min-h-screen flex flex-col pt-32 pb-16 bg-dark-900">
        
        {/* Ambient Background Glows */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-600/20 rounded-full blur-[128px] pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[128px] pointer-events-none"></div>

        <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif text-white mb-6 tracking-tight">
              Build a professional brand identity <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-purple-400">
                with mathematical precision.
              </span>
            </h1>
            <p className="max-w-2xl mx-auto text-lg text-gray-400">
              Get a complete, production-ready design system. We define the exact visual rules and color palettes you need for a consistent presence across all platforms.
            </p>
          </div>
          
          <div className="flex-1 flex items-start justify-center">
            <ChatInterface />
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50 animate-bounce cursor-pointer" onClick={scrollToExamples}>
          <div className="w-1 h-16 bg-gradient-to-b from-transparent via-white/20 to-transparent"></div>
        </div>
      </section>

      {/* Examples Section */}
      <ExamplesSection />

      {/* Marketing Section (Light Mode Reveal) */}
      <section className="relative bg-white z-20">
        <FeaturesSection />
        <SEOBlock />
        
        <footer className="bg-gray-50 border-t border-gray-200 py-12">
          <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} BrandForge AI. All rights reserved.
          </div>
        </footer>
      </section>

    </div>
  );
}

export default App;