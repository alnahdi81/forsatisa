import { useState, useEffect } from 'react';
import { Job, JobCategory } from '../types';
import { getStoredJobs, subscribeToJobs } from '../lib/dataService';
import JobCard from '../components/JobCard';
import { Search, ChevronRight, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function JobList({ category }: { category?: string }) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const title = category ? `فرصتي - ${categoryLabels[category]}` : "فرصتي - جميع الوظائف";
    document.title = title;
    
    setLoading(true);
    const unsub = subscribeToJobs((allJobs) => {
      if (category) {
        setJobs(allJobs.filter(j => j.category === category));
      } else {
        setJobs(allJobs);
      }
      setLoading(false);
    });

    return () => unsub();
  }, [category]);

  const categoryLabels: Record<string, string> = {
    military: 'وظائف عسكرية',
    remote: 'وظائف عن بعد',
    company: 'وظائف شركات',
    government: 'وظائف حكومية',
    university: 'مواعيد الجامعات',
    training: 'دورات تدريبية',
    employment_training: 'تدريب منتهي بالتوظيف',
  };

  const filteredJobs = jobs.filter(job => 
    (job.title?.toLowerCase() || '').includes(search.toLowerCase()) || 
    (job.company?.toLowerCase() || '').includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <nav className="flex items-center gap-2 text-xs text-gray-400 mb-4">
            <Link to="/" className="hover:text-brand-yellow">الرئيسية</Link>
            <ChevronRight size={12} />
            <span className="text-gray-500">{category ? categoryLabels[category] : 'جميع الوظائف'}</span>
          </nav>
          <h1 className="text-4xl font-bold">{category ? categoryLabels[category] : 'استكشف الوظائف المتاحة'}</h1>
          <p className="text-gray-500 mt-2">إجمالي {jobs.length} وظيفة متاحة في هذا القسم</p>
        </div>

        <div className="w-full md:w-96 relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="بحث سريع..." 
            className="w-full bg-white border border-gray-100 rounded-2xl pr-12 py-3 shadow-sm focus:ring-2 focus:ring-brand-yellow focus:border-transparent transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredJobs.length > 0 ? (
          filteredJobs.map(job => <JobCard key={job.id} job={job} />)
        ) : (
          <div className="col-span-full py-16 text-center bg-white rounded-3xl border-2 border-dashed border-gray-100 shadow-sm">
            <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
              {search ? <Search className="text-amber-500" size={40} /> : <Bell className="text-amber-500 animate-bounce" size={40} />}
            </div>
            
            {!search && <div className="bg-amber-50 text-amber-700 px-6 py-2 rounded-full inline-block text-sm font-black mb-4">تنبيهات العملاء</div>}
            
            <h3 className="text-2xl font-black text-brand-black mb-3">
              {search ? "لا توجد نتائج لهذا البحث" : "لا يوجد وظائف حالياً"}
            </h3>
            <p className="text-gray-500 max-w-sm mx-auto leading-relaxed font-bold">
              {search ? "حاول البحث بكلمات مختلفة أو تصفح الأقسام الأخرى." : "سيتم إضافة وظائف جديدة في هذا القسم قريباً، تابعه باستمرار!"}
            </p>
            {search && (
              <button 
                onClick={() => setSearch('')}
                className="mt-6 text-amber-600 font-bold hover:underline"
              >
                مسح البحث
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
