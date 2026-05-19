import { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams, useLocation } from 'react-router-dom';
import { Job, Ad } from '../types';
import { getJobById, getStoredAds } from '../lib/dataService';
import { MapPin, Building2, Calendar, Share2, ArrowRight, ExternalLink, ShieldCheck, Briefcase, Info } from 'lucide-react';
import { motion } from 'motion/react';

export default function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  // Try to get job from navigation state for instant loading
  const stateJob = location.state?.job as Job | undefined;
  
  const [job, setJob] = useState<Job | null>(stateJob || null);
  const [ad, setAd] = useState<Ad | null>(null);
  const [loading, setLoading] = useState(!stateJob);
  const [isSharedData, setIsSharedData] = useState(false);

  useEffect(() => {
    if (!id) return;
    
    const loadData = async () => {
      // If we don't have the job from state, or id changed, fetch it
      if (!job || job.id !== id) {
        setLoading(true);
        
        // 1. Try to find by ID (faster, uses cache)
        let foundJob = await getJobById(id);
        
        // 2. Fallback: Check if job data is encoded in URL (Share Link feature)
        if (!foundJob) {
          const encodedData = searchParams.get('data');
          if (encodedData) {
            try {
              const decoded = JSON.parse(decodeURIComponent(atob(encodedData)));
              if (decoded && decoded.id === id) {
                foundJob = {
                  ...decoded,
                  createdAt: { toDate: () => new Date(decoded.createdAtDate || Date.now()) }
                };
                setIsSharedData(true);
              }
            } catch (e) {
              console.error("Failed to parse shared job data", e);
            }
          }
        }

        if (foundJob) {
          setJob(foundJob);
        }
        setLoading(false);
      }

      // Update meta if job exists
      if (job) {
        const fullTitle = `فرصتي - ${job.title}`;
        document.title = fullTitle;
        
        const updateMeta = (selector: string, content: string) => {
          const el = document.querySelector(selector);
          if (el) el.setAttribute('content', content);
        };
        updateMeta('meta[property="og:title"]', fullTitle);
        updateMeta('meta[property="twitter:title"]', fullTitle);
        updateMeta('meta[property="og:description"]', `شاهد أحدث تفاصيل وظيفة ${job.title} في ${job.company} عبر منصة فرصتي.`);
        updateMeta('meta[property="twitter:description"]', `شاهد أحدث تفاصيل وظيفة ${job.title} في ${job.company} عبر منصة فرصتي.`);
      }

      // Load ads independently (don't block the job view)
      getStoredAds().then(allAds => {
        const jobAd = allAds.find(a => a.position === 'job_detail') || allAds.find(a => a.position === 'sidebar');
        if (jobAd) setAd(jobAd);
      });
    };

    loadData();
  }, [id, searchParams, job]);

  const categoryLabels: Record<string, string> = {
    military: 'عسكري',
    remote: 'عمل عن بعد',
    company: 'شركات / خاص',
    government: 'حكومي',
    semi_government: 'شبه حكومي',
    university: 'جامعات / تعليم',
    training: 'دورات تدريبية',
    employment_training: 'تدريب منتهي بالتوظيف',
  };

  const handleShare = async () => {
    if (!job) return;
    
    // Generate a shareable URL that includes the job data encoded
    // This allows sharing links to locally added jobs
    const jobDataToEncode = {
      ...job,
      createdAtDate: job.createdAt?.toDate ? job.createdAt.toDate().toISOString() : new Date().toISOString(),
      createdAt: undefined // Can't serialize functions
    };
    const encoded = btoa(encodeURIComponent(JSON.stringify(jobDataToEncode)));
    const shareUrl = `${window.location.origin}/job/${job.id}?data=${encoded}`;

    const shareData = {
      title: `فرصتي - ${job.title}`,
      text: `اكتشف وظيفة ${job.title} في ${job.company} عبر منصة فرصتي`,
      url: shareUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareUrl);
        alert('تم نسخ الرابط المشارك بنجاح! الرابط يحتوي على معلومات الوظيفة لكي تظهر للآخرين.');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  if (loading) return <div className="p-20 text-center animate-pulse text-gray-400">جاري تحميل تفاصيل الوظيفة...</div>;
  if (!job) return (
    <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-6">
      <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-200">
        <Briefcase size={48} />
      </div>
      <h1 className="text-3xl font-bold">الوظيفة غير موجودة</h1>
      <p className="text-gray-500">تم حذف هذه الوظيفة أو أنها غير متوفرة حالياً.</p>
      <Link to="/jobs" className="inline-block bg-brand-yellow text-brand-black px-8 py-3 rounded-xl font-bold">العودة للوظائف</Link>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <Link to="/jobs" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-brand-yellow transition-colors mb-8 group">
        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        العودة لقائمة الوظائف
      </Link>

      {isSharedData && (
        <div className="mb-8 bg-blue-50 border border-blue-100 p-6 rounded-3xl flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
            <Info size={20} />
          </div>
          <p className="text-sm text-blue-800 font-bold">هذه الوظيفة تمت مشاركتها معك عبر رابط مباشر. يمكنك أيضاً تصفح جميع الوظائف الحالية في المنصة.</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="w-24 h-24 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100 overflow-hidden flex-shrink-0">
                {job.image ? <img src={job.image} alt={job.company} className="w-full h-full object-cover" /> : <Building2 size={40} className="text-gray-300" />}
              </div>
              <div className="flex-1 space-y-3">
                <div className="flex flex-wrap gap-2">
                  <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-brand-yellow/10 text-brand-yellow uppercase tracking-widest">
                    {categoryLabels[job.category] || job.category}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-widest flex items-center gap-1 ${
                    job.status === 'active' ? 'bg-green-50 text-green-600' :
                    job.status === 'soon' ? 'bg-blue-50 text-blue-600' :
                    job.status === 'expiring' ? 'bg-orange-50 text-orange-600' :
                    'bg-red-50 text-red-600'
                  }`}>
                    <ShieldCheck size={10} />
                    {job.status === 'active' ? 'نشط' : 
                     job.status === 'soon' ? 'قريباً' : 
                     job.status === 'expiring' ? 'ينتهي قريباً' : 
                     'منتهي'}
                  </span>
                </div>
                <h1 className="text-3xl font-bold text-brand-black">{job.title}</h1>
                <div className="flex flex-wrap gap-4 text-gray-500 text-sm">
                   <div className="flex items-center gap-1.5"><Building2 size={16} /> {job.company}</div>
                   <div className="flex items-center gap-1.5"><MapPin size={16} /> {job.location}</div>
                   <div className="flex items-center gap-1.5">
                     <Calendar size={16} /> 
                     {job.createdAt?.toDate ? (
                       <>
                         <span>{job.createdAt.toDate().toLocaleDateString('ar-SA', { year: 'numeric', month: 'numeric', day: 'numeric' })}</span>
                         <span className="mr-0.5">هـ</span>
                       </>
                     ) : 'N/A'}
                   </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <h2 className="text-xl font-bold border-r-4 border-brand-yellow pr-4">وصف الوظيفة والمتطلبات</h2>
            <div className="text-gray-600 leading-[1.8] whitespace-pre-wrap">
              {job.description}
            </div>
            
            <div className="pt-6 border-t border-gray-50 flex flex-col sm:flex-row gap-4">
              {job.externalLink && (
                <a 
                  href={job.externalLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex-1 bg-brand-yellow text-brand-black py-4 rounded-2xl font-bold text-center flex items-center justify-center gap-2 hover:shadow-xl transition-all active:scale-95"
                >
                  التقديم الآن
                  <ExternalLink size={20} />
                </a>
              )}
              <button 
                onClick={handleShare}
                className="px-6 py-4 rounded-2xl bg-gray-50 text-gray-500 hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
              >
                <Share2 size={20} />
                مشاركة
              </button>
            </div>
          </motion.div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-8">
          <div className="bg-brand-black text-white p-8 rounded-3xl space-y-6">
            <h3 className="font-bold text-lg">تعليمات التقديم</h3>
            <ul className="space-y-4 text-sm text-gray-300">
              <li className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-brand-yellow/20 text-brand-yellow flex items-center justify-center flex-shrink-0 text-xs font-bold">1</div>
                <span>تأكد من مطابقة شروط الوظيفة لمؤهلاتك العلمية والعملية.</span>
              </li>
              <li className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-brand-yellow/20 text-brand-yellow flex items-center justify-center flex-shrink-0 text-xs font-bold">2</div>
                <span>قم بتجهيز السيرة الذاتية بصيغة PDF.</span>
              </li>
              <li className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-brand-yellow/20 text-brand-yellow flex items-center justify-center flex-shrink-0 text-xs font-bold">3</div>
                <span>اضغط على زر "التقديم الآن" للانتقال لموقع الجهة المعلنة.</span>
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
