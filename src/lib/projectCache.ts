import type { Project, ApiResponse, CommercialProject, CommercialApiResponse } from '@/types/project';

let projectCache: Project[] | null = null;
let commercialProjectCache: CommercialProject[] | null = null;

export async function getAllProjects(): Promise<Project[]> {
  if (projectCache) {
    return projectCache;
  }

  const projects: Project[] = [];
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

    const data: ApiResponse = await res.json();
    projects.push(...data.projects);

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
      totalAvailableUnits: project.totalAvailableUnits
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
