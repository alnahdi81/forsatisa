export interface Job {
  id: string;
  title: string;
  description: string;
  company: string;
  category: string;
  status: 'active' | 'soon' | 'expiring' | 'expired';
  location: string;
  image?: string;
  externalLink: string;
  createdAt?: any;
  createdAtManual?: string;
  createdAtDate?: string;
}

export interface Ad {
  id: string;
  title: string;
  image: string;
  link: string;
  position: 'home_hero' | 'sidebar' | 'job_detail';
  createdAt?: any;
}

export type JobCategory = 'military' | 'company' | 'government' | 'semi_government' | 'remote' | 'university' | 'training' | 'employment_training';
