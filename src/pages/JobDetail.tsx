import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db, Job, Ad, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, getDoc, collection, query, where, limit, getDocs } from 'firebase/firestore';
import { MapPin, Building2, Calendar, Share2, ArrowRight, ExternalLink, ShieldCheck, Briefcase } from 'lucide-react';
import { motion } from 'motion/react';

export default function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [ad, setAd] = useState<Ad | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!id) return;
      try {
        const docRef = doc(db, 'jobs', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as Job;
          setJob({ id: docSnap.id, ...data } as Job);
          const fullTitle = `فرصتي - ${data.title}`;
          document.title = fullTitle;

          // Update Meta Tags for Social Sharing
          const updateMeta = (selector: string, content: string) => {
            const el = document.querySelector(selector);
            if (el) el.setAttribute('content', content);
          };
          updateMeta('meta[property="og:title"]', fullTitle);
          updateMeta('meta[property="twitter:title"]', fullTitle);
          updateMeta('meta[property="og:description"]', `شاهد أحدث تفاصيل وظيفة ${data.title} في ${data.company} عبر منصة فرصتي.`);
          updateMeta('meta[property="twitter:description"]', `شاهد أحدث تفاصيل وظيفة ${data.title} في ${data.company} عبر منصة فرصتي.`);
          if (data.image) {
            updateMeta('meta[property="og:image"]', data.image);
            updateMeta('meta[property="twitter:image"]', data.image);
          }
        }

        // Fetch Job Detail Ad
        const aq = query(collection(db, 'ads'), where('position', '==', 'job_detail'), limit(1));
        const adSnap = await getDocs(aq);
        if (!adSnap.empty) {
          setAd({ id: adSnap.docs[0].id, ...adSnap.docs[0].data() } as Ad);
        }
      } catch (e) {
        handleFirestoreError(e, OperationType.GET, `jobs/${id}`);
      }
      setLoading(false);
    }
    fetchData();
  }, [id]);

  const categoryLabels: Record<string, string> = {
    military: 'وظائف عسكرية',
    remote: 'عمل عن بعد',
    company: 'وظائف شركات',
    government: 'وظائف حكومية',
    university: 'مواعيد جامعات',
    training: 'دورات تدريبية',
    employment_training: 'تدريب منتهي بالتوظيف',
  };

  const handleShare = async () => {
    if (!job) return;
    const shareData = {
      title: `فرصتي - ${job.title}`,
      text: `اكتشف وظيفة ${job.title} في ${job.company} عبر منصة فرصتي`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('تم نسخ الرابط بنجاح!');
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
                    {job.status === 'active' ? 'نشط الآن' : 
                     job.status === 'soon' ? 'قريباً' : 
                     job.status === 'expiring' ? 'قارب على الانتهاء' : 
                     'منتهي'}
                  </span>
                </div>
                <h1 className="text-3xl font-bold text-brand-black">{job.title}</h1>
                <div className="flex flex-wrap gap-4 text-gray-500 text-sm">
                   <div className="flex items-center gap-1.5"><Building2 size={16} /> {job.company}</div>
                   <div className="flex items-center gap-1.5"><MapPin size={16} /> {job.location}</div>
                   <div className="flex items-center gap-1.5"><Calendar size={16} /> {job.createdAt?.toDate().toLocaleDateString('ar-SA')}</div>
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

          {ad ? (
            <a href={ad.link} target="_blank" rel="noopener noreferrer" className="block w-full overflow-hidden rounded-3xl shadow-lg border border-gray-100">
              <img src={ad.image} alt={ad.title} className="w-full h-auto object-cover" referrerPolicy="no-referrer" />
            </a>
          ) : (
            <div className="w-full aspect-[3/4] bg-gray-100 rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 p-6 text-center space-y-4">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                <Briefcase size={24} className="text-gray-300" />
              </div>
              <p className="text-sm font-medium">مساحة إعلانية<br/>Ads Here</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
