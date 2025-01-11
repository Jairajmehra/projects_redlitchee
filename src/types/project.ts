export interface Project {
  name: string;
  locality: string;
  propertyType: string;
  unitSizes: string;
  bhk: string;
  brochureLink: string;
  rera: string;
}

export interface ApiResponse {
  limit: number;
  page: number;
  projects: Project[];
  total: number;
} 