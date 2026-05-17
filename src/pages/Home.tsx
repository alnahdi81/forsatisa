import { useState, useEffect } from 'react';
import { db, Job, Ad } from '../lib/firebase';
import { collection, query, orderBy, limit, onSnapshot, where } from 'firebase/firestore';
import JobCard from '../components/JobCard';
import { Search, Briefcase, Users, Building, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

export default function Home() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const defaultTitle = "فرصتي .. نحو النجاح";
    document.title = defaultTitle;
    
    // Reset Meta Tags
    const updateMeta = (selector: string, content: string) => {
      const el = document.querySelector(selector);
      if (el) el.setAttribute('content', content);
    };
    updateMeta('meta[property="og:title"]', defaultTitle);
    updateMeta('meta[property="twitter:title"]', defaultTitle);
    updateMeta('meta[property="og:description"]', "فرصتي .. نحو النجاح، بوابتك للبحث عن أحدث الوظائف الشاغرة في المملكة العربية السعودية.");
    updateMeta('meta[property="twitter:description"]', "فرصتي .. نحو النجاح، بوابتك للبحث عن أحدث الوظائف الشاغرة في المملكة العربية السعودية.");
    
    // Jobs listener
    const jq = query(collection(db, 'jobs'), orderBy('createdAt', 'desc'), limit(12));
    const unsubscribeJobs = onSnapshot(jq, (snapshot) => {
      setJobs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Job)));
    });

    // Ads listener
    const aq = query(collection(db, 'ads'), orderBy('createdAt', 'desc'));
    const unsubscribeAds = onSnapshot(aq, (snapshot) => {
      setAds(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ad)));
      setLoading(false);
    });

    return () => {
      unsubscribeJobs();
      unsubscribeAds();
    };
  }, []);

  const stats = [
    { label: 'وظائف متاحة', value: '1,200+', icon: Briefcase, color: 'text-brand-yellow' },
    { label: 'جهة توظيف', value: '450+', icon: Building, color: 'text-blue-500' },
    { label: 'باحث عن عمل', value: '10,000+', icon: Users, color: 'text-green-500' },
    { label: 'جهات معتمدة', value: '100%', icon: ShieldCheck, color: 'text-purple-500' },
  ];

  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(search.toLowerCase()) || 
    job.company?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-brand-black text-white py-20 lg:py-32">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 -left-20 w-80 h-80 bg-brand-yellow rounded-full blur-[120px]" />
          <div className="absolute bottom-0 -right-20 w-80 h-80 bg-brand-yellow rounded-full blur-[120px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 relative z-10 text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-xs font-bold text-brand-yellow tracking-widest uppercase shadow-xl"
          >
            فرصتي .. نحو النجاح 🌟
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-7xl font-bold tracking-tight leading-[1.1]"
          >
            فرصتي <span className="text-brand-yellow">نحو النجاح</span>
          </motion.h1>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto relative group"
          >
            <div className="absolute -inset-1 bg-brand-yellow/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500" />
            <div className="relative flex items-center bg-white rounded-2xl p-1.5 md:p-2 shadow-2xl">
              <Search className="text-gray-400 mx-3" size={20} />
              <input 
                type="text" 
                placeholder="ابحث عن مسمى وظيفي، شركة..." 
                className="w-full bg-transparent border-none text-brand-black focus:ring-0 py-2 md:py-3 text-sm md:text-lg"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button className="bg-brand-yellow text-brand-black font-extrabold px-6 md:px-8 py-2 md:py-3 rounded-xl hover:bg-white transition-all shadow-lg active:scale-95 text-xs md:text-base">
                بحث
              </button>
            </div>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-400">
            <span>شائع:</span>
            {['وظائف عسكرية', 'عمل عن بعد', 'نيوم', 'رؤية 2030'].map(tag => (
              <button key={tag} className="hover:text-brand-yellow transition-all">#{tag}</button>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-4 -mt-16 relative z-20">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <motion.div 
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xl flex flex-col items-center text-center space-y-2"
            >
              <stat.icon className={`${stat.color} mb-2`} size={32} />
              <span className="text-2xl font-bold text-brand-black">{stat.value}</span>
              <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">{stat.label}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Middle Ad */}
      {ads.find(a => a.position === 'sidebar') && (
        <section className="max-w-7xl mx-auto px-4">
           <a href={ads.find(a => a.position === 'sidebar')?.link} target="_blank" rel="noopener noreferrer" className="block w-full overflow-hidden rounded-3xl shadow-lg border border-gray-100 h-32 md:h-24">
             <img src={ads.find(a => a.position === 'sidebar')?.image} alt="Ad" className="w-full h-full object-cover" />
           </a>
        </section>
      )}

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl font-bold mb-2">أحدث الوظائف المضافة</h2>
            <p className="text-gray-500">استكشف أحدث الفرص الوظيفية في مختلف القطاعات</p>
          </div>
          <Link to="/jobs" className="flex items-center gap-2 text-brand-yellow font-bold hover:gap-3 transition-all">
            مشاهدة الكل
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-64 bg-gray-100 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredJobs.length > 0 ? (
              filteredJobs.map(job => <JobCard key={job.id} job={job} />)
            ) : (
              <div className="col-span-full py-20 text-center space-y-4">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                  <Search size={40} className="text-gray-200" />
                </div>
                <h3 className="text-xl font-bold">لا توجد وظائف تطابق بحثك</h3>
                <p className="text-gray-500">حاول البحث بكلمات مختلفة أو تصفح الأقسام الأخرى.</p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Ad Section */}
      <section className="max-w-7xl mx-auto px-4 pb-20">
        {ads.find(a => a.position === 'home_hero') ? (
           <a href={ads.find(a => a.position === 'home_hero')?.link} target="_blank" rel="noopener noreferrer" className="block w-full overflow-hidden rounded-3xl shadow-lg border border-gray-100">
             <img src={ads.find(a => a.position === 'home_hero')?.image} alt="Ad" className="w-full h-auto" />
           </a>
        ) : (
          <div className="w-full aspect-[4/1] md:aspect-[10/1] bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl flex items-center justify-center text-gray-400 group hover:border-brand-yellow/30 hover:bg-brand-yellow/5 transition-all">
            <p className="text-sm font-medium">مساحة إعلانية - AdSpace</p>
          </div>
        )}
      </section>
    </div>
  );
}
