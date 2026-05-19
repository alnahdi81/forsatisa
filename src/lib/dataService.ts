import { Job, Ad } from '../types';

const MOCK_JOBS: Job[] = [];

export const getStoredJobs = (): Job[] => {
  const jobMap = new Map<string, Job>();
  
  // 1. Add mock jobs first as base
  if (Array.isArray(MOCK_JOBS)) {
    MOCK_JOBS.slice().forEach(j => {
      if (j && j.id) {
        jobMap.set(j.id, {
          ...j,
          createdAt: { toDate: () => (j.createdAt?.toDate ? j.createdAt.toDate() : new Date()) }
        });
      }
    });
  }
  
  // 2. Overwrite or add with stored jobs from known keys
  // Always use forsati_jobs as the primary source
  const keysToProcess = ['jobs', 'all_jobs', 'forsati-jobs', 'forsati_jobs'];
  keysToProcess.forEach(key => {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          parsed.forEach((j: any) => {
            if (j && j.id) {
              // Reconstruct date
              let dateVal: any = j.createdAtDate || j.createdAt || j.createdAtManual;
              if (typeof dateVal === 'object' && dateVal?.seconds) {
                dateVal = dateVal.seconds * 1000;
              }
              
              let finalDate: Date;
              if (dateVal) {
                const dateObj = new Date(dateVal);
                finalDate = isNaN(dateObj.getTime()) ? new Date() : dateObj;
              } else {
                finalDate = new Date();
              }
              
              jobMap.set(j.id, {
                ...j,
                createdAt: { toDate: () => finalDate }
              });
            }
          });
        }
      }
    } catch (e) {
      console.error(`Error parsing jobs from ${key}`, e);
    }
  });

  // 3. Return as sorted array (newest first)
  return Array.from(jobMap.values()).sort((a, b) => {
    const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
    const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
    if (timeB !== timeA) return timeB - timeA;
    return String(b.id).localeCompare(String(a.id));
  });
};

export const getStoredAds = (): Ad[] => {
  const saved = localStorage.getItem('forsati_ads');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch (e) {
      console.error('Error parsing ads', e);
    }
  }
  
  // Default Ads if none stored
  return [];
};

export const saveStoredAds = (ads: Ad[]) => {
  localStorage.setItem('forsati_ads', JSON.stringify(ads));
};
