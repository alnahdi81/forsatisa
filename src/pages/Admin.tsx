import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db, googleProvider, googleProvider as provider, Job, Ad, JobCategory, handleFirestoreError, OperationType } from '../lib/firebase';
import { signInWithPopup, signOut } from 'firebase/auth';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { LayoutDashboard, Plus, Trash2, Edit2, LogOut, LogIn, ChevronRight, Image as ImageIcon, Link as LinkIcon, Briefcase, Megaphone, Check, Users, ShieldCheck, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Admin() {
  const [user, loadingAuth] = useAuthState(auth);
  const [activeTab, setActiveTab] = useState<'jobs' | 'ads' | 'subs'>('jobs');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [ads, setAds] = useState<Ad[]>([]);
  const [subs, setSubs] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const isAdmin = user?.email === 'noamksa8@gmail.com';

  useEffect(() => {
    document.title = "فرصتي - لوحة تحكم";
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin, activeTab]);

  async function fetchData() {
    setLoadingData(true);
    try {
      if (activeTab === 'jobs') {
        const q = query(collection(db, 'jobs'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        setJobs(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Job)));
      } else if (activeTab === 'ads') {
        const q = query(collection(db, 'ads'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        setAds(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Ad)));
      } else if (activeTab === 'subs') {
        const q = query(collection(db, 'subscriptions'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        setSubs(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      }
    } catch (error) {
      console.error(error);
    }
    setLoadingData(false);
  }

  const login = () => signInWithPopup(auth, googleProvider);
  const logout = () => signOut(auth);

  if (loadingAuth) return <div className="p-20 text-center">جاري التحقق...</div>;

  if (!user) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-10 rounded-3xl shadow-xl border border-gray-100 text-center max-w-md w-full">
          <div className="w-20 h-20 bg-brand-yellow/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldCheck size={40} className="text-brand-yellow" />
          </div>
          <h1 className="text-2xl font-bold mb-4">لوحة تحكم الإدارة</h1>
          <p className="text-gray-500 mb-8 leading-relaxed">يرجى تسجيل الدخول باستخدام حساب المشرف للوصول إلى أدوات الإدارة.</p>
          <button onClick={login} className="w-full bg-brand-black text-white flex items-center justify-center gap-3 py-4 rounded-2xl font-bold hover:bg-gray-800 transition-all">
            <LogIn size={20} />
            تسجيل الدخول باستخدام جوجل
          </button>
        </motion.div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="p-20 text-center space-y-4">
        <h1 className="text-2xl font-bold text-red-500">عذراً، لا تملك صلاحية الوصول</h1>
        <p>هذه الصفحة مخصصة للمدراء فقط.</p>
        <button onClick={logout} className="text-brand-yellow font-bold underline">تسجيل الخروج</button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div className="flex items-center gap-4">
          <div className="bg-brand-black text-white p-3 rounded-2xl">
            <LayoutDashboard size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold">لوحة التحكم</h1>
            <p className="text-sm text-gray-500">مرحباً {user.displayName} ، يمكنك إدارة الوظائف والإعلانات من هنا.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => { setEditingItem(null); setShowModal(true); }} className="bg-brand-yellow text-brand-black px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:shadow-lg transition-all active:scale-95">
            <Plus size={20} />
            إضافة {activeTab === 'jobs' ? 'وظيفة' : 'إعلان'}
          </button>
          <button onClick={logout} className="p-3 bg-gray-50 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all">
            <LogOut size={20} />
          </button>
        </div>
      </div>

      <div className="flex gap-4 mb-8">
        {[
          { id: 'jobs', label: 'إدارة الوظائف', icon: Briefcase },
          { id: 'ads', label: 'إدارة الإعلانات', icon: Megaphone },
          { id: 'subs', label: 'المشتركين', icon: Users },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === tab.id ? 'bg-brand-black text-white' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {loadingData ? (
          <div className="p-20 text-center text-gray-400 animate-pulse">جاري تحميل البيانات...</div>
        ) : activeTab === 'subs' ? (
          <div className="overflow-x-auto">
             <table className="w-full text-right">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-bold">البريد الإلكتروني</th>
                  <th className="px-6 py-4 font-bold">تاريخ الاشتراك</th>
                  <th className="px-6 py-4 font-bold text-left">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {subs.map(sub => (
                   <tr key={sub.id}>
                    <td className="px-6 py-4 font-bold">{sub.email}</td>
                    <td className="px-6 py-4 text-xs text-gray-400">{sub.createdAt?.toDate?.().toLocaleString('ar-SA')}</td>
                    <td className="px-6 py-4 text-left">
                       <button onClick={() => handleDeleteSub(sub.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                    </td>
                   </tr>
                ))}
              </tbody>
             </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-bold">المحتوى</th>
                  <th className="px-6 py-4 font-bold">الحالة</th>
                  <th className="px-6 py-4 font-bold">التصنيف / الموقع</th>
                  <th className="px-6 py-4 font-bold">التاريخ</th>
                  <th className="px-6 py-4 font-bold text-left">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {(activeTab === 'jobs' ? jobs : ads).map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-gray-100 flex-shrink-0 flex items-center justify-center overflow-hidden border border-gray-100 font-bold bg-white">
                          {item.image ? <img src={item.image} alt="" className="w-full h-full object-cover" /> : <ImageIcon size={20} className="text-gray-300" />}
                        </div>
                        <div className="max-w-xs">
                          <div className="font-bold text-gray-900 truncate">{item.title}</div>
                          <div className="text-xs text-gray-400 truncate">{activeTab === 'jobs' ? (item as Job).company : (item as Ad).position}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {activeTab === 'jobs' && (
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${(item as Job).status === 'active' ? 'bg-green-100 text-green-700' : (item as Job).status === 'soon' ? 'bg-blue-100 text-blue-700' : (item as Job).status === 'expiring' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>
                          {(item as Job).status === 'active' ? 'نشط' : (item as Job).status === 'soon' ? 'قريباً' : (item as Job).status === 'expiring' ? 'قارب على الانتهاء' : 'منتهي'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs px-2 py-1 bg-gray-100 rounded-md font-medium text-gray-600">
                        {activeTab === 'jobs' ? (item as Job).category : (item as Ad).position}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-400">
                      {item.createdAt?.toDate?.().toLocaleDateString('ar-SA')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => { setEditingItem(item); setShowModal(true); }} className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {(activeTab === 'jobs' ? jobs : ads).length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-20 text-center text-gray-400">لا يوجد بيانات حالياً</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-brand-black/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 100 }} className="relative bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="text-xl font-bold">{editingItem ? 'تعديل' : 'إضافة'} {activeTab === 'jobs' ? 'وظيفة' : 'إعلان'}</h3>
                <button onClick={() => setShowModal(false)} className="p-2 bg-white rounded-xl shadow-sm hover:text-red-500 transition-all"><X size={20} /></button>
              </div>
              <div className="p-6 overflow-y-auto space-y-6">
                <ItemForm 
                  type={activeTab} 
                  initialData={editingItem} 
                  onSuccess={() => { setShowModal(false); fetchData(); }} 
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );

  async function handleDelete(id: string) {
    if (!confirm('هل أنت متأكد من الحذف؟')) return;
    try {
      await deleteDoc(doc(db, activeTab === 'jobs' ? 'jobs' : 'ads', id));
      fetchData();
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `${activeTab}/${id}`);
    }
  }

  async function handleDeleteSub(id: string) {
    if (!confirm('سيتم حذف البريد من قائمة الاشتراكات، هل أنت متأكد؟')) return;
    try {
      await deleteDoc(doc(db, 'subscriptions', id));
      fetchData();
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `subscriptions/${id}`);
    }
  }
}

function ItemForm({ type, initialData, onSuccess }: { type: 'jobs' | 'ads', initialData?: any, onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<any>(initialData || (type === 'jobs' ? {
    title: '',
    description: '',
    company: '',
    category: 'military',
    status: 'active',
    location: '',
    image: '',
    externalLink: '',
  } : {
    title: '',
    image: '',
    link: '',
    position: 'home_hero',
  }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const data = { ...formData, createdAt: initialData ? initialData.createdAt : serverTimestamp() };
      if (initialData) {
        await updateDoc(doc(db, type === 'jobs' ? 'jobs' : 'ads', initialData.id), data);
      } else {
        await addDoc(collection(db, type === 'jobs' ? 'jobs' : 'ads'), data);
      }
      onSuccess();
    } catch (e) {
      handleFirestoreError(e, initialData ? OperationType.UPDATE : OperationType.CREATE, type);
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-bold text-gray-700">العنوان</label>
        <input required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-yellow font-medium" />
      </div>

      {type === 'jobs' && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">الجهة / الشركة</label>
              <input value={formData.company} onChange={e => setFormData({ ...formData, company: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-yellow" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">الموقع</label>
              <input value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-yellow" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">التصنيف</label>
              <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-yellow">
                <option value="military">وظائف عسكرية</option>
                <option value="remote">عمل عن بعد</option>
                <option value="company">وظائف شركات</option>
                <option value="government">وظائف حكومية</option>
                <option value="university">مواعيد الجامعات</option>
                <option value="training">دورات تدريبية</option>
                <option value="employment_training">تدريب منتهي بالتوظيف</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">حالة الإعلان</label>
              <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-yellow">
                <option value="active">نشط (مستمر)</option>
                <option value="soon">قريباً</option>
                <option value="expiring">قارب على الانتهاء</option>
                <option value="expired">منتهي</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">الوصف التفصيلي</label>
            <textarea required rows={4} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-yellow" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">رابط التقديم الخارجي</label>
            <input value={formData.externalLink} onChange={e => setFormData({ ...formData, externalLink: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-yellow" />
          </div>
        </>
      )}

      {type === 'ads' && (
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700">مكان الإعلان</label>
          <select value={formData.position} onChange={e => setFormData({ ...formData, position: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-yellow">
            <option value="home_hero">الرئيسية (أعلى)</option>
            <option value="sidebar">القائمة الجانبية</option>
            <option value="job_detail">صفحة تفاصيل الوظيفة</option>
          </select>
        </div>
      )}

      <div className="space-y-2">
        <label className="text-sm font-bold text-gray-700">رابط الصورة (URL)</label>
        <input value={formData.image} onChange={e => setFormData({ ...formData, image: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-yellow placeholder:text-gray-300" placeholder="https://example.com/image.jpg" />
      </div>

      {type === 'ads' && (
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700">رابط الإعلان (Target URL)</label>
          <input value={formData.link} onChange={e => setFormData({ ...formData, link: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-yellow" placeholder="https://..." />
        </div>
      )}

      <button disabled={loading} type="submit" className="w-full bg-brand-yellow text-brand-black py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:shadow-xl transition-all disabled:opacity-50">
        {loading ? 'جاري الحفظ...' : (initialData ? 'تحديث البيانات' : 'إضافة الآن')}
        {!loading && <Check size={20} />}
      </button>
    </form>
  );
}
