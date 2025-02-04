import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface NavLink {
  href: string;
  label: string;
  isActive?: boolean;
}

interface NavbarProps {
  currentPath: string;
}

export default function Navbar({ currentPath }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const links: NavLink[] = [
    { href: '/', label: 'Home' },
    { href: '/commercial', label: 'Commercial' },
    { href: '/residential', label: 'Residential' },
  ];

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link href="/" className="text-2xl font-bold">
            Redlitchee Realties
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex gap-6">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`${
                  currentPath === link.href
                    ? 'text-[#E55C5C]'
                    : 'text-gray-600 hover:text-[#E55C5C]'
                } transition-colors`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(true)}
            aria-label="Open menu"
          >
            <Image
              src="/burger-menu.svg"
              alt="Menu"
              width={24}
              height={24}
            />
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsMenuOpen(false)}
          />
          
          {/* Drawer */}
          <div className="fixed right-0 top-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform duration-200 ease-in-out">
            <div className="p-4">
              <button
                onClick={() => setIsMenuOpen(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                aria-label="Close menu"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="mt-8 flex flex-col gap-4">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`${
                      currentPath === link.href
                        ? 'text-[#E55C5C]'
                        : 'text-gray-600 hover:text-[#E55C5C]'
                    } transition-colors text-lg`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </nav>
  );
} 