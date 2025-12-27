import Link from 'next/link';

/**
 * Landing Page
 * 
 * Simple landing page with link to branding creation flow.
 */

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        <h1 className="text-5xl font-bold mb-6">
          Build a professional brand identity
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-purple-400">
            with mathematical precision.
          </span>
        </h1>
        <p className="text-xl text-gray-400 mb-8">
          Get a complete, production-ready design system. We define the exact visual rules and color palettes you need for a consistent presence across all platforms.
        </p>
        <Link
          href="/create"
          className="inline-block px-8 py-4 bg-brand-600 text-white rounded-lg font-semibold hover:bg-brand-500 transition-all"
        >
          Create Your Brand
        </Link>
      </div>
    </div>
  );
}

