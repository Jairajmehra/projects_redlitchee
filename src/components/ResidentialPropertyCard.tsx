'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { ResidentialProject } from '@/types/project';

// Subcomponent for configuration tags (BHK)
function ConfigurationTag({ text }: { text: string }) {
  return (
    <div className="flex justify-center items-center px-2 py-1 gap-1 rounded bg-[#70BCE4] text-black text-base font-medium font-sf-pro">
      {text}
    </div>
  );
}

// Subcomponent for project type tags
function ProjectTypeTag({ text }: { text: string }) {
  return (
    <div className="flex justify-center items-center px-2 py-1 gap-1 rounded bg-[#FFE386] text-black text-base font-medium font-sf-pro">
      {text}
    </div>
  );
}

// Subcomponent for project status tag
function ProjectStatusTag({ status }: { status: string }) {
  return (
    <div className="flex justify-center items-center px-2 py-1 gap-1 rounded bg-[#D4D4D4] text-black text-base font-medium font-sf-pro">
      {status}
    </div>
  );
}

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
    <div className="flex flex-col w-full bg-white rounded-xl overflow-hidden shadow-md font-sf-pro">
      {/* Cover Image */}
      <div className="relative w-full h-[225px]">
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

      {/* Main Content */}
      <div className="flex flex-col p-4 gap-3">
        {/* Project Name and Locality */}
        <div className="flex flex-col gap-1">
          <h3 className="text-xl font-semibold text-[#323232] line-clamp-2 font-sf-pro">{name}</h3>
          <p className="text-base text-[#666464] font-sf-pro">{locality}</p>
        </div>

        {/* Configurations and Project Types */}
        <div className="flex gap-3">
          {/* BHK Configurations */}
          <div className="flex-1 flex flex-col gap-2">
            <span className="text-base text-gray-600 font-medium font-sf-pro">Configurations</span>
            <div className="flex flex-wrap gap-2">
              {bhk.map((type) => (
                <ConfigurationTag key={type} text={type} />
              ))}
            </div>
          </div>

          {/* Project Types */}
          <div className="flex-1 flex flex-col gap-2">
            <span className="text-base text-gray-600 font-medium font-sf-pro">Project Type</span>
            <div className="flex flex-wrap gap-2">
              {projectType.map((type) => (
                <ProjectTypeTag key={type} text={type} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Price and Status Footer */}
      <div className="flex justify-between items-center px-4 py-4 bg-[#F2F1F1] mt-auto">
        <span className="font-semibold text-lg text-[#323232] font-sf-pro">
          {price.value}
        </span>
        <ProjectStatusTag status={projectStatus} />
      </div>
    </div>
  );
} 