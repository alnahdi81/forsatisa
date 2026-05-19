import { useState, useEffect } from 'react';
import { Job, Ad } from '../types';
import { getStoredJobs, getStoredAds } from '../lib/dataService';
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
    
    // ... meta updates ...
    
    // Load local jobs and ads
    setJobs(getStoredJobs());
    setAds(getStoredAds());
    setLoading(false);
  }, []);

  const stats = [
    { label: 'وظائف متاحة', value: '1,200+', icon: Briefcase, color: 'text-brand-yellow' },
    { label: 'جهة توظيف', value: '450+', icon: Building, color: 'text-blue-500' },
    { label: 'باحث عن عمل', value: '10,000+', icon: Users, color: 'text-green-500' },
    { label: 'جهات معتمدة', value: '100%', icon: ShieldCheck, color: 'text-purple-500' },
  ];

  const filteredJobs = jobs.filter(job => 
    (job.title?.toLowerCase() || '').includes(search.toLowerCase()) || 
    (job.company?.toLowerCase() || '').includes(search.toLowerCase())
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

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 -mt-16 md:-mt-12 relative z-30">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 md:gap-4">
          {[
            { label: 'وظائف عسكرية', path: 'military', icon: ShieldCheck, color: 'text-brand-yellow' },
            { label: 'وظائف حكومية', path: 'government', icon: Building, color: 'text-blue-500' },
            { label: 'وظائف الشركات', path: 'company', icon: Briefcase, color: 'text-green-500' },
            { label: 'وظائف عن بعد', path: 'remote', icon: Users, color: 'text-purple-500' },
            { label: 'مواعيد الجامعات', path: 'university', icon: Building, color: 'text-orange-500' },
            { label: 'دورات تدريبية', path: 'training', icon: Briefcase, color: 'text-red-500' },
            { label: 'تدريب منتهي بالتوظيف', path: 'employment_training', icon: Users, color: 'text-indigo-500' },
          ].map((cat, i) => (
            <motion.div
              key={cat.path}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + i * 0.05 }}
            >
              <Link 
                to={`/category/${cat.path}`}
                className="flex flex-col items-center justify-center p-5 md:p-6 bg-white rounded-[2rem] border border-gray-100 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 group relative overflow-hidden h-full min-h-[140px]"
              >
                <div className="absolute top-0 right-0 w-12 h-12 bg-gray-50 rounded-full -mr-6 -mt-6"></div>
                <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                   <cat.icon size={24} className={cat.color} />
                </div>
                <span className="font-black text-[11px] md:text-xs text-brand-black text-center leading-tight">{cat.label}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Hero Ads */}
      {ads.filter(a => a.position === 'home_hero').length > 0 && (
        <section className="max-w-7xl mx-auto px-4 mt-8">
          <div className="space-y-4">
            {ads.filter(a => a.position === 'home_hero').map(ad => (
              <motion.a 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                key={ad.id} 
                href={ad.link} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="block w-full overflow-hidden rounded-[2rem] shadow-xl border border-gray-100 hover:shadow-2xl transition-all"
              >
                <img src={ad.image} alt={ad.title} className="w-full h-auto" referrerPolicy="no-referrer" />
              </motion.a>
            ))}
          </div>
        </section>
      )}

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-4 mt-8 relative z-20">
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
    </div>
  );
}
