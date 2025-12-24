import React, { useState } from 'react';
import { BrandAssetData } from '../../types';
import BrandCard from '../Brand/BrandCard';
import { ChevronRight, Sparkles } from 'lucide-react';

const EXAMPLES: BrandAssetData[] = [
  {
    brandName: "Lumina",
    tagline: "Intelligence at the speed of light.",
    description: "Enterprise data visualization platform.",
    colors: {
      primary: "#6366f1",
      secondary: "#a855f7",
      accent: "#ec4899",
      background: "#0f172a",
      text: "#f8fafc"
    },
    typography: {
      heading: "'Space Grotesk', sans-serif",
      body: "'Inter', sans-serif"
    },
    logo: {
      concept: "Hexagonal Aperture",
      constructionAnalysis: "SPEC: Base Hexagon (r=50). Vertical Beams (w=4px). Center Core (r=8px). RULES: 4px negative space buffer enforced around all elements. No intersecting strokes.",
      layout: "Icon Left",
      dimensions: {
        social: "1:1",
        web: "4:1",
        print: "Vector"
      },
      fileFormats: ["JSON", "SVG"],
      svgContent: (
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
           {/* Outer Hexagon: Stroke 4px. Inner boundary is effectively at r-2. */}
           <path d="M50 10 L84.64 30 V70 L50 90 L15.36 70 V30 L50 10Z" stroke="currentColor" strokeWidth="4" strokeLinejoin="miter" className="text-white"/>
           
           {/* Top Beam: Starts at y=18 to ensure >4px gap from top vertex stroke */}
           <line x1="50" y1="18" x2="50" y2="38" stroke="currentColor" strokeWidth="4" className="text-indigo-400"/>
           
           {/* Bottom Beam: Starts at y=62 to ensure >4px gap from center circle */}
           <line x1="50" y1="62" x2="50" y2="82" stroke="currentColor" strokeWidth="4" className="text-indigo-400"/>
           
           {/* Center Circle: r=8. Occupies y=42 to y=58. */}
           <circle cx="50" cy="50" r="8" fill="currentColor" className="text-white"/>
        </svg>
      )
    },
    usage: "SaaS Enterprise"
  },
  {
    brandName: "Botanica",
    tagline: "Rooted in nature.",
    description: "Sustainable skincare formulations.",
    colors: {
      primary: "#15803d",
      secondary: "#fcd34d",
      accent: "#78350f",
      background: "#fffbeb",
      text: "#1c1917"
    },
    typography: {
      heading: "'Inter', sans-serif",
      body: "'Inter', sans-serif"
    },
    logo: {
      concept: "Geometric Construct 'B'",
      constructionAnalysis: "SPEC: Vertical Rect (20x80). Two Semi-Circles (r=18). ALIGNMENT: Left-aligned. GAP: 4px vertical channel separates stem from loops. SOLID FILLS ONLY.",
      layout: "Stacked",
      dimensions: {
        social: "1:1",
        web: "3:1",
        print: "Vector"
      },
      fileFormats: ["JSON", "PDF"],
      svgContent: (
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
           {/* Stem: x=20 to x=40 */}
           <rect x="20" y="10" width="20" height="80" fill="currentColor" className="text-green-700"/>
           
           {/* Top Loop: Starts at x=44 (4px Gap) */}
           <path d="M44 10 H54 C69 10 69 48 54 48 H44 V10 Z" fill="currentColor" className="text-green-600"/>
           
           {/* Bottom Loop: Starts at x=44 (4px Gap) */}
           <path d="M44 52 H54 C69 52 69 90 54 90 H44 V52 Z" fill="currentColor" className="text-green-500"/>
        </svg>
      )
    },
    usage: "Consumer Goods"
  },
  {
    brandName: "Vault",
    tagline: "Secure legacy.",
    description: "Generational wealth management.",
    colors: {
      primary: "#0f172a",
      secondary: "#94a3b8",
      accent: "#ca8a04",
      background: "#ffffff",
      text: "#020617"
    },
    typography: {
      heading: "'Roboto', sans-serif",
      body: "'Roboto', sans-serif"
    },
    logo: {
      concept: "Geometric Lock",
      constructionAnalysis: "SPEC: Square Container (60x60, Stroke 6px). Keyhole (Circle r=8 + Rect w=8). COMPOSITION: Centered. No strokes touch container. Negative space > 10px.",
      layout: "Icon Left",
      dimensions: {
        social: "1:1",
        web: "4:1",
        print: "Vector"
      },
      fileFormats: ["JSON", "EPS"],
      svgContent: (
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
           {/* Outer Square */}
           <rect x="20" y="20" width="60" height="60" stroke="currentColor" strokeWidth="6" fill="none" className="text-slate-200"/>
           
           {/* Inner Keyhole - Isolated */}
           <g transform="translate(0, 5)">
             <circle cx="50" cy="40" r="8" fill="currentColor" className="text-amber-500"/>
             <rect x="46" y="40" width="8" height="15" fill="currentColor" className="text-amber-500"/>
           </g>
        </svg>
      )
    },
    usage: "Fintech"
  }
];

const ExamplesSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <section id="examples" className="py-24 bg-dark-900 border-t border-white/5 relative overflow-hidden">
      
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-brand-300 text-xs font-medium mb-4 animate-fade-in">
            <Sparkles size={12} />
            <span>Demonstration Library</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-serif text-white mb-6">
            Sample Brand Specifications
          </h2>
          <p className="text-lg text-gray-400">
            Explore technical outputs generated by our engine. These demonstrations highlight the deterministic design rules and strict geometric construction enforced for every brand.
          </p>
          <p className="mt-4 text-xs font-mono text-gray-500 uppercase tracking-widest">
            Note: These are reference samples of engine output.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {EXAMPLES.map((example, idx) => (
            <button
              key={idx}
              onClick={() => setActiveTab(idx)}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 border ${
                activeTab === idx
                  ? 'bg-white text-dark-900 border-white shadow-[0_0_20px_rgba(255,255,255,0.3)] transform scale-105'
                  : 'bg-transparent text-gray-400 border-white/10 hover:border-white/30 hover:text-white'
              }`}
            >
              {example.brandName} <span className="opacity-50 ml-1 font-light hidden sm:inline">(Sample)</span>
            </button>
          ))}
        </div>

        {/* Tab Content Area */}
        <div className="relative min-h-[750px] md:min-h-[600px]">
          {EXAMPLES.map((example, idx) => (
            <div
              key={idx}
              className={`transition-all duration-700 ease-out absolute inset-0 w-full ${
                activeTab === idx 
                  ? 'opacity-100 translate-y-0 z-10 scale-100 filter blur-0' 
                  : 'opacity-0 translate-y-8 pointer-events-none scale-95 filter blur-sm'
              }`}
            >
              <BrandCard data={example} />
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="inline-flex items-center gap-2 text-brand-400 hover:text-brand-300 transition-colors font-medium group text-lg">
                Create Your Own Specification <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
        </div>
      </div>
    </section>
  );
};

export default ExamplesSection;