import { useState, useEffect } from 'react';
import { db, Job, JobCategory } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import JobCard from '../components/JobCard';
import { Search, Filter, Briefcase, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

export default function JobList({ category }: { category?: string }) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const title = category ? `فرصتي - ${categoryLabels[category]}` : "فرصتي - جميع الوظائف";
    document.title = title;
    
    let q = query(collection(db, 'jobs'), orderBy('createdAt', 'desc'));
    if (category) {
      q = query(collection(db, 'jobs'), where('category', '==', category), orderBy('createdAt', 'desc'));
    }
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const jobsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Job));
      setJobs(jobsData);
      setLoading(false);
    });
    return () => unsubscribe();
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
    job.title.toLowerCase().includes(search.toLowerCase()) || 
    job.company?.toLowerCase().includes(search.toLowerCase())
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

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-64 bg-gray-100 animate-pulse rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredJobs.map(job => <JobCard key={job.id} job={job} />)}
          {filteredJobs.length === 0 && (
            <div className="col-span-full py-20 text-center text-gray-400">لا يوجد نتائج لهذا البحث</div>
          )}
        </div>
      )}
    </div>
  );
}
