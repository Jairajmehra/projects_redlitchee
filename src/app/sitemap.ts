import { MetadataRoute } from 'next';
import { getAllProjects, getAllCommercialProjects, getProjectSlug } from '@/lib/projectCache';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const [residentialProjects, commercialProjects] = await Promise.all([
      getAllProjects(),
      getAllCommercialProjects()
    ]);
    
    console.log('Commercial Projects Count:', commercialProjects.length); // Debug log
    
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://projects.redlitchee.com';

    // Create residential project URLs
    const residentialUrls = residentialProjects.map((project) => ({
      url: `${baseUrl}/projects/${getProjectSlug(project.name)}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    // Create commercial project URLs
    const commercialUrls = commercialProjects.map((project) => ({
      url: `${baseUrl}/commercial/${getProjectSlug(project.name)}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    console.log('Commercial URLs:', commercialUrls); // Debug log

    // Add static routes
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
      {
        url: `${baseUrl}/commercial`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.9,
      }
    ];

    return [...staticRoutes, ...residentialUrls, ...commercialUrls];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    // Return at least static routes if there's an error
    return [
      {
        url: process.env.NEXT_PUBLIC_BASE_URL || 'https://projects.redlitchee.com',
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 1,
      }
    ];
  }
}