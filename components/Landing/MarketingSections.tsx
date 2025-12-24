import React from 'react';
import { Layers, Zap, PenTool, ShieldCheck } from 'lucide-react';

export const FeaturesSection: React.FC = () => {
  return (
    <div className="py-24 bg-white text-dark-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl font-serif">
            A complete brand system, generated in minutes.
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Stop staring at a blank canvas. BrandForge acts as your creative director, generating professional assets tailored to your market.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              icon: <Layers className="w-6 h-6 text-brand-600" />,
              title: "Structured Discovery",
              desc: "Guided conversation ensures no vital brand aspect is overlooked."
            },
            {
              icon: <PenTool className="w-6 h-6 text-brand-600" />,
              title: "Vector Logos",
              desc: "Get production-ready SVG files, not just raster images."
            },
            {
              icon: <Zap className="w-6 h-6 text-brand-600" />,
              title: "Instant Guidelines",
              desc: "Auto-generated PDF brand books to share with your team."
            },
            {
              icon: <ShieldCheck className="w-6 h-6 text-brand-600" />,
              title: "Commercial Rights",
              desc: "Full ownership of all generated assets for your business."
            }
          ].map((feature, idx) => (
            <div key={idx} className="p-6 bg-gray-50 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm mb-4">
                {feature.icon}
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const SEOBlock: React.FC = () => {
  return (
    <div className="py-16 bg-gray-50 border-t border-gray-200 text-dark-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Brand Kit Generator for Startups</h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Creating a cohesive brand identity is crucial for SaaS and startup success. Our AI brand guidelines generator removes the friction of hiring expensive agencies. 
              Get a free brand logo generator experience with professional-grade outcomes. From color palette generation to typography selection, 
              BrandForge is the ultimate brand identity tool for modern founders.
            </p>
            <div className="flex gap-4">
               <a href="#" className="text-sm font-medium text-brand-600 hover:text-brand-700 hover:underline">SaaS Branding</a>
               <a href="#" className="text-sm font-medium text-brand-600 hover:text-brand-700 hover:underline">Startup Logos</a>
               <a href="#" className="text-sm font-medium text-brand-600 hover:text-brand-700 hover:underline">Identity Systems</a>
            </div>
          </div>
          
          {/* Replaced Placeholder with Code Snippet Visual */}
          <div className="relative group">
             <div className="absolute -inset-1 bg-gradient-to-r from-brand-500 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
             <div className="relative bg-dark-900 p-6 rounded-xl shadow-2xl border border-white/10 ring-1 ring-white/10">
                {/* Window Controls */}
                <div className="flex items-center gap-1.5 mb-6 border-b border-white/5 pb-4">
                  <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                  <div className="ml-auto text-[10px] text-gray-500 font-mono flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    generated_system.json
                  </div>
                </div>
                
                {/* Code */}
                <div className="font-mono text-xs sm:text-sm leading-relaxed overflow-hidden">
                  <div className="text-purple-400">{"{"}</div>
                  <div className="pl-4">
                    <span className="text-blue-400">"brandName"</span>: <span className="text-emerald-400">"Nexus AI"</span>,
                  </div>
                  <div className="pl-4">
                    <span className="text-blue-400">"tagline"</span>: <span className="text-emerald-400">"Future of Intelligence"</span>,
                  </div>
                  <div className="pl-4">
                    <span className="text-blue-400">"palette"</span>: <span className="text-yellow-500">{"{"}</span>
                  </div>
                  <div className="pl-8">
                    <span className="text-blue-400">"primary"</span>: <span className="text-orange-400">"#6366F1"</span>,
                  </div>
                  <div className="pl-8">
                    <span className="text-blue-400">"background"</span>: <span className="text-orange-400">"#0F172A"</span>
                  </div>
                  <div className="pl-4 text-yellow-500">{"},"}</div>
                  <div className="pl-4">
                    <span className="text-blue-400">"deliverables"</span>: <span className="text-gray-400">[</span>
                  </div>
                  <div className="pl-8">
                    <span className="text-emerald-400">"logo-vector.svg"</span>,
                  </div>
                  <div className="pl-8">
                    <span className="text-emerald-400">"brand-guide.pdf"</span>
                  </div>
                  <div className="pl-4 text-gray-400">]</div>
                  <div className="text-purple-400">{"}"}</div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};