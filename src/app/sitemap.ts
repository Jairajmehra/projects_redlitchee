import { MetadataRoute } from 'next';
import { getAllProjects } from '@/lib/projectCache';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Get all projects
  const projects = await getAllProjects();
  
  // Base URL from environment or default
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://projects.redlitchee.com'; // Replace with your actual domain

  // Create project URLs
  const projectUrls = projects.map((project) => {
    const slug = encodeURIComponent(project.name.toLowerCase().replace(/\s+/g, '-'));
    return {
      url: `${baseUrl}/projects/${slug}`,
      lastModified: new Date(), // You might want to add a lastModified field to your project data
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    };
  });

  // Add other static routes
  const staticRoutes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/projects`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
  ];

  return [...staticRoutes, ...projectUrls];
} 