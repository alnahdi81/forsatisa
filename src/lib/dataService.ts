import { Job, Ad } from '../types';

const MOCK_JOBS: Job[] = [
  {
    id: 'snb-1',
    title: 'البنك الأهلي السعودي يعلن عن طرح وظائف لحديثي التخرج والخبرة',
    company: 'البنك الأهلي السعودي',
    category: 'company',
    location: 'المملكة العربية السعودية',
    status: 'active',
    description: 'يعلن البنك الأهلي السعودي عن فتح باب التقديم في عدة مسارات وظيفية لحديثي التخرج وأصحاب الخبرات في مختلف التخصصات الإدارية والتقنية والمالية.',
    externalLink: 'https://example.com',
    image: 'https://upload.wikimedia.org/wikipedia/ar/thumb/4/4b/Saudi_National_Bank_Logo.svg/1200px-Saudi_National_Bank_Logo.svg.png',
    createdAt: { toDate: () => new Date('2026-05-18') }
  },
  {
    id: 'aramco-grad-1',
    title: 'برنامج الرواد للمتميزين (أرامكو السعودية) 2026 للابتعاث والتدريب',
    company: 'أرامكو السعودية',
    category: 'employment_training',
    location: 'الظهران',
    status: 'active',
    description: 'تعلن أرامكو السعودية عن بدء التقديم في برنامج الرواد للمتميزين والذي يستهدف حديثي التخرج من الجامعات العالمية والمحلية في مختلف التخصصات الهندسية.',
    externalLink: 'https://example.com',
    image: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/44/Saudi_Aramco_logo.svg/1200px-Saudi_Aramco_logo.svg.png',
    createdAt: { toDate: () => new Date('2026-05-19') }
  },
  {
    id: 'mod-2026',
    title: 'وزارة الدفاع تعلن فتح باب القبول في الكليات العسكرية (ثانوية عامة)',
    company: 'وزارة الدفاع',
    category: 'military',
    location: 'المملكة العربية السعودية',
    status: 'soon',
    description: 'قريباً.. اللجنة المركزية لقبول طلاب الكليات العسكرية بوزارة الدفاع تعلن عن فتح باب التقديم لخريجي الثانوية العامة لعام 1447هـ.',
    externalLink: 'https://example.com',
    image: 'https://upload.wikimedia.org/wikipedia/ar/5/52/%D8%B4%D8%B9%D8%A7%D8%B1_%D9%88%D8%B2%D8%A7%D8%B1%D8%A9_%D8%A7%D9%84%D8%AF%D9%81%D8%A7%D8%B9_%D8%A7%D9%84%D8%B3%D8%B1%D9%88%D8%AF%D9%8A%D8%A9.png',
    createdAt: { toDate: () => new Date('2026-05-19') }
  },
  {
    id: 'pif-1',
    title: 'صندوق الاستثمارات العامة (PIF) يعلن عن برنامج تطوير الخريجين 2026',
    company: 'صندوق الاستثمارات العامة',
    category: 'government',
    location: 'الرياض',
    status: 'active',
    description: 'يعلن صندوق الاستثمارات العامة عن بدء التقديم في برنامج تطوير الخريجين بنسخته الثامنة لعام 2026 في كافة المسارات التخصصية.',
    externalLink: 'https://example.com',
    image: 'https://upload.wikimedia.org/wikipedia/ar/thumb/0/0e/Public_Investment_Fund_%28Saudi_Arabia%29_Logo.svg/1200px-Public_Investment_Fund_%28Saudi_Arabia%29_Logo.svg.png',
    createdAt: { toDate: () => new Date('2026-05-19') }
  },
  {
    id: 'neom-1',
    title: 'نيوم تعلن عن فتح التقديم في برنامج "نيوم للابتعاث" المنتهي بالتوظيف',
    company: 'نيوم',
    category: 'employment_training',
    location: 'نيوم',
    status: 'active',
    description: 'تعلن شركة نيوم عن فتح باب التقديم في برنامج نيوم للابتعاث الداخلي والخارجي المنتهي بالتوظيف لخريجي الثانوية المتميزين.',
    externalLink: 'https://example.com',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/NEOM_Logo.svg/1200px-NEOM_Logo.svg.png',
    createdAt: { toDate: () => new Date('2026-05-19') }
  }
];

export const getStoredJobs = (): Job[] => {
  const jobMap = new Map<string, Job>();
  
  // 1. Add mock jobs first as base
  MOCK_JOBS.slice().forEach(j => {
    jobMap.set(j.id, {
      ...j,
      createdAt: { toDate: () => (j.createdAt?.toDate ? j.createdAt.toDate() : new Date()) }
    });
  });
  
  // 2. Overwrite or add with stored jobs from all known keys
  const keysToProcess = ['all_jobs', 'jobs', 'forsati-jobs', 'forsati_jobs'];
  keysToProcess.forEach(key => {
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          parsed.forEach((j: any) => {
            // Reconstruct date
            let dateVal: any = j.createdAtDate || j.createdAt;
            if (typeof dateVal === 'object' && dateVal?.seconds) {
              dateVal = dateVal.seconds * 1000;
            }
            const dateObj = new Date(dateVal || Date.now());
            const finalDate = isNaN(dateObj.getTime()) ? new Date() : dateObj;
            
            jobMap.set(j.id, {
              ...j,
              createdAt: { toDate: () => finalDate }
            });
          });
        }
      } catch (e) {
        console.error(`Error parsing jobs from ${key}`, e);
      }
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
