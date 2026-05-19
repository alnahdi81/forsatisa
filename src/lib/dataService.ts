import { Job, Ad } from '../types';

const MOCK_JOBS: Job[] = [
  {
    id: 'm1',
    title: 'فتح القبول في القوات المسلحة (المرتبة الموحدة)',
    company: 'وزارة الدفاع',
    category: 'military',
    status: 'active',
    location: 'جميع مناطق المملكة',
    externalLink: 'https://tmod.gov.sa',
    image: 'https://images.unsplash.com/photo-1590400368531-9bcc11f3f612?w=800&auto=format&fit=crop&q=60',
    description: 'تعلن وزارة الدفاع عن فتح باب القبول والتسجيل بالقوات المسلحة والأفرع التابعة لها للرجال والنساء على كافة الرتب والمؤهلات.'
  },
  {
    id: 'g1',
    title: 'وظائف إدارية وهندسية للجنسين',
    company: 'وزارة التعليم',
    category: 'government',
    status: 'active',
    location: 'الرياض',
    externalLink: 'https://moe.gov.sa',
    image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&auto=format&fit=crop&q=60',
    description: 'تعلن وزارة التعليم عن حاجتها لشغل وظائف إدارية وفنية وهندسية للعمل في قطاعات الوزارة ومكاتبها الرئيسية.'
  },
  {
    id: 'c1',
    title: 'برنامج تطوير الخريجين 2026',
    company: 'شركة أرامكو السعودية',
    category: 'company',
    status: 'soon',
    location: 'الظهران',
    externalLink: 'https://aramco.com',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=60',
    description: 'يعد برنامج أرامكو السعودية لتطوير الخريجين الفرصة المثالية لبدء مسار مهني متميز في أكبر شركة إمدادات طاقة متكاملة في العالم.'
  },
  {
    id: 'r1',
    title: 'مدخل بيانات (عن بعد) للمواطنين',
    company: 'شركة تجارة كبرى',
    category: 'remote',
    status: 'active',
    location: 'عمل عن بعد',
    externalLink: 'https://example.com/apply',
    description: 'مطلوب مدخلي بيانات للعمل عن بعد بدوام مرن، يشترط إجادة استخدام الحاسب الآلي والسرعة في الطباعة.'
  },
  {
    id: 'u1',
    title: 'مواعيد القبول للفصل الدراسي القادم',
    company: 'جامعة الملك سعود',
    category: 'university',
    status: 'expiring',
    location: 'الرياض',
    externalLink: 'https://ksu.edu.sa',
    description: 'تعلن عمادة القبول والتسجيل بجامعة الملك سعود عن الجدول الزمني للقبول لـ العام الدراسي القادم 1447هـ.'
  },
  {
    id: 't1',
    title: 'دورة الأمن السيبراني الشاملة (مجانية)',
    company: 'أكاديمية طويق',
    category: 'training',
    status: 'active',
    location: 'عبر الإنترنت',
    externalLink: 'https://tuwaiq.edu.sa',
    description: 'دورة تدريبية متقدمة في مجال الأمن السيبراني تهدف إلى إكساب المتدربين المهارات الأساسية لحماية الأنظمة والشبكات.'
  },
  {
    id: 'et1',
    title: 'تدريب منتهي بالتوظيف الفوري',
    company: 'شركة الفنادق العالمية',
    category: 'employment_training',
    status: 'active',
    location: 'جدة - الرياض',
    externalLink: 'https://hotelapply.com',
    description: 'برنامج تدريبي مكثف لمدة 6 أشهر ينتهي بالتوظيف المباشر في كبرى الفنادق العالمية بالمملكة.'
  }
];

export const getStoredJobs = (): Job[] => {
  const jobMap = new Map<string, Job>();
  const STORAGE_KEY = 'forsati_jobs';
  const legacyKeys = ['jobs', 'all_jobs', 'forsati-jobs'];
  
  const saved = localStorage.getItem(STORAGE_KEY);
  
  if (!saved) {
    // 1. Start with MOCK_JOBS
    if (Array.isArray(MOCK_JOBS)) {
      MOCK_JOBS.forEach(j => {
        if (j && j.id) {
          jobMap.set(j.id, {
            ...j,
            createdAt: { toDate: () => (j.createdAt?.toDate ? j.createdAt.toDate() : new Date()) }
          });
        }
      });
    }

    // 2. Merge any existing legacy data
    legacyKeys.forEach(key => {
      const legacyData = localStorage.getItem(key);
      if (legacyData) {
        try {
          const parsed = JSON.parse(legacyData);
          if (Array.isArray(parsed)) {
            parsed.forEach((j: any) => {
              if (j && j.id) {
                let dateVal: any = j.createdAtDate || j.createdAt || j.createdAtManual;
                const d = new Date(dateVal || Date.now());
                jobMap.set(j.id, {
                  ...j,
                  createdAt: { toDate: () => isNaN(d.getTime()) ? new Date() : d }
                });
              }
            });
          }
        } catch (e) { /* ignore */ }
      }
    });

    // 3. Save the merged initial state to storage
    const initialData = Array.from(jobMap.values()).map(j => ({
      ...j,
      createdAtDate: j.createdAt?.toDate ? j.createdAt.toDate().toISOString() : new Date().toISOString()
    }));
    
    // Only save if we actually have data (either mock or legacy)
    if (initialData.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
    }
  } else {
    // If storage exists, ONLY use storage to respect deletions
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        parsed.forEach((j: any) => {
          if (j && j.id) {
            let dateVal: any = j.createdAtDate || j.createdAt || j.createdAtManual;
            if (typeof dateVal === 'object' && dateVal?.seconds) {
              dateVal = dateVal.seconds * 1000;
            }
            
            const dateObj = new Date(dateVal || Date.now());
            const finalDate = isNaN(dateObj.getTime()) ? new Date() : dateObj;
            
            jobMap.set(j.id, {
              ...j,
              createdAt: { toDate: () => finalDate }
            });
          }
        });
      }
    } catch (e) {
      console.error(`Error parsing jobs from ${STORAGE_KEY}`, e);
    }
  }
  
  // Return as sorted array (newest first)
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
