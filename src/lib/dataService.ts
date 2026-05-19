import { Job, Ad } from '../types';
import { 
  collection, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  doc, 
  getDoc,
  query, 
  orderBy, 
  setDoc,
  onSnapshot
} from 'firebase/firestore';
import { db } from './firebase';

// Simple in-memory cache
let jobsCache: Job[] = [];
let adsCache: Ad[] = [];

const MOCK_JOBS: Job[] = [
  {
    "title": "البنك الأهلي السعودي يعلن وظائف شاغرة بمجال إدارة علاقات العملاء",
    "company": "البنك الأهلي السعودي",
    "category": "company",
    "location": "الرياض ، الخبر ، جدة",
    "externalLink": "https://www.linkedin.com/jobs/view/4243640263/?eBP=JOB_SEARCH_ORGANIC&refId=k%2FPh6yV%2Fv7y8yM4DORC4yg%3D%3D&trackingId=9T%2Byi6MvA9Xf6Ld9S6xJvA%3D%3D",
    "image": "https://upload.wikimedia.org/wikipedia/ar/archive/a/a2/20210403164132%21SNB_Logo.png",
    "description": "يعلن البنك الأهلي السعودي عن توفر وظائف شاغرة في مجال إدارة علاقات العملاء (للشركات) لحملة البكالوريوس، للعمل في المدن التالية (الرياض، الخبر، جدة)، وذلك وفقاً للتفاصيل التالية.\n\n \n\nمسمى الوظيفة:\n\n- مدير علاقات العملاء (الشركات).\n\n \n\nالهدف من الوظيفة:\n\nتقديم خدمة عملاء ممتازة لعملاء الشركات وتحقيق أهداف محددة فيما يتعلق بجودة الائتمان، وإدارة الصفقات الجديدة، وتنمية محفظة الائتمان والتسويق المتبادل من خلال إقناع العملاء بالاستثمار يشمل قسم إدارة علاقات العملاء للشركات ما يلي: (الشركات التجارية, الخدمات المصرفية للشركات (الشركات المتوسطة), الشركات الكبيرة, الشركات العالمية).\n\n \n\nالمهام الوظيفية:\n\n\n- تمثيل البنك كجهة اتصال رئيسية لعملاء الشركات لمعالجة مخاوفهم واستفساراتهم.\n- الحفاظ على علاقات موثوقة مع العملاء على المستويات المناسبة من خلال تقديم خدمات موثوقة واستباقية وتطبيق المعرفة المصافية بمهارة.\n- إدارة قاعدة عملاء حالية والبحث عن فرص سبل جديدة مع العملاء المؤسسيين بهدف تنمية قاعدة الأصول وفقًا لخطة العمل.\n- المساهمة في تحديد فرص التحسين المستمر لعمليات إدارة العملاء بهدف تحقيق تحسين الإنتاجية وخفض التكاليف.\n- إعداد بيانات بتقارير دقيقة وفي الوقت المناسب لتلبية المتطلبات التشغيلية والتجارية والسياسات والمعايير.\n- القيام بأي مهام أو واجبات أخرى ذات صلة حسب التوجيهات.\n\n\nالشروط:\n\n \n\n- أن يكون المتقدم سعودي الجنسية.\n- حاصل على درجة البكالوريوس في المالية أو المحاسبة أو إدارة الأعمال أو أي مجال ذي صلة.\n- خبره ذات صلة في مجال العمل المصرفي تتراوح بين سنتين وخمس سنوات.\n- مهارات تحليلية متخصصة في الائتمان المالية السوق.\n- فهم جيد لمخاطر الائتمان وإجراء التحليلات المالية.\n- يجيد قراءة الميزانية العمومية.\n- مهارات تفاوض متقدمة.\n- مهارات تواصل متقدمة.\n\n\nنبذة عن البنك:\n\n \n\nالبنك الأهلي السعودي هو أحد أكبر البنوك في المملكة العربية السعودية، تأسس عام 1953، ويقدم خدمات مصرفية وتمويلية للأفراد والشركات والاستثمار. تشكل البنك بشكله الحالي بعد اندماج البنك الأهلي التجاري مع مجموعة ساميا المالية عام 2021.\n\n \n\nالخبر مضاف بتاريخ اليوم الأثنين 1447/12/1هـ (الموافق 2026/5/18م)",
    "status": "active",
    "createdAtManual": "2026-05-19",
    "id": "52o7vmjvm",
    "createdAtDate": "2026-05-19T00:00:00.000Z"
  },
  {
    "title": "شركة لين للأعمال تعلن برنامج بجدارة المنتهي بالتوظيف بمكافأة شهرية",
    "company": "شركات",
    "category": "government",
    "location": "المملكة العربية السعودية",
    "externalLink": "https://lean.sa/ar/bijdara.html",
    "image": "https://imgx.wdeftksa.com/sa/images/9454.jpg",
    "description": "وصف الوظيفة\n\nشركة لين لخدمات الأعمال تعلن عن انطلاق برنامج بجدارة المنتهي بالتوظيف بمكافأة مالية شهرية ومزايا أخرى، وذلك وفقاً للتفاصيل والشروط الآتية.\n\n\nمسمى البرنامج:-\n\nبرنامج بجدارة.\nعن البرنامج:-\n\nيقدم برنامج بجدارة تجربة تدريبية متميزة لحديثي التخرج من حملة البكالوريوس والماجستير الذين يتمتعون بالكفاءة والطموح.\nنمكّنهم من اكتساب المهارات العملية التي يتطلبها سوق العمل من خلال تدريب ميداني شامل لمدة عام، عبر مسارات مهنية متنوعة وبرامج تدريبية متخصصة ومرشدين داعمين.\nالمسارات:-\n\nتحليل البيانات.\nإدارة المشاريع.\nإدارة المنتجات.\nالذكاء الاصطناعي.\nتحليل الأعمال.\nالأمن السيبراني.\nالتجربة الرقمية (UI/UX).\nمميزات البرنامج:-\n\nمكافأة مالية شهرية.\nتدريب على رأس العمل في بيئة احترافية.\nتأمين طبي للمتدرب.\nفرص للعمل على مشاريع واقعية قائمة وتحت التطوير.\nشروط البرنامج:-\n\nحديث / ـة تخرّج من البكالوريوس أو الماجستير.\nمعدل لا يقل عن (4/5) أو (3/4).\nسعودي / ـة الجنسية.\nشغف بالتعلّم، واستعداد لمواجهة التحديات.\nالتفرّغ التام للدوام الكامل.",
    "status": "active",
    "createdAtManual": "2026-05-19",
    "id": "43l1iyaec",
    "createdAtDate": "2026-05-19T00:00:00.000Z"
  }
];

// Helper to seed the database if it's the first time
export const seedDatabaseIfEmpty = async () => {
  const jobsRef = collection(db, 'jobs');
  const snapshot = await getDocs(jobsRef);
  
  if (snapshot.empty) {
    console.log('Seeding database with mock jobs...');
    for (const job of MOCK_JOBS) {
      await setDoc(doc(db, 'jobs', job.id), {
        ...job,
        createdAtDate: job.createdAtDate || new Date().toISOString()
      });
    }
    console.log('Database seeded.');
  }
};

export const subscribeToJobs = (callback: (jobs: Job[]) => void, onError?: (error: any) => void) => {
  const jobsRef = collection(db, 'jobs');
  const q = query(jobsRef, orderBy('createdAtDate', 'desc'));
  
  return onSnapshot(q, (snapshot) => {
    const jobs = snapshot.docs.map(doc => {
      const data = doc.data();
      const d = data.createdAtDate ? new Date(data.createdAtDate) : new Date();
      return {
        ...data,
        id: doc.id,
        createdAt: { toDate: () => isNaN(d.getTime()) ? new Date() : d }
      } as Job;
    });
    jobsCache = jobs; // Update cache
    callback(jobs);
  }, (error) => {
    console.error('Error subscribing to jobs:', error);
    if (onError) onError(error);
  });
};

export const subscribeToAds = (callback: (ads: Ad[]) => void, onError?: (error: any) => void) => {
  const adsRef = collection(db, 'ads');
  return onSnapshot(adsRef, (snapshot) => {
    const ads = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }) as Ad);
    adsCache = ads; // Update cache
    callback(ads);
  }, (error) => {
    console.error('Error subscribing to ads:', error);
    if (onError) onError(error);
  });
};

export const getStoredJobs = async (): Promise<Job[]> => {
  // Return cache if available
  if (jobsCache.length > 0) return jobsCache;

  try {
    const jobsRef = collection(db, 'jobs');
    const q = query(jobsRef, orderBy('createdAtDate', 'desc'));
    const snapshot = await getDocs(q);
    
    const jobs = snapshot.docs.map(doc => {
      const data = doc.data();
      const d = data.createdAtDate ? new Date(data.createdAtDate) : new Date();
      return {
        ...data,
        id: doc.id,
        createdAt: { toDate: () => isNaN(d.getTime()) ? new Date() : d }
      } as Job;
    });
    jobsCache = jobs;
    return jobs;
  } catch (error) {
    console.error('Error fetching jobs from Firestore:', error);
    return [];
  }
};

export const getJobById = async (id: string): Promise<Job | null> => {
  // 1. Check cache first
  const cached = jobsCache.find(j => j.id === id);
  if (cached) return cached;

  // 2. Fetch single document
  try {
    const jobRef = doc(db, 'jobs', id);
    const snapshot = await getDoc(jobRef);
    
    if (snapshot.exists()) {
      const data = snapshot.data();
      const d = data.createdAtDate ? new Date(data.createdAtDate) : new Date();
      return {
        ...data,
        id: snapshot.id,
        createdAt: { toDate: () => isNaN(d.getTime()) ? new Date() : d }
      } as Job;
    }
  } catch (error) {
    console.error('Error fetching single job:', error);
  }
  return null;
};

export const addJob = async (job: Omit<Job, 'id' | 'createdAt'>): Promise<string> => {
  console.log('Firebase: addJob called with data:', job);
  
  // Longer timeout for Firestore operation (30s) to avoid premature failures
  const timeoutPromise = new Promise((_, reject) => 
    setTimeout(() => reject(new Error('انتهت مهلة الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت.')), 30000)
  );

  try {
    const jobsRef = collection(db, 'jobs');
    const saveData = {
      ...job,
      createdAtDate: job.createdAtDate || new Date().toISOString()
    };
    console.log('Firebase: Attempting addDoc...');
    
    const docRef = (await Promise.race([
      addDoc(jobsRef, saveData),
      timeoutPromise
    ])) as any;
    
    console.log('Firebase: addDoc successful, ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Firebase: Error adding job to Firestore:', error);
    throw error;
  }
};

export const updateJob = async (id: string, job: Partial<Job>) => {
  console.log('Firebase: updateJob called for ID:', id, 'with data:', job);
  
  // Longer timeout for Firestore operation (30s)
  const timeoutPromise = new Promise((_, reject) => 
    setTimeout(() => reject(new Error('انتهت مهلة الاتصال بالخادم.')), 30000)
  );

  try {
    const jobRef = doc(db, 'jobs', id);
    console.log('Firebase: Attempting setDoc (merge)...');
    
    await Promise.race([
      setDoc(jobRef, job, { merge: true }),
      timeoutPromise
    ]);
    
    console.log('Firebase: setDoc successful');
  } catch (error) {
    console.error('Firebase: Error updating job in Firestore:', error);
    throw error;
  }
};

export const deleteJob = async (id: string) => {
  try {
    const jobRef = doc(db, 'jobs', id);
    await deleteDoc(jobRef);
  } catch (error) {
    console.error('Error deleting job from Firestore:', error);
    throw error;
  }
};

export const getStoredAds = async (): Promise<Ad[]> => {
  if (adsCache.length > 0) return adsCache;
  
  try {
    const adsRef = collection(db, 'ads');
    const snapshot = await getDocs(adsRef);
    const ads = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }) as Ad);
    adsCache = ads;
    return ads;
  } catch (error) {
    console.error('Error fetching ads from Firestore:', error);
    return [];
  }
};

export const saveAd = async (ad: Omit<Ad, 'id'>, id?: string) => {
  const timeoutPromise = new Promise((_, reject) => 
    setTimeout(() => reject(new Error('انتهت مهلة الاتصال.')), 30000)
  );
  try {
    const adsRef = collection(db, 'ads');
    if (id) {
      const adRef = doc(db, 'ads', id);
      await Promise.race([setDoc(adRef, ad, { merge: true }), timeoutPromise]);
    } else {
      await Promise.race([addDoc(adsRef, ad), timeoutPromise]);
    }
  } catch (error) {
    console.error('Error saving ad to Firestore:', error);
    throw error;
  }
};

export const deleteAd = async (id: string) => {
  try {
    const adRef = doc(db, 'ads', id);
    await deleteDoc(adRef);
  } catch (error) {
    console.error('Error deleting ad from Firestore:', error);
    throw error;
  }
};
