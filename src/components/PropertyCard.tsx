import Link from 'next/link';
import type { Project } from '@/types/project';

type PropertyCardProps = Project;

export default function PropertyCard({
  name,
  locality,
  propertyType,
  unitSizes,
  bhk,
  brochureLink,
}: PropertyCardProps) {
  const slug = encodeURIComponent(name.toLowerCase().replace(/\s+/g, '-'));

  return (
    <div className="bg-white rounded-lg shadow-md p-6 flex flex-col gap-4 min-w-[280px]">
      <Link href={`/projects/${slug}`} className="hover:text-[#E55C5C] transition-colors">
        <h3 className="text-lg font-semibold">{name}</h3>
      </Link>
      
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-600">Locality</span>
          <span>{locality}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Property Type</span>
          <span>{propertyType}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">BHK</span>
          <span>{bhk}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">Unit Sizes</span>
          <span>{unitSizes}</span>
        </div>
      </div>

      <a 
        href={brochureLink}
        target="_blank" 
        rel="noopener noreferrer"
        className="mt-auto bg-[#E55C5C] text-white py-2 px-6 rounded-full self-end hover:bg-[#d45151] transition-colors text-center"
      >
        Brochure
      </a>
    </div>
  );
} 