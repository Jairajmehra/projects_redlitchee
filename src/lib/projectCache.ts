import type { ResidentialProject, ResidentialApiResponse, CommercialProject, CommercialApiResponse } from '@/types/project';

let projectCache: ResidentialProject[] | null = null;
let commercialProjectCache: CommercialProject[] | null = null;

const formatResidentialProject = (project: ResidentialApiResponse['projects'][0]): ResidentialProject => ({
  name: project.name,
  locality: Array.isArray(project.localityNames) ? project.localityNames.join(', ') : '',
  propertyType: project.projectType[0] || '',
  unitSizes: project.configuration.value,
  bhk: Array.isArray(project.bhk) ? project.bhk : [],
  brochureLink: project.brochureLink,
  rera: project.rera,
  certificateLink: project.certificateLink,
  configuration: project.configuration,
  coordinates: project.coordinates,
  coverPhotoLink: project.coverPhotoLink,
  endDate: project.endDate,
  localityNames: project.localityNames,
  mobile: project.mobile,
  numberOfTowers: project.numberOfTowers,
  photos: project.photos,
  planPassingAuthority: project.planPassingAuthority,
  price: project.price,
  projectAddress: project.projectAddress,
  projectLandArea: project.projectLandArea,
  projectStatus: project.projectStatus,
  projectType: Array.isArray(project.projectType) ? project.projectType : [],
  promoterName: project.promoterName,
  startDate: project.startDate,
  totalUnits: project.totalUnits,
  totalUnitsAvailable: project.totalUnitsAvailable
});

export async function getAllProjects(): Promise<ResidentialProject[]> {
  if (projectCache) {
    return projectCache;
  }

  const projects: ResidentialProject[] = [];
  let page = 1;
  const limit = 100;

  while (true) {
    const res = await fetch(
      `https://test-vision-api-389008.el.r.appspot.com/projects?page=${page}&limit=${limit}`,
      {
        next: { revalidate: 3600 },
        cache: 'force-cache',
      }
    );

    const data: ResidentialApiResponse = await res.json();
    projects.push(...data.projects.map(formatResidentialProject));

    if (projects.length >= data.total) break;
    page++;
  }

  projectCache = projects;
  return projects;
}

export async function getAllCommercialProjects(): Promise<CommercialProject[]> {
  if (commercialProjectCache) {
    return commercialProjectCache;
  }

  const projects: CommercialProject[] = [];
  let page = 1;
  const limit = 100;

  while (true) {
    const res = await fetch(
      `https://test-vision-api-389008.el.r.appspot.com/commercial_projects?page=${page}&limit=${limit}`,
      {
        next: { revalidate: 3600 },
        cache: 'force-cache',
      }
    );

    const data: CommercialApiResponse = await res.json();
    
    const formattedProjects = data.projects.map(project => ({
      name: project.name,
      sizes: project.averageCarpetArea,
      possession: new Date(project.endDate).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
      }),
      brochureLink: project.brochureLink,
      description: project.description,
      about: project.aboutProject,
      coverImage: project.coverPhotoLink,
      rera: project.rera,
      planPassingAuthority: project.planPassingAuthority,
      certificateLink: project.certificateLink,
      mobile: project.mobile,
      totalUnits: project.totalUnits,
      approvedDate: project.approvedDate,
      numberOfTowers: project.numberOfTowers,
      projectLandArea: project.projectLandArea,
      projectStatus: project.projectStatus,
      projectType: project.projectType,
      promoterName: project.promoterName,
      totalOpenArea: project.totalOpenArea,
      totalCoveredArea: project.totalCoveredArea,
      totalUnitsAvailable: project.totalUnitsAvailable,
      district: project.district
    }));

    projects.push(...formattedProjects);

    if (!data.has_more) break;
    page++;
  }

  commercialProjectCache = projects;
  return projects;
}

export function getProjectSlug(name: string): string {
  return encodeURIComponent(name.toLowerCase().replace(/\s+/g, '-'));
}

export async function getProjectBySlug(slug: string): Promise<CommercialProject | null> {
  const projects = await getAllCommercialProjects();
  return projects.find(
    (p) => getProjectSlug(p.name) === slug
  ) || null;
} 
