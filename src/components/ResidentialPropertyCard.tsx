'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { ResidentialProject } from '@/types/project';

type ResidentialPropertyCardProps = ResidentialProject;

export default function ResidentialPropertyCard({
  name,
  locality,
  bhk,
  projectType,
  price,
  projectStatus,
  coverPhotoLink,
}: ResidentialPropertyCardProps) {
  const [imgSrc, setImgSrc] = useState(coverPhotoLink || '/residential_building.png');
  const [imgError, setImgError] = useState(false);

  const handleImageError = () => {
    setImgError(true);
    setImgSrc('/residential_building.png');
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-[1.02]">
      {/* Cover Image */}
      <div className="relative w-full h-48">
        <Image
          src={imgSrc}
          alt={`${name} - ${projectType.join(', ')} in ${locality}`}
          fill
          className="object-cover"
          onError={handleImageError}
          unoptimized={imgError}
          priority
        />
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Project Name and Locality */}
        <div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-semibold font-mono">{name}</h3>
            <span className="text-base text-gray-600">{locality}</span>
          </div>
        </div>

        {/* BHK Tags */}
        <div className="flex flex-wrap gap-2">
          {bhk.map((type) => (
            <span
              key={type}
              className="px-4 py-2 rounded-full text-base bg-blue-100 text-blue-800 font-medium"
            >
              {type}
            </span>
          ))}
        </div>

        {/* Project Type Tags */}
        <div className="flex flex-wrap gap-2">
          {projectType.map((type) => (
            <span
              key={type}
              className="px-4 py-2 rounded-full text-base bg-yellow-100 text-yellow-800 font-medium"
            >
              {type}
            </span>
          ))}
        </div>

        {/* Price and Status */}
        <div className="flex justify-between items-center pt-2">
          <div className="text-[#E55C5C] font-semibold text-lg">
            {price.value}
          </div>
          <div className="text-gray-600 text-lg">
            {projectStatus}
          </div>
        </div>
      </div>
    </div>
  );
} 