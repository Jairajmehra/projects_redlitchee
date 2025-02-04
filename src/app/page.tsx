'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function LandingPage() {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-white">
      <Navbar currentPath={pathname} />

      {/* Hero Section */}
      <div className="relative px-6 lg:px-8">
        <div className="mx-auto max-w-3xl pt-20 pb-32">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Redlitchee Realties
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Discover RERA registered residential and commercial properties across Gujarat. 
              Browse through our comprehensive collection of real estate projects.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/residential"
                className="rounded-full bg-[#E55C5C] px-8 py-3 text-lg font-semibold text-white shadow-sm hover:bg-[#d45151] transition-colors"
              >
                Residential Projects
              </Link>
              <Link
                href="/commercial"
                className="rounded-full bg-[#E55C5C] px-8 py-3 text-lg font-semibold text-white shadow-sm hover:bg-[#d45151] transition-colors"
              >
                Commercial Projects
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="relative p-6 bg-white rounded-2xl shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900">RERA Registered</h3>
              <p className="mt-2 text-gray-600">
                All listed properties are RERA registered, ensuring compliance and security for your investment.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="relative p-6 bg-white rounded-2xl shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900">Comprehensive Information</h3>
              <p className="mt-2 text-gray-600">
                Detailed project information, brochures, and specifications available for all properties.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="relative p-6 bg-white rounded-2xl shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900">Wide Coverage</h3>
              <p className="mt-2 text-gray-600">
                Properties across Ahmedabad, Surat, Vadodara, and other major cities in Gujarat.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
