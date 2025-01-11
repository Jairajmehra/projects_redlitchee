import type { Project, ApiResponse } from '@/types/project';

let projectCache: Project[] | null = null;

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