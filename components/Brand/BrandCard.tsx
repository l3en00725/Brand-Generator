import React from 'react';
import { BrandAssetData } from '../../types';
import { Download, Lock, Palette, Type, Layout, Ruler, FileImage, ScanLine, Grid, Crosshair } from 'lucide-react';
import Button from '../ui/Button';

interface BrandCardProps {
  data: BrandAssetData;
}

const BrandCard: React.FC<BrandCardProps> = ({ data }) => {
  return (
    <div className="w-full max-w-5xl mx-auto bg-dark-800 border border-white/10 rounded-2xl overflow-hidden shadow-2xl animate-fade-in mt-8 relative group">
      
      {/* Glossy overlay effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none mix-blend-overlay"></div>

      {/* Header */}
      <div className="p-8 border-b border-white/10 bg-gradient-to-r from-dark-800 to-dark-900 relative">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="inline-block px-3 py-1 bg-brand-500/10 text-brand-400 text-[10px] font-mono tracking-widest rounded-full border border-brand-500/20 uppercase">
                Spec V1.0
              </span>
              <span className="inline-block px-3 py-1 bg-white/5 text-gray-400 text-[10px] font-mono tracking-widest rounded-full border border-white/10 uppercase">
                {data.usage}
              </span>
            </div>
            <h2 className="text-4xl font-mono tracking-tight text-white mb-2">{data.brandName}</h2>
            <p className="text-gray-400 font-light text-lg">{data.tagline}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
        
        {/* Left Column: Visuals (7 cols) */}
        <div className="lg:col-span-7 p-8 border-r border-white/10 space-y-10 bg-dark-900/30">
          
          {/* Logo Concept & Specs */}
          <div>
             <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-white/80">
                  <Layout size={18} className="text-brand-500" />
                  <h3 className="font-semibold text-sm uppercase tracking-wider">Construction Spec</h3>
                </div>
             </div>

             <div className="relative">
                {/* Visual Placeholder / Blueprint View */}
                <div className="aspect-video bg-dark-950 rounded-xl border border-white/10 flex items-center justify-center relative overflow-hidden group shadow-inner">
                    
                    {/* Technical Grid Background */}
                    <div className="absolute inset-0 opacity-20" style={{ 
                        backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', 
                        backgroundSize: '40px 40px' 
                    }}></div>
                    <div className="absolute inset-0 opacity-10" style={{ 
                        backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', 
                        backgroundSize: '10px 10px' 
                    }}></div>

                    <div className="text-center p-8 relative z-10 flex flex-col items-center justify-center h-full w-full">
                      {data.logo.svgContent ? (
                        <div className="w-48 h-48 drop-shadow-2xl text-white opacity-90 transition-transform duration-500 group-hover:scale-105">
                           {data.logo.svgContent}
                        </div>
                      ) : (
                        /* BLUEPRINT FALLBACK - No visual flair, pure spec representation */
                        <div className="flex flex-col items-center justify-center w-full h-full border-2 border-dashed border-white/10 rounded-lg bg-dark-900/50 backdrop-blur-sm p-6 relative">
                           {/* Crosshairs */}
                           <div className="absolute top-2 left-2"><Crosshair size={12} className="text-gray-600"/></div>
                           <div className="absolute top-2 right-2"><Crosshair size={12} className="text-gray-600"/></div>
                           <div className="absolute bottom-2 left-2"><Crosshair size={12} className="text-gray-600"/></div>
                           <div className="absolute bottom-2 right-2"><Crosshair size={12} className="text-gray-600"/></div>

                           <div className="w-16 h-16 bg-brand-500/10 rounded-full flex items-center justify-center mb-4 border border-brand-500/20">
                              <Grid size={24} className="text-brand-400" />
                           </div>
                           
                           <div className="space-y-1 text-center">
                             <h4 className="text-white font-mono text-sm uppercase tracking-widest">Construction Ready</h4>
                             <p className="text-gray-500 font-mono text-[10px]">Awaiting Vector Rendering</p>
                           </div>

                           <div className="mt-4 px-4 py-2 bg-black/40 rounded border border-white/5 font-mono text-[10px] text-brand-300 max-w-xs truncate">
                              {data.logo.concept}
                           </div>
                        </div>
                      )}
                    </div>

                    {/* Dimensions Badge */}
                    <div className="absolute top-4 left-4 flex gap-2">
                       <div className="bg-black/40 backdrop-blur border border-white/10 px-2 py-1 rounded text-[10px] text-gray-300 font-mono flex items-center gap-1">
                          <Ruler size={10} /> {data.logo.dimensions.social}
                       </div>
                    </div>
                </div>

                {/* Concept & Construction Notes */}
                <div className="mt-4 grid grid-cols-1 gap-4">
                  {data.logo.constructionAnalysis && (
                    <div className="bg-brand-900/10 rounded-lg p-4 border border-brand-500/10 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-2 opacity-10"><ScanLine size={48} /></div>
                      <h4 className="text-[10px] text-brand-400 uppercase tracking-wider font-mono mb-2 flex items-center gap-1 relative z-10">
                        <ScanLine size={10} /> Geometric Definitions
                      </h4>
                      <p className="text-xs text-brand-100 leading-relaxed font-mono relative z-10 border-l-2 border-brand-500/30 pl-3">
                        {data.logo.constructionAnalysis}
                      </p>
                    </div>
                  )}
                </div>

                {/* Technical Specs Row */}
                <div className="grid grid-cols-3 gap-3 mt-4">
                   <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                      <span className="text-[10px] text-gray-500 uppercase tracking-wider font-mono block mb-1">Grid</span>
                      <span className="text-xs text-white font-mono">10px Modular</span>
                   </div>
                   <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                      <span className="text-[10px] text-gray-500 uppercase tracking-wider font-mono block mb-1">Stroke</span>
                      <span className="text-xs text-white font-mono">Uniform (4-6px)</span>
                   </div>
                   <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                      <span className="text-[10px] text-gray-500 uppercase tracking-wider font-mono block mb-1">Buffer</span>
                      <span className="text-xs text-white font-mono">Min 4px</span>
                   </div>
                </div>
             </div>
          </div>

          {/* Color Palette */}
          <div>
            <div className="flex items-center gap-2 mb-4 text-white/80">
                <Palette size={18} className="text-brand-500" />
                <h3 className="font-semibold text-sm uppercase tracking-wider">Chromatics</h3>
             </div>
            <div className="grid grid-cols-5 gap-3">
              {[
                { label: 'Pri', color: data.colors.primary },
                { label: 'Sec', color: data.colors.secondary },
                { label: 'Acc', color: data.colors.accent },
                { label: 'Bg', color: data.colors.background },
                { label: 'Txt', color: data.colors.text },
              ].map((c, i) => (
                <div key={i} className="flex flex-col gap-2 group cursor-pointer">
                  <div 
                    className="w-full aspect-[4/5] rounded-sm shadow-lg ring-1 ring-white/10 transition-all duration-300 relative overflow-hidden" 
                    style={{ backgroundColor: c.color }}
                  >
                     <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                  <div className="text-center">
                    <div className="text-[10px] text-gray-500 font-mono uppercase tracking-wide">{c.label}</div>
                    <div className="text-[10px] text-white font-mono uppercase mt-0.5 opacity-60 group-hover:opacity-100 transition-opacity">{c.color}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Typography & Details (5 cols) */}
        <div className="lg:col-span-5 p-8 bg-dark-800 space-y-8 flex flex-col h-full border-l border-white/5">
           
           {/* Typography */}
           <div>
              <div className="flex items-center gap-2 mb-4 text-white/80">
                <Type size={18} className="text-brand-500" />
                <h3 className="font-semibold text-sm uppercase tracking-wider">Typography</h3>
             </div>
             <div className="space-y-6 bg-dark-900/80 p-6 rounded-xl border border-white/5 shadow-sm">
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <p className="text-xs text-gray-500 font-mono uppercase">Heading</p>
                    <p className="text-xs text-brand-400 font-mono">{data.typography.heading}</p>
                  </div>
                  <p className="text-3xl text-white leading-tight" style={{ fontFamily: data.typography.heading }}>
                    {data.brandName}
                  </p>
                </div>
                <div className="h-px bg-white/10"></div>
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <p className="text-xs text-gray-500 font-mono uppercase">Body</p>
                    <p className="text-xs text-brand-400 font-mono">{data.typography.body}</p>
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed opacity-90" style={{ fontFamily: data.typography.body }}>
                    {data.description}
                  </p>
                </div>
             </div>
           </div>

           {/* Brand Story Snippet */}
           <div className="flex-grow">
             <div className="flex items-center gap-2 mb-3 text-white/80">
                <FileImage size={18} className="text-brand-500" />
                <h3 className="font-semibold text-sm uppercase tracking-wider">Logic Context</h3>
             </div>
             <p className="text-xs font-mono text-gray-400 leading-relaxed border-l-2 border-brand-500/30 pl-4 py-2 bg-white/5 rounded-r">
               Input: {data.usage.toLowerCase()} <br/>
               Strategy: {data.colors.primary} tonal geometric assembly.
             </p>
           </div>

           {/* Call to Action */}
           <div className="mt-auto pt-6 border-t border-white/10">
             <div className="bg-gradient-to-br from-brand-900/20 to-dark-900 border border-brand-500/20 rounded-xl p-5 relative overflow-hidden group hover:border-brand-500/40 transition-colors">
                <div className="relative z-10">
                  <h4 className="font-semibold text-white flex items-center gap-2 font-mono text-sm">
                    <Lock size={14} className="text-brand-400" />
                    DOWNLOAD SPEC PACKAGE
                  </h4>
                  <ul className="text-xs text-gray-500 mt-3 space-y-2 mb-5 font-mono">
                    <li className="flex items-center gap-2">JSON Specification File</li>
                    <li className="flex items-center gap-2">CSS/Tailwind Config</li>
                  </ul>
                  <Button variant="secondary" fullWidth size="sm" onClick={() => alert("Simulating Export...")} className="shadow-lg shadow-brand-900/20 font-mono text-xs">
                    EXPORT JSON ({data.logo.fileFormats[0]})
                  </Button>
                </div>
             </div>
           </div>

        </div>
      </div>
    </div>
  );
};

export default BrandCard;