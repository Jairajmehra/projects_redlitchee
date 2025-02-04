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
  description: string;
  coverImage: string;
  rera: string;
  planPassingAuthority: string;
  certificateLink: string;
  mobile: string;
  district: string;
  promoterName: string;
  projectType: string;
  approvedDate: string;
  projectLandArea: string;
  totalOpenArea: string;
  totalCoveredArea: string;
  projectStatus: string;
  totalUnits: string;
  totalUnitsAvailable: string;
  numberOfTowers: string;
}

export interface ApiResponse {
  limit: number;
  page: number;
  projects: Project[];
  total: number;
  has_more: boolean;
}

export interface CommercialApiResponse {
  limit: number;
  page: number;
  projects: Array<{
    name: string;
    description: string;
    averageCarpetArea: string;
    endDate: string;
    brochureLink: string;
    coverPhotoLink: string;
    aboutProject: string;
    rera: string;
    planPassingAuthority: string;
    certificateLink: string;
    district: string;
    mobile: string;
    totalUnits: string;
    approvedDate: string;
    numberOfTowers: string;
    projectLandArea: string;
    projectStatus: string;
    projectType: string;
    promoterName: string;
    totalOpenArea: string;
    totalCoveredArea: string;
    totalUnitsAvailable: string;
    projectAddress: string;
    email: string;
    extendedEndDate: string;
    originalEndDate: string;
    promoterAddress: string;
    promoterPhone: string;
    startDate: string;
    type: string;
  }>;
  total: number;
  has_more: boolean;
  status: string;
} 