export interface Project {
  name: string;
  locality: string;
  propertyType: string;
  unitSizes: string;
  bhk: string;
  brochureLink: string;
  rera: string;
}

export interface CommercialProject {
  name: string;
  sizes: string;
  possession: string;
  brochureLink: string;
  about: string;
  coverImage: string;
}

export interface ApiResponse {
  limit: number;
  page: number;
  projects: Project[];
  total: number;
} 