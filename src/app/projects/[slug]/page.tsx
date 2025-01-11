import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllProjects } from '@/lib/projectCache';
import type { Project } from '@/types/project';

// Update the component props interface to use Promises
interface PageProps {
  params: Promise<{ slug: string }>;
}

// Fetch individual project data
async function getProject(slug: string): Promise<Project | null> {
  const projects = await getAllProjects();
  return projects.find(
    (p) => encodeURIComponent(p.name.toLowerCase().replace(/\s+/g, '-')) === slug
  ) || null;
}

// Generate metadata for each page
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const project = await getProject(resolvedParams.slug);
  
  if (!project) {
    return {
      title: 'Project Not Found',
    };
  }

  return {
    title: `${project.name} | Redlitchee Realties`,
    description: `${project.bhk} property in ${project.locality}. ${project.propertyType} with unit sizes ${project.unitSizes}. RERA: ${project.rera}`,
  };
}

// Generate static paths
export async function generateStaticParams() {
  const projects = await getAllProjects();
  return projects.map((project) => ({
    slug: encodeURIComponent(project.name.toLowerCase().replace(/\s+/g, '-')),
  }));
}

export default async function ProjectPage({ params }: PageProps) {
  const resolvedParams = await params;
  const project = await getProject(resolvedParams.slug);
  
  if (!project) {
    notFound();
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">{project.name}</h1>
        
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Property Details</h2>
              <dl className="space-y-4">
                <div>
                  <dt className="text-gray-600">Location</dt>
                  <dd className="font-medium">{project.locality}</dd>
                </div>
                <div>
                  <dt className="text-gray-600">Property Type</dt>
                  <dd className="font-medium">{project.propertyType}</dd>
                </div>
                <div>
                  <dt className="text-gray-600">Configuration</dt>
                  <dd className="font-medium">{project.bhk}</dd>
                </div>
              </dl>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-4">Additional Information</h2>
              <dl className="space-y-4">
                <div>
                  <dt className="text-gray-600">Unit Sizes</dt>
                  <dd className="font-medium">{project.unitSizes}</dd>
                </div>
                <div>
                  <dt className="text-gray-600">RERA Number</dt>
                  <dd className="font-medium break-words">{project.rera}</dd>
                </div>
              </dl>
            </div>
          </div>
          
          <div className="mt-8">
            <a
              href={project.brochureLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-[#E55C5C] text-white py-3 px-8 rounded-full hover:bg-[#d45151] transition-colors"
            >
              Download Brochure
            </a>
          </div>
        </div>
      </div>
    </div>
  );
} 