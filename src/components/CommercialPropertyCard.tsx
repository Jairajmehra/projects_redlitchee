'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { CommercialProject } from '@/types/project';
import { getProjectSlug } from '@/lib/projectCache';

type CommercialPropertyCardProps = CommercialProject;

export default function CommercialPropertyCard({
  name,
  sizes,
  possession,
  brochureLink,
  about,
  coverImage,
  district,
  projectType
}: CommercialPropertyCardProps) {
  const router = useRouter();
  const [imgSrc, setImgSrc] = useState(coverImage || '/commercial_building.png');
  const [imgError, setImgError] = useState(false);

  const handleImageError = () => {
    setImgError(true);
    setImgSrc('/commercial_building.png');
  };

  const slug = getProjectSlug(name);

  const handleCardClick = () => {
    router.push(`/commercial/${encodeURIComponent(name.toLowerCase().replace(/\s+/g, '-'))}`);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-[1.02]">
      {/* Clickable area for card navigation */}
      <button 
        onClick={handleCardClick}
        className="w-full text-left"
      >
        {/* Cover Image */}
        <div className="relative w-full h-48">
          <Image
            src={imgSrc}
            alt={`${name} -  ${about} site image`}
            fill
            className="object-cover"
            onError={handleImageError}
            unoptimized={imgError}
            priority
          />
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <h3 className="text-xl font-semibold font-mono">{name}</h3>
          
          <p className="text-gray-600">{about}</p>

          <div className="space-y-2">
            <div className="flex items-center">
              <span className="font-mono">Sizes:</span>
              <span className="ml-2 text-gray-600">{sizes}</span>
            </div>

            <div className="flex items-center">
              <span className="font-mono">Possession:</span>
              <span className="ml-2 text-gray-600">{possession}</span>
            </div>
          </div>
        </div>
      </button>

      {/* Separate brochure link */}
      <div className="px-6 pb-6">
        <a 
          href={brochureLink}
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-block bg-[#E55C5C] text-white py-2 px-8 rounded-full hover:bg-[#d45151] transition-colors"
        >
          Brochure
        </a>
      </div>
    </div>
  );
} 