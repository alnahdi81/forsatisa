import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Trash2, LogOut, ShieldCheck, Briefcase, Image as ImageIcon, Link as LinkIcon, Calendar, Info, Building2, MapPin, CheckCircle, Clock, AlertTriangle, XCircle, ExternalLink, Copy, Download, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Job, Ad } from '../types';
import { getStoredJobs, getStoredAds, addJob, updateJob, deleteJob, saveAd, deleteAd, subscribeToJobs, subscribeToAds } from '../lib/dataService';

export default function Admin() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(() => sessionStorage.getItem('admin_logged_in') === 'true');
  const [activeTab, setActiveTab] = useState<'jobs' | 'ads'>('jobs');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [ads, setAds] = useState<Ad[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState('');

  const [copying, setCopying] = useState(false);

  const handleCopyData = () => {
    const data = JSON.stringify(jobs, null, 2);
    navigator.clipboard.writeText(data);
    setCopying(true);
    setTimeout(() => setCopying(false), 2000);
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
    sessionStorage.setItem('admin_logged_in', 'true');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    sessionStorage.removeItem('admin_logged_in');
  };

  const [formData, setFormData] = useState({
    title: '',
    company: '',
    category: 'government',
    location: 'المملكة العربية السعودية',
    externalLink: '',
    image: '',
    description: '',
    status: 'active' as Job['status'],
    createdAtManual: new Date().toISOString().split('T')[0]
  });

  const [adFormData, setAdFormData] = useState<Omit<Ad, 'id'>>({
    title: '',
    image: '',
    link: '',
    position: 'home_hero'
  });

  useEffect(() => {
    setIsLoading(true);
    const unsubJobs = subscribeToJobs((data) => {
      setJobs(data);
      setIsLoading(false);
    });
    const unsubAds = subscribeToAds((data) => {
      setAds(data);
    });
    return () => {
      unsubJobs();
      unsubAds();
    };
  }, []);

  const handleAdSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveAd(adFormData, editingId || undefined);
      setAdFormData({ title: '', image: '', link: '', position: 'home_hero' });
      setEditingId(null);
      setShowForm(false);
      setSuccessMsg('تم حفظ الإعلان بنجاح!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteAd = async (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الإعلان؟')) {
      try {
        await deleteAd(id);
        setSuccessMsg('تم حذف الإعلان بنجاح!');
        setTimeout(() => setSuccessMsg(''), 3000);
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleReset = () => {
    setFormData({
      title: '',
      company: '',
      category: 'government',
      location: 'المملكة العربية السعودية',
      externalLink: '',
      image: '',
      description: '',
      status: 'active',
      createdAtManual: new Date().toISOString().split('T')[0]
    });
    setAdFormData({
      title: '',
      image: '',
      link: '',
      position: 'home_hero'
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateJob(editingId, {
          ...formData,
          createdAtManual: formData.createdAtManual,
          createdAtDate: new Date(formData.createdAtManual).toISOString()
        } as any);
      } else {
        await addJob({
          ...formData,
          createdAtManual: formData.createdAtManual,
          createdAtDate: new Date(formData.createdAtManual).toISOString()
        } as any);
      }
      handleReset();
      setSuccessMsg('تم حفظ الوظيفة بنجاح!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذه الوظيفة؟')) {
      try {
        await deleteJob(id);
        setSuccessMsg('تم حذف الوظيفة بنجاح!');
        setTimeout(() => setSuccessMsg(''), 3000);
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleEdit = (job: Job) => {
    setFormData({
      title: job.title,
      company: job.company,
      category: job.category,
      location: job.location || 'المملكة العربية السعودية',
      externalLink: job.externalLink,
      image: job.image || '',
      description: job.description,
      status: job.status,
      createdAtManual: job.createdAt?.toDate ? job.createdAt.toDate().toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    });
    setEditingId(job.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans" dir="rtl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="bg-white p-10 rounded-[2.5rem] shadow-2xl border border-gray-100 w-full max-w-md text-center"
        >
          <div className="w-20 h-20 bg-brand-yellow rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-brand-yellow/20">
            <ShieldCheck size={40} className="text-brand-black" />
          </div>
          <h1 className="text-2xl font-black mb-2 text-brand-black">لوحة التحكم</h1>
          <p className="text-gray-400 mb-8 font-medium">سجل دخولك لإدارة الوظائف والإعلانات</p>
          
          <div className="space-y-4">
            <button 
              onClick={handleLogin}
              className="w-full bg-brand-black text-white py-5 rounded-2xl font-bold hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-black/10"
            >
              دخول سريع للنظام
            </button>
            <button onClick={() => navigate('/')} className="w-full py-4 text-gray-400 font-bold hover:text-brand-black transition-colors">
              العودة للمعاينة
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-12 h-12 border-4 border-brand-yellow border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fcfcfc] font-sans pb-20" dir="rtl">
      {/* Decorative bar */}
      <div className="h-2 bg-brand-yellow w-full"></div>
      {/* Top Navbar */}
      <nav className="bg-brand-black text-white border-b border-white/5 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-brand-yellow rounded-2xl flex items-center justify-center rotate-3 shadow-lg shadow-brand-yellow/20">
              <Briefcase size={24} className="text-brand-black -rotate-3" />
            </div>
            <div>
              <h1 className="text-xl font-black">لوحة التحكم</h1>
              <p className="text-[10px] text-brand-yellow font-black uppercase tracking-tighter">Forsati Admin Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-3">

            <Link 
              to="/"
              className="bg-white/10 text-white px-5 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-white/20 transition-all border border-white/5"
            >
              <ExternalLink size={18} />
              <span className="hidden md:inline font-black text-sm">معاينة الموقع</span>
            </Link>
            <button 
              onClick={() => setShowForm(!showForm)}
              className="bg-brand-yellow text-brand-black px-6 py-3 rounded-2xl font-black flex items-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-brand-yellow/10"
            >
              <Plus size={20} />
              <span className="hidden md:inline">{showForm ? 'إغلاق النموذج' : 'إضافة وظيفة'}</span>
            </button>
            <button 
              onClick={handleLogout} 
              className="p-3 bg-white/5 text-gray-400 rounded-2xl hover:bg-red-500/10 hover:text-red-500 transition-all border border-white/5 group"
            >
              <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 mt-6">
        <div className="flex gap-2 bg-gray-100 p-1 rounded-2xl w-fit mb-8">
           <button 
             onClick={() => { setActiveTab('jobs'); setShowForm(false); }}
             className={`px-8 py-3 rounded-xl font-bold transition-all ${activeTab === 'jobs' ? 'bg-white text-brand-black shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
           >
             الوظائف
           </button>
           <button 
             onClick={() => { setActiveTab('ads'); setShowForm(false); }}
             className={`px-8 py-3 rounded-xl font-bold transition-all ${activeTab === 'ads' ? 'bg-white text-brand-black shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
           >
             الإعلانات البنرات
           </button>
        </div>

        <AnimatePresence>
          {successMsg && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-6 bg-green-50 text-green-600 px-6 py-4 rounded-2xl font-bold border border-green-100 flex items-center justify-center gap-2">
               <CheckCircle size={20} />
               {successMsg}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showForm && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -20 }}
              className="mb-10"
            >
              {activeTab === 'jobs' ? (
                <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-gray-100 shadow-xl relative overflow-hidden">
                  {/* ... Existing Job Form ... */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-brand-yellow/5 rounded-full -mr-16 -mt-16"></div>
                  
                  <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
                    <div className="w-2 h-8 bg-brand-yellow rounded-full"></div>
                    {editingId ? 'تعديل بيانات الوظيفة' : 'إدخال وظيفة جديدة'}
                  </h2>

                  <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-sm font-black text-gray-400 mr-2">مسمى الوظيفة (الاسم)</label>
                        <div className="relative">
                          <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-gray-50 px-6 py-4 rounded-2xl border-2 border-transparent focus:border-brand-yellow focus:bg-white outline-none transition-all font-bold pr-12" placeholder="مثال: جندي - مهندس نظم" />
                          <Briefcase className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-black text-gray-400 mr-2">نوع الجهة (قطاع التوظيف)</label>
                        <div className="relative">
                          <select required value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} className="w-full bg-gray-50 px-6 py-4 rounded-2xl border-2 border-transparent focus:border-brand-yellow focus:bg-white outline-none transition-all font-bold pr-12 appearance-none">
                              <option value="">اخترالقطاع...</option>
                              <option value="حكومي">حكومي</option>
                              <option value="عسكري">عسكري</option>
                              <option value="شبه حكومي">شبه حكومي</option>
                              <option value="شركات">شركات / خاص</option>
                              <option value="جامعات">جامعات / تعليم</option>
                              <option value="مركز تدريب">مركز تدريب</option>
                          </select>
                          <Building2 className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div className="space-y-2">
                        <label className="text-sm font-black text-gray-400 mr-2">التصنيف (النوع)</label>
                          <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-gray-50 px-6 py-4 rounded-2xl border-2 border-transparent focus:border-brand-yellow focus:bg-white outline-none transition-all font-bold">
                            <option value="government">حكومي</option>
                            <option value="military">عسكري</option>
                            <option value="semi_government">شبه حكومي</option>
                            <option value="company">شركات / خاص</option>
                            <option value="remote">عمل عن بعد</option>
                            <option value="university">جامعات / تعليم</option>
                            <option value="training">دورات تدريبية</option>
                            <option value="employment_training">تدريب منتهي بالتوظيف</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-black text-gray-400 mr-2">الحالة</label>
                        <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as Job['status']})} className="w-full bg-gray-50 px-6 py-4 rounded-2xl border-2 border-transparent focus:border-brand-yellow focus:bg-white outline-none transition-all font-bold">
                            <option value="active">نشط ✅</option>
                            <option value="expiring">ينتهي قريباً ⏳</option>
                            <option value="soon">قريباً 🔔</option>
                            <option value="expired">منتهي ⛔</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-black text-gray-400 mr-2">تاريخ النشر</label>
                        <div className="relative">
                          <input type="date" value={formData.createdAtManual} onChange={e => setFormData({...formData, createdAtManual: e.target.value})} className="w-full bg-gray-50 px-6 py-4 rounded-2xl border-2 border-transparent focus:border-brand-yellow focus:bg-white outline-none transition-all font-bold pr-12" />
                          <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-sm font-black text-gray-400 mr-2">رابط الصورة (اختياري)</label>
                        <div className="relative">
                          <input value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} className="w-full bg-gray-50 px-6 py-4 rounded-2xl border-2 border-transparent focus:border-brand-yellow focus:bg-white outline-none transition-all font-bold pr-12 dir-ltr text-right" placeholder="https://image-url..." />
                          <ImageIcon className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-black text-gray-400 mr-2">رابط التقديم</label>
                        <div className="relative">
                          <input required value={formData.externalLink} onChange={e => setFormData({...formData, externalLink: e.target.value})} className="w-full bg-gray-50 px-6 py-4 rounded-2xl border-2 border-transparent focus:border-brand-yellow focus:bg-white outline-none transition-all font-bold pr-12 dir-ltr text-right" placeholder="https://apply-link..." />
                          <LinkIcon className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-black text-gray-400 mr-2">وصف الوظيفة والشروط</label>
                      <div className="relative">
                        <textarea rows={5} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-gray-50 px-6 py-4 rounded-2xl border-2 border-transparent focus:border-brand-yellow focus:bg-white outline-none transition-all font-bold pr-12" placeholder="اكتب تفاصيل الوظيفة هنا..."></textarea>
                        <Info className="absolute right-4 top-6 text-gray-300" size={20} />
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <button type="submit" className="flex-1 bg-brand-black text-white py-5 rounded-2xl font-black text-lg hover:bg-gray-800 transition-all shadow-xl shadow-black/20">
                        {editingId ? 'تحديث البيانات 💾' : 'نشر الوظيفة الآن 🚀'}
                      </button>
                      <button type="button" onClick={handleReset} className="px-10 bg-gray-100 text-gray-500 font-bold rounded-2xl hover:bg-gray-200 transition-all">
                        إلغاء
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-gray-100 shadow-xl relative overflow-hidden">
                   <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
                    <div className="w-2 h-8 bg-brand-yellow rounded-full"></div>
                    {editingId ? 'تعديل الإعلان' : 'إضافة إعلان بنر جديد'}
                  </h2>
                  <form onSubmit={handleAdSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-black text-gray-400 mr-2">عنوان الإعلان</label>
                        <input required value={adFormData.title} onChange={e => setAdFormData({...adFormData, title: e.target.value})} className="w-full bg-gray-50 px-6 py-4 rounded-2xl border-2 border-transparent focus:border-brand-yellow outline-none font-bold" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-black text-gray-400 mr-2">المكان</label>
                        <select value={adFormData.position} onChange={e => setAdFormData({...adFormData, position: e.target.value as Ad['position']})} className="w-full bg-gray-50 px-6 py-4 rounded-2xl border-2 border-transparent focus:border-brand-yellow outline-none font-bold">
                           <option value="home_hero">أسفل الهيدر (رئيسي)</option>
                           <option value="sidebar">وسط الصفحة</option>
                           <option value="job_detail">صفحة تفاصيل الوظيفة</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-sm font-black text-gray-400 mr-2">رابط صورة البنر</label>
                       <input required value={adFormData.image} onChange={e => setAdFormData({...adFormData, image: e.target.value})} className="w-full bg-gray-50 px-6 py-4 rounded-2xl border-2 border-transparent focus:border-brand-yellow outline-none font-bold dir-ltr text-right" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-sm font-black text-gray-400 mr-2">الرابط عند الضغط</label>
                       <input required value={adFormData.link} onChange={e => setAdFormData({...adFormData, link: e.target.value})} className="w-full bg-gray-50 px-6 py-4 rounded-2xl border-2 border-transparent focus:border-brand-yellow outline-none font-bold dir-ltr text-right" />
                    </div>
                    <div className="flex gap-4 pt-4">
                      <button type="submit" className="flex-1 bg-brand-black text-white py-5 rounded-2xl font-black text-lg hover:bg-gray-800 transition-all shadow-xl shadow-black/20">
                        {editingId ? 'حفظ التعديلات' : 'إضافة الإعلان'}
                      </button>
                      <button type="button" onClick={handleReset} className="px-10 bg-gray-100 text-gray-500 font-bold rounded-2xl hover:bg-gray-200 transition-all">
                        إلغاء
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {activeTab === 'jobs' ? (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
               <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">إجمالي الوظائف</p>
                  <h3 className="text-3xl font-black">{jobs.length}</h3>
               </div>
               <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">الوظائف النشطة</p>
                  <h3 className="text-3xl font-black text-green-500">{jobs.filter(j => j.status === 'active').length}</h3>
               </div>
               <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">تنتهي قريباً</p>
                  <h3 className="text-3xl font-black text-orange-500">{jobs.filter(j => j.status === 'expiring').length}</h3>
               </div>
               <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">التفاعل</p>
                  <h3 className="text-3xl font-black">100%</h3>
               </div>
            </div>

            {/* List View */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse">
                  <thead>
                    <tr className="bg-gray-50/80 border-b border-gray-100">
                      <th className="px-8 py-6 text-sm font-black text-gray-400 uppercase tracking-widest">الوظيفة</th>
                      <th className="px-8 py-6 text-sm font-black text-gray-400 uppercase tracking-widest">الحالة</th>
                      <th className="px-8 py-6 text-sm font-black text-gray-400 uppercase tracking-widest">التاريخ</th>
                      <th className="px-8 py-6 text-sm font-black text-gray-400 uppercase tracking-widest text-left">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {jobs.length > 0 ? (
                      jobs.map(job => (
                        <tr key={job.id} className="hover:bg-gray-50/50 transition-colors group">
                          {/* ... existing cells ... */}
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                                {job.image ? <img src={job.image} className="w-full h-full object-cover" referrerPolicy="no-referrer" /> : <Building2 size={20} className="text-gray-300" />}
                              </div>
                              <div>
                                <div className="font-black text-brand-black">{job.title}</div>
                                <div className="text-xs text-gray-400 font-bold">{job.company}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                             <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase ${
                              job.status === 'active' ? 'bg-green-50 text-green-600' :
                              job.status === 'expiring' ? 'bg-orange-50 text-orange-600' :
                              job.status === 'soon' ? 'bg-blue-50 text-blue-600' :
                              'bg-red-50 text-red-600'
                            }`}>
                              {job.status === 'active' ? 'نشط' : job.status === 'soon' ? 'قريباً' : job.status === 'expiring' ? 'ينتهي قريباً' : 'منتهي'}
                            </span>
                          </td>
                          <td className="px-8 py-6 text-gray-400 text-sm font-bold">
                            {job.createdAt?.toDate ? job.createdAt.toDate().toLocaleDateString('ar-SA') : (job.createdAtManual || 'N/A')}
                          </td>
                          <td className="px-8 py-6 text-left">
                            <div className="flex items-center justify-end gap-2">
                              <button 
                                onClick={() => handleEdit(job)}
                                className="p-2.5 bg-gray-50 text-gray-500 hover:bg-brand-yellow/10 hover:text-brand-yellow rounded-xl transition-all"
                              >
                                <Plus size={18} className="rotate-45" />
                              </button>
                              <button 
                                onClick={() => handleDelete(job.id)}
                                className="p-2.5 bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-8 py-20 text-center text-gray-400 font-bold">
                          <Briefcase className="mx-auto mb-4 opacity-20" size={48} />
                          لا يوجد وظائف مضافة حالياً
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {ads.length > 0 ? (
              ads.map(ad => (
                <div key={ad.id} className="bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-100 group relative">
                   <div className="aspect-[2/1] relative">
                      <img src={ad.image} alt={ad.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-3">
                         <button 
                           onClick={() => {
                             setEditingId(ad.id);
                             setAdFormData({ title: ad.title, image: ad.image, link: ad.link, position: ad.position });
                             setShowForm(true);
                             window.scrollTo({ top: 0, behavior: 'smooth' });
                           }}
                           className="p-3 bg-white rounded-xl text-brand-black hover:scale-110 transition-all"
                         >
                           <Plus className="rotate-45" size={20} />
                         </button>
                         <button 
                           onClick={() => handleDeleteAd(ad.id)}
                           className="p-3 bg-red-500 rounded-xl text-white hover:scale-110 transition-all"
                         >
                           <Trash2 size={20} />
                         </button>
                      </div>
                   </div>
                   <div className="p-5">
                      <div className="text-[10px] font-black text-brand-yellow uppercase mb-1">{ad.position}</div>
                      <h3 className="font-bold text-lg">{ad.title}</h3>
                      <p className="text-xs text-gray-400 truncate mt-1">{ad.link}</p>
                   </div>
                </div>
              ))
            ) : null}
            <button 
              onClick={() => { setEditingId(null); setShowForm(true); }}
              className="aspect-[2/1] rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 hover:border-brand-yellow hover:bg-brand-yellow/5 transition-all"
            >
               <Plus size={32} />
               <span className="font-bold mt-2">إضافة بنر جديد</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
