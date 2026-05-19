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
  return [
    {
      id: 'ad1',
      title: 'بوابة القبول الموحد',
      image: 'https://images.unsplash.com/photo-1454165833767-0275ef84c6ee?w=1200&auto=format&fit=crop&q=60',
      link: 'https://jobs.sa',
      position: 'home_hero'
    },
    {
      id: 'ad2',
      title: 'سوق العمل السعودي',
      image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1200&auto=format&fit=crop&q=60',
      link: 'https://hrsd.gov.sa',
      position: 'sidebar'
    }
  ];
};

export const saveStoredAds = (ads: Ad[]) => {
  localStorage.setItem('forsati_ads', JSON.stringify(ads));
};
