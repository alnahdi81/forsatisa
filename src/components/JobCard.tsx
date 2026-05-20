import { Job } from '../types';
import { MapPin, Building2, Calendar, ArrowUpRight, Share2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { MouseEvent } from 'react';

interface JobCardProps {
  job: Job;
  key?: string | number;
}

export default function JobCard({ job }: JobCardProps) {
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

  const categoryColors: Record<string, string> = {
    military: 'bg-red-50 text-red-600',
    government: 'bg-blue-50 text-blue-600',
    remote: 'bg-green-50 text-green-600',
    company: 'bg-orange-50 text-orange-600',
    university: 'bg-purple-50 text-purple-600',
    training: 'bg-cyan-50 text-cyan-600',
    employment_training: 'bg-pink-50 text-pink-600',
  };

  const handleShare = async (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const url = `${window.location.origin}/job/${job.id}`;
    const shareData = {
      title: `فرصتي - ${job.title}`,
      text: `اكتشف وظيفة ${job.title} في ${job.company} عبر منصة فرصتي`,
      url: url,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(url);
        alert('تم نسخ الرابط بنجاح!');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  return (
    <motion.div 
      whileHover={{ scale: 1.01 }}
      className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all group relative h-full flex flex-col"
    >
      <Link to={`/job/${job.id}`} state={{ job: { ...job, createdAt: undefined } }} className="absolute inset-0 z-10" aria-label={job.title} />
      
      {/* Top Header */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex flex-col gap-2 items-start">
          <div className="flex items-center gap-1 relative z-20">
            <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase ${categoryColors[job.category]}`}>
              {categoryLabels[job.category]}
            </span>
            <button 
              onClick={handleShare}
              className="p-1.5 text-gray-300 hover:text-brand-yellow transition-all"
              title="مشاركة"
            >
              <Share2 size={16} />
            </button>
          </div>
          <span className={`text-[10px] font-black px-2 py-0.5 rounded-md relative z-20 ${
            job.status === 'active' ? 'bg-green-50 text-green-600' : 
            job.status === 'soon' ? 'bg-blue-50 text-blue-600' : 
            job.status === 'expiring' ? 'bg-orange-50 text-orange-600' : 
            'bg-red-50 text-red-600'
          }`}>
            {job.status === 'active' ? 'نشط' : job.status === 'soon' ? 'قريباً' : job.status === 'expiring' ? 'ينتهي قريباً' : 'منتهي'}
          </span>
        </div>

        <div className="w-16 h-16 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 overflow-hidden shrink-0">
          {job.image ? (
            <img src={job.image} alt={job.company} className="w-full h-full object-contain p-1" referrerPolicy="no-referrer" />
          ) : (
            <Building2 className="text-gray-200" size={28} />
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-grow">
        <h3 className="font-black text-xl mb-3 group-hover:text-brand-yellow transition-colors line-clamp-2 leading-tight">
          {job.title}
        </h3>
        
        <div className="space-y-2 mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-400 font-bold">
            <Building2 size={14} className="shrink-0" />
            <span className="line-clamp-1">{job.company || 'جهة غير محددة'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400 font-bold">
            <MapPin size={14} className="shrink-0" />
            <span className="line-clamp-1">{job.location || 'المملكة العربية السعودية'}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto">
        <div className="flex items-center gap-1 text-sm font-black text-brand-black group-hover:text-brand-yellow transition-all leading-none relative z-20 pointer-events-none">
          <ArrowUpRight size={18} className="text-brand-yellow" />
          التفاصيل
        </div>
        <div className="flex items-center gap-1 text-[11px] text-gray-400 font-bold">
          {job.createdAt?.toDate ? (
            <>
              <span>{job.createdAt.toDate().toLocaleDateString('ar-SA', { year: 'numeric', month: 'numeric', day: 'numeric' })}</span>
              <span className="mr-0.5">هـ</span>
            </>
          ) : (
            <span>-</span>
          )}
          <Calendar size={12} />
        </div>
      </div>
    </motion.div>
  );
}
