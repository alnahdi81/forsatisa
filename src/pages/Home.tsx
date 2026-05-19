import { useState, useEffect } from 'react';
import { Job, Ad } from '../types';
import { getStoredJobs, getStoredAds, subscribeToJobs, subscribeToAds } from '../lib/dataService';
import JobCard from '../components/JobCard';
import { Search, Briefcase, Users, Building, ShieldCheck, Bell } from 'lucide-react';
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
    
    setLoading(true);
    const unsubJobs = subscribeToJobs((data) => {
      setJobs(data);
      setLoading(false);
    }, (err) => {
      console.error('Job subscription error:', err);
      setLoading(false); // Stop loading even on error
    });
    
    const unsubAds = subscribeToAds((data) => {
      setAds(data);
    }, (err) => {
      console.error('Ads subscription error:', err);
    });

    return () => {
      unsubJobs();
      unsubAds();
    };
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredJobs.length > 0 ? (
            filteredJobs.map(job => <JobCard key={job.id} job={job} />)
          ) : (
            <div className="col-span-full py-16 text-center bg-white rounded-3xl border-2 border-dashed border-gray-100 shadow-sm">
              <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Bell className="text-amber-500 animate-bounce" size={40} />
              </div>
              <div className="bg-amber-50 text-amber-700 px-6 py-2 rounded-full inline-block text-sm font-black mb-4">تنبيهات العملاء</div>
              <h3 className="text-2xl font-black text-brand-black mb-3">لا يوجد وظائف مضافة حالياً</h3>
              <p className="text-gray-500 max-w-sm mx-auto leading-relaxed font-bold">
                سيتم تحديث القائمة بأحدث الوظائف والفرص المتاحة في المملكة قريباً.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
