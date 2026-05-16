import { Job } from '../lib/firebase';
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
    military: 'وظائف عسكرية',
    remote: 'عمل عن بعد',
    company: 'وظائف شركات',
    government: 'وظائف حكومية',
    university: 'مواعيد جامعات',
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
      className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all group relative"
    >
      <Link to={`/job/${job.id}`} className="absolute inset-0 z-10" aria-label={job.title} />
      
      <div className="flex justify-between items-start mb-4">
        <div className="w-14 h-14 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 overflow-hidden">
          {job.image ? (
            <img src={job.image} alt={job.company} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            <Building2 className="text-gray-300" size={24} />
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex gap-1 items-center relative z-20">
            <button 
              onClick={handleShare}
              className="p-1.5 bg-gray-50 text-gray-400 hover:text-brand-yellow hover:bg-brand-yellow/5 rounded-lg transition-all"
              title="مشاركة"
            >
              <Share2 size={16} />
            </button>
            <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${categoryColors[job.category]}`}>
              {categoryLabels[job.category]}
            </span>
          </div>
          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md relative z-20 ${job.status === 'active' ? 'bg-green-50 text-green-600' : job.status === 'soon' ? 'bg-blue-50 text-blue-600' : job.status === 'expiring' ? 'bg-orange-50 text-orange-600' : 'bg-red-50 text-red-600'}`}>
            {job.status === 'active' ? 'نشط' : job.status === 'soon' ? 'قريباً' : job.status === 'expiring' ? 'قارب على الانتهاء' : 'منتهي'}
          </span>
        </div>
      </div>

      <h3 className="font-bold text-lg mb-2 group-hover:text-brand-yellow transition-colors line-clamp-1">{job.title}</h3>
      
      <div className="space-y-2 mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Building2 size={14} />
          <span>{job.company || 'جهة غير محددة'}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <MapPin size={14} />
          <span>{job.location || 'المملكة العربية السعودية'}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-50">
        <div className="flex items-center gap-1 text-[10px] text-gray-400">
          <Calendar size={12} />
          <span>{job.createdAt?.toDate().toLocaleDateString('ar-SA')}</span>
        </div>
        <div className="flex items-center gap-1 text-sm font-bold text-brand-black group-hover:gap-2 transition-all leading-none relative z-20 pointer-events-none">
          التفاصيل
          <ArrowUpRight size={16} className="text-brand-yellow" />
        </div>
      </div>
    </motion.div>
  );
}
