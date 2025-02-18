import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getAllCommercialProjects, getProjectBySlug, getProjectSlug } from '@/lib/projectCache';
import type { Metadata } from 'next';
import type { CommercialProject } from '@/types/project';


interface PageProps {
  params: Promise<{ slug: string }>;
}


export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const project = await getProjectBySlug(resolvedParams.slug);
  
  if (!project) {
    return {
      title: 'Project Not Found | Redlitchee Realties',
      description: 'The requested commercial property could not be found.',
    };
  }

  return {
    title: `${project.name} | ${project.about} | Redlitchee Realties`,
    description: `Buy, sell or rent ${project.about} in ${project.name}. RERA registered project in ${project.district}.`,
    keywords: `${project.name}, brochure, pdf, commercial project, offices, shops, industrial sheds, ${project.planPassingAuthority}, RERA: ${project.rera}`,
    alternates: {
      canonical: `/commercial/${getProjectSlug(project.name)}`,
    },
    openGraph: {
      title: `${project.name} | ${project.about}`,
      description: `Buy, sell or rent ${project.about} in ${project.name}. RERA registered project in ${project.district}.`,
      images: [
        {
          url: project.coverImage || '/commercial_building.png',
          width: 1200,
          height: 630,
          alt: project.name,
        },
      ],
    },
  };
}

export async function generateStaticParams() {
  const projects = await getAllCommercialProjects();
  return projects.map((project) => ({
    slug: getProjectSlug(project.name),
  }));
}

// Generate structured data for the page
function generateStructuredData(project: CommercialProject) {
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    "name": project.name,
    "description": `Buy, sell or rent ${project.about} in ${project.name}. RERA registered project in ${project.district}.`,
    "url": `${process.env.NEXT_PUBLIC_BASE_URL}/commercial/${getProjectSlug(project.name)}`,
    "datePosted": new Date().toISOString(),
    "propertyType": project.projectType,
  };
}

export default async function CommercialProjectPage({ params }: PageProps) {
  const resolvedParams = await params;
  const project = await getProjectBySlug(resolvedParams.slug);
  
  if (!project) {
    notFound();
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateStructuredData(project))
        }}
      />
      <div className="min-h-screen bg-gray-50">
        {/* Cover Image */}
        <div className="relative w-full h-[400px]">
          <Image
            src={project.coverImage || '/commercial_building.png'}
            alt={`${project.name} - ${project.about} site image`}
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
          {/* Project Name and About */}
          <div>
            <h1 className="text-3xl font-bold mb-4">{project.name}</h1>
            <p className="text-gray-600">{project.about}</p>
          </div>

          {/* RERA Number */}
          <div>
            <p className="text-sm text-gray-500">RERA Registration Number:</p>
            <p className="font-mono">{project.rera}</p>
          </div>

          {/* Info Boxes Grid */}
          <div className="grid grid-cols-3 gap-4">
            {/* Average Unit Sizes */}
            <div className="bg-gray-100 rounded-lg p-4 shadow-sm">
              <p className="text-gray-500 text-sm">Average Unit Sizes</p>
              <p className="font-medium">{project.sizes}</p>
            </div>

            {/* Total Units */}
            <div className="bg-gray-100 rounded-lg p-4 shadow-sm">
              <p className="text-gray-500 text-sm">Total Units</p>
              <p className="font-medium">{project.totalUnits}</p>
            </div>

            {/* Plan Passing Date */}
            <div className="bg-gray-100 rounded-lg p-4 shadow-sm">
              <p className="text-gray-500 text-sm">Plan Passing Date</p>
              <p className="font-medium">{project.approvedDate}</p>
            </div>
          </div>

          {/* Other Info Boxes */}
          <div className="grid grid-cols-2 gap-4">
            {/* Number of Towers */}
            <div className="bg-gray-100 rounded-lg p-4 shadow-sm">
              <p className="text-gray-500 text-sm">Number of Towers</p>
              <p className="font-medium">{project.numberOfTowers}</p>
            </div>

            {/* Project Land Area */}
            <div className="bg-gray-100 rounded-lg p-4 shadow-sm">
              <p className="text-gray-500 text-sm">Project Land Area</p>
              <p className="font-medium">{project.projectLandArea}</p>
            </div>

            {/* Project Status */}
            <div className="bg-gray-100 rounded-lg p-4 shadow-sm">
              <p className="text-gray-500 text-sm">Status</p>
              <p className="font-medium">{project.projectStatus}</p>
            </div>

            {/* Project Type */}
            <div className="bg-gray-100 rounded-lg p-4 shadow-sm">
              <p className="text-gray-500 text-sm">Project Type</p>
              <p className="font-medium">{project.projectType}</p>
            </div>

            {/* Developer Name */}
            <div className="bg-gray-100 rounded-lg p-4 shadow-sm">
              <p className="text-gray-500 text-sm">Developer Name</p>
              <p className="font-medium">{project.promoterName}</p>
            </div>

            {/* Total Open Area */}
            <div className="bg-gray-100 rounded-lg p-4 shadow-sm">
              <p className="text-gray-500 text-sm">Total Open Area</p>
              <p className="font-medium">{project.totalOpenArea}</p>
            </div>

            {/* Total Covered Area */}
            <div className="bg-gray-100 rounded-lg p-4 shadow-sm">
              <p className="text-gray-500 text-sm">Total Covered Area</p>
              <p className="font-medium">{project.totalCoveredArea}</p>
            </div>

            {/* Total Available Units */}
            <div className="bg-gray-100 rounded-lg p-4 shadow-sm">
              <p className="text-gray-500 text-sm">Total Available Units</p>
              <p className="font-medium">{project.totalUnitsAvailable}</p>
            </div>

            {/* Plan Passing Authority */}
            <div className="bg-gray-100 rounded-lg p-4 shadow-sm">
              <p className="text-gray-500 text-sm">Plan Passing Authority</p>
              <p className="font-medium">{project.planPassingAuthority}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 pt-4">
            <a
              href={project.brochureLink}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#E55C5C] text-white px-8 py-3 rounded-full hover:bg-[#d45151] transition-colors"
            >
              Brochure
            </a>
            <a
              href={project.certificateLink}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#E55C5C] text-white px-8 py-3 rounded-full hover:bg-[#d45151] transition-colors"
            >
              RERA Certificate
            </a>
            <a
              href={`tel:${project.mobile}`}
              className="bg-green-500 text-white px-8 py-3 rounded-full hover:bg-green-600 transition-colors"
            >
              Call
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

