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
    id: 'thamanya-1',
    title: 'شركة ثمانية تعلن عن فتح باب التوظيف لعدة تخصصات إبداعية وتقنية',
    company: 'شركة ثمانية',
    category: 'company',
    location: 'الرياض',
    status: 'active',
    description: 'تعلن شركة ثمانية للنشر والتوزيع عن رغبتها في استقطاب كفاءات متميزة للانضمام لفريقها في مجالات صناعة المحتوى، التصميم، والبرمجة.',
    externalLink: 'https://example.com',
    image: 'https://pbs.twimg.com/profile_images/1490244673621430275/0g_tW0M__400x400.jpg',
    createdAt: { toDate: () => new Date('2026-05-17') }
  },
  {
    id: 'aramco-grad-1',
    title: 'برنامج الرواد للمتميزين (أرامكو السعودية) 2026 للابتعاث والتدريب',
    company: 'أرامكو السعودية',
    category: 'employment_training',
    location: 'الظهران / الظهران',
    status: 'active',
    description: 'تعلن أرامكو السعودية عن بدء التقديم في برنامج الرواد للمتميزين والذي يستهدف حديثي التخرج من الجامعات العالمية والمحلية في مختلف التخصصات الهندسية والتقنية.',
    externalLink: 'https://example.com',
    image: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/44/Saudi_Aramco_logo.svg/1200px-Saudi_Aramco_logo.svg.png',
    createdAt: { toDate: () => new Date('2026-05-19') }
  },
  {
    id: 'tabby-1',
    title: 'شركة تابي (Tabby) تعلن عن فرص وظيفية في مجال التقنية والعمليات',
    company: 'شركة تابي',
    category: 'company',
    location: 'الرياض',
    status: 'active',
    description: 'تعلن تابي الرائدة في خدمات اشتر الآن وادفع لاحقاً عن توفر وظائف شاغرة في تخصصات هندسة البرمجيات وتحليل البيانات وخدمة العملاء.',
    externalLink: 'https://example.com',
    image: 'https://pbs.twimg.com/profile_images/1454743431670915072/XF7a7_o6_400x400.jpg',
    createdAt: { toDate: () => new Date('2026-05-17') }
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
  },
  {
    id: 'gosi-1',
    title: 'المؤسسة العامة للتأمينات الاجتماعية تعلن وظائف إدارية وقانونية وتقنية',
    company: 'التأمينات الاجتماعية',
    category: 'government',
    location: 'الرياض',
    status: 'active',
    description: 'تعلن المؤسسة العامة للتأمينات الاجتماعية عن توفر عدد من الوظائف الشاغرة بمقر المؤسسة الرئيسي بالرياض للفئات التالية.',
    externalLink: 'https://example.com',
    image: 'https://upload.wikimedia.org/wikipedia/ar/thumb/a/a2/GOSI_Logo.svg/1200px-GOSI_Logo.svg.png',
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
  return [
    {
      id: 'ad-1',
      title: 'إعلان تجريبي 1',
      image: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80&w=1200',
      link: 'https://google.com',
      position: 'home_hero'
    },
    {
      id: 'ad-2',
      title: 'إعلان تجريبي 2',
      image: 'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?auto=format&fit=crop&q=80&w=1200',
      link: 'https://google.com',
      position: 'sidebar'
    }
  ];
};

export const saveStoredAds = (ads: Ad[]) => {
  localStorage.setItem('forsati_ads', JSON.stringify(ads));
};
