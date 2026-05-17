import React, { useState, useEffect, useRef } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useNavigate } from 'react-router-dom';
import { auth, db, googleProvider, Job, Ad, handleFirestoreError, OperationType } from '../lib/firebase';
import { signInWithPopup, signOut, GoogleAuthProvider } from 'firebase/auth';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, serverTimestamp, query, orderBy, where, onSnapshot } from 'firebase/firestore';
import { LayoutDashboard, Plus, Trash2, Edit2, LogOut, LogIn, Image as ImageIcon, Briefcase, Megaphone, Check, Users, ShieldCheck, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Admin() {
  const [user, loadingAuth] = useAuthState(auth);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'jobs' | 'ads' | 'subs' | 'admins'>('jobs');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [ads, setAds] = useState<Ad[]>([]);
  const [subs, setSubs] = useState<any[]>([]);
  const [admins, setAdmins] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isUserAdmin, setIsUserAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const redirectTimerRef = useRef<NodeJS.Timeout | null>(null);

  const clearRedirectTimer = () => {
    if (redirectTimerRef.current) {
      clearTimeout(redirectTimerRef.current);
      redirectTimerRef.current = null;
    }
  };

  const SUPER_ADMIN_EMAIL = 'noamksa8@gmail.com';
  const isSuperAdmin = user?.email === SUPER_ADMIN_EMAIL;

  useEffect(() => {
    let unsubscribe: () => void = () => {};
    let isMounted = true;
    
    async function checkAdmin() {
      // If we are still loading the initial auth state, just wait
      if (loadingAuth) return;

      clearRedirectTimer();

      if (!user) {
        if (isMounted) setCheckingAdmin(false);
        return;
      }
      
      // If we have a user, ensure we are in a checking state
      if (isMounted) setCheckingAdmin(true);

      if (isSuperAdmin) {
        if (isMounted) {
          setIsUserAdmin(true);
          setCheckingAdmin(false);
        }
        return;
      }

      // Use a listener for real-time admin status
      const q = query(collection(db, 'admins'), where('email', '==', user.email));
      unsubscribe = onSnapshot(q, (snapshot) => {
        if (!isMounted) return;
        
        const isAdmin = !snapshot.empty;
        setIsUserAdmin(isAdmin);
        setCheckingAdmin(false);
        
        // If not admin, redirect after a short delay
        if (!isAdmin) {
          clearRedirectTimer();
          redirectTimerRef.current = setTimeout(() => {
            if (isMounted) navigate('/');
          }, 4000); // 4 seconds to give them a chance to see the message
        } else {
          clearRedirectTimer();
        }
      }, (error) => {
        console.error("Admin check error:", error);
        if (isMounted) {
          setIsUserAdmin(false);
          setCheckingAdmin(false);
          navigate('/');
        }
      });
    }

    checkAdmin();
    return () => {
      isMounted = false;
      unsubscribe();
      clearRedirectTimer();
    };
  }, [user, isSuperAdmin, loadingAuth, navigate]);

  useEffect(() => {
    document.title = "فرصتي - لوحة تحكم";
    if (isUserAdmin) {
      fetchData();
    }
  }, [isUserAdmin, activeTab]);

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
      } else if (activeTab === 'admins') {
        const q = query(collection(db, 'admins'), orderBy('addedAt', 'desc'));
        const snapshot = await getDocs(q);
        setAdmins(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      }
    } catch (error) {
      console.error(error);
    }
    setLoadingData(false);
  }

  const [loginLoading, setLoginLoading] = useState(false);

  const login = async () => {
    if (loginLoading) return;
    setLoginLoading(true);
    clearRedirectTimer();
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ 
        prompt: 'select_account',
        display: 'popup'
      });
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error("Login failure:", error);
      if (isUserAdmin === false && user) {
        // If login failed/cancelled but user is still logged in as non-admin, 
        // we might want to stay on the page to let them try again
      }
      
      if (error.code === 'auth/popup-closed-by-user') {
        // No action needed
      } else {
        alert("فشل تسجيل الدخول، يرجى المحاولة مرة أخرى أو المتصفح يمنع النوافذ المنبثقة");
      }
    } finally {
      setLoginLoading(false);
    }
  };
  const logout = () => signOut(auth);

  if (loadingAuth || checkingAdmin) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 border-4 border-brand-yellow border-t-transparent rounded-full animate-spin"></div>
      <div className="text-gray-400 font-bold">جاري التحقق من الصلاحيات...</div>
    </div>
  );

  if (!user) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-gray-100 text-center max-w-md w-full">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-brand-yellow/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldCheck size={40} className="text-brand-yellow" />
          </div>
          <h1 className="text-xl md:text-2xl font-bold mb-4">لوحة تحكم الإدارة</h1>
          <p className="text-sm md:text-base text-gray-500 mb-8 leading-relaxed">يرجى تسجيل الدخول باستخدام حساب المشرف للوصول إلى أدوات الإدارة.</p>
          <button 
            disabled={loginLoading}
            onClick={login} 
            className="w-full bg-brand-black text-white flex items-center justify-center gap-3 py-3 md:py-4 rounded-2xl font-bold hover:bg-gray-800 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loginLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <LogIn size={20} />
            )}
            {loginLoading ? 'جاري التحويل...' : 'تسجيل الدخول باستخدام جوجل'}
          </button>
        </motion.div>
      </div>
    );
  }

  if (!isUserAdmin) {
    return (
      <div className="p-10 md:p-20 text-center space-y-4">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
          <X size={32} />
        </div>
        <h1 className="text-xl md:text-2xl font-bold text-red-500">عذراً، لا تملك صلاحية الوصول</h1>
        <p className="text-gray-500 max-w-sm mx-auto">هذه الصفحة مخصصة للمدراء المعتمدين فقط. سيتم توجيهك للرئيسية تلقائياً...</p>
        <div className="pt-4 flex flex-col md:flex-row items-center justify-center gap-3">
           <button onClick={() => navigate('/')} className="w-full md:w-auto bg-brand-black text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 transition-all">العودة للرئيسية</button>
           <button onClick={logout} className="w-full md:w-auto bg-gray-100 px-8 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all">تسجيل الخروج</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 md:mb-12">
        <div className="flex items-center gap-4">
          <div className="bg-brand-black text-white p-3 rounded-2xl shrink-0">
            <LayoutDashboard size={28} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">لوحة التحكم</h1>
            <p className="text-xs md:text-sm text-gray-500">مرحباً {user.displayName?.split(' ')[0]} ، إدارة بوابتك من هنا.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          {activeTab !== 'subs' && activeTab !== 'admins' && (
            <button onClick={() => { setEditingItem(null); setShowModal(true); }} className="flex-1 md:flex-none justify-center bg-brand-yellow text-brand-black px-5 md:px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:shadow-lg transition-all active:scale-95 text-sm md:text-base">
              <Plus size={18} />
              إضافة {activeTab === 'jobs' ? 'وظيفة' : 'إعلان'}
            </button>
          )}
          {activeTab === 'admins' && isSuperAdmin && (
             <button onClick={() => { setEditingItem(null); setShowModal(true); }} className="flex-1 md:flex-none justify-center bg-brand-yellow text-brand-black px-5 md:px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:shadow-lg transition-all active:scale-95 text-sm md:text-base">
              <Plus size={18} />
              إضافة مشرف
            </button>
          )}
          <button onClick={() => navigate('/')} title="العودة للرئيسية" className="p-3 bg-white border border-gray-100 shadow-sm rounded-xl text-gray-400 hover:text-brand-yellow hover:bg-yellow-50 transition-all shrink-0">
            <Briefcase size={20} />
          </button>
          <button onClick={logout} title="تسجيل الخروج" className="p-3 bg-white border border-gray-100 shadow-sm rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all shrink-0">
            <LogOut size={20} />
          </button>
        </div>
      </div>

      <div className="flex gap-2 md:gap-4 mb-8 overflow-x-auto pb-2 scrollbar-hide no-scrollbar">
        {[
          { id: 'jobs', label: 'الوظائف', icon: Briefcase },
          { id: 'ads', label: 'الإعلانات', icon: Megaphone },
          { id: 'subs', label: 'المشتركين', icon: Users },
          ...(isSuperAdmin ? [{ id: 'admins', label: 'المشرفين', icon: ShieldCheck }] : []),
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 md:px-6 py-3 rounded-xl font-bold transition-all text-sm md:text-base whitespace-nowrap border ${activeTab === tab.id ? 'bg-brand-black text-white border-brand-black shadow-md' : 'bg-white text-gray-400 border-gray-100 hover:bg-gray-50'}`}
          >
            <tab.icon size={18} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {loadingData ? (
          <div className="p-20 text-center text-gray-400 animate-pulse font-bold">جاري تحميل البيانات...</div>
        ) : activeTab === 'subs' ? (
          <div className="overflow-x-auto">
             <table className="w-full text-right hidden md:table">
              <thead className="bg-gray-50 text-gray-500 text-[10px] md:text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-bold">البريد الإلكتروني</th>
                  <th className="px-6 py-4 font-bold">تاريخ الاشتراك</th>
                  <th className="px-6 py-4 font-bold text-left">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {subs.map(sub => (
                   <tr key={sub.id}>
                    <td className="px-6 py-4 font-bold text-sm">{sub.email}</td>
                    <td className="px-6 py-4 text-xs text-gray-400">{sub.createdAt?.toDate?.().toLocaleString('ar-SA')}</td>
                    <td className="px-6 py-4 text-left">
                       <button onClick={() => handleDeleteSub(sub.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                    </td>
                   </tr>
                ))}
              </tbody>
             </table>
             <div className="md:hidden divide-y divide-gray-50">
                {subs.map(sub => (
                  <div key={sub.id} className="p-4 flex justify-between items-center bg-white">
                    <div>
                      <div className="font-bold text-sm">{sub.email}</div>
                      <div className="text-[10px] text-gray-400">{sub.createdAt?.toDate?.().toLocaleString('ar-SA')}</div>
                    </div>
                    <button onClick={() => handleDeleteSub(sub.id)} className="p-2 text-red-500 bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                  </div>
                ))}
             </div>
          </div>
        ) : activeTab === 'admins' ? (
          <div className="overflow-x-auto">
             <table className="w-full text-right hidden md:table">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-bold">المشرف</th>
                  <th className="px-6 py-4 font-bold">الصلاحية</th>
                  <th className="px-6 py-4 font-bold text-left">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {admins.map(admin => (
                   <tr key={admin.id}>
                    <td className="px-6 py-4">
                      <div className="font-bold text-sm">{admin.name || 'مشرف'}</div>
                      <div className="text-xs text-gray-400">{admin.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${admin.role === 'owner' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                        {admin.role === 'owner' ? 'مالك' : 'موظف'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-left">
                       <button onClick={() => handleDeleteAdmin(admin.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                    </td>
                   </tr>
                ))}
              </tbody>
             </table>
             <div className="md:hidden divide-y divide-gray-50">
                {admins.map(admin => (
                  <div key={admin.id} className="p-4 flex justify-between items-center bg-white">
                    <div className="space-y-1">
                      <div className="font-bold text-sm">{admin.email}</div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${admin.role === 'owner' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                          {admin.role === 'owner' ? 'مالك' : 'موظف'}
                        </span>
                      </div>
                    </div>
                    <button onClick={() => handleDeleteAdmin(admin.id)} className="p-2 text-red-500 bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                  </div>
                ))}
             </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right hidden md:table">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-bold">المحتوى</th>
                  <th className="px-6 py-4 font-bold">الحالة</th>
                  <th className="px-6 py-4 font-bold">التصنيف / الموقع</th>
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
              </tbody>
            </table>
            
            {/* Mobile View for Jobs/Ads */}
            <div className="md:hidden divide-y divide-gray-50">
                {(activeTab === 'jobs' ? jobs : ads).map((item) => (
                   <div key={item.id} className="p-4 flex flex-col gap-3 bg-white">
                      <div className="flex items-center gap-3">
                         <div className="w-12 h-12 rounded-lg bg-gray-50 flex-shrink-0 flex items-center justify-center overflow-hidden border border-gray-100">
                            {item.image ? <img src={item.image} alt="" className="w-full h-full object-cover" /> : <ImageIcon size={20} className="text-gray-300" />}
                         </div>
                         <div className="flex-1 min-w-0">
                            <div className="font-bold text-sm truncate">{item.title}</div>
                            <div className="text-xs text-gray-400 truncate">{activeTab === 'jobs' ? (item as Job).company : (item as Ad).position}</div>
                         </div>
                         <div className="flex gap-1 shrink-0">
                            <button onClick={() => { setEditingItem(item); setShowModal(true); }} className="p-2.5 text-blue-600 bg-blue-50 rounded-xl"><Edit2 size={16} /></button>
                            <button onClick={() => handleDelete(item.id)} className="p-2.5 text-red-600 bg-red-50 rounded-xl"><Trash2 size={16} /></button>
                         </div>
                      </div>
                      <div className="flex items-center justify-between">
                         <div className="flex gap-2">
                            {activeTab === 'jobs' && (
                               <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${(item as Job).status === 'active' ? 'bg-green-100 text-green-700' : (item as Job).status === 'soon' ? 'bg-blue-100 text-blue-700' : (item as Job).status === 'expiring' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>
                                  {(item as Job).status === 'active' ? 'نشط' : (item as Job).status === 'soon' ? 'قريباً' : (item as Job).status === 'expiring' ? 'قارب على الانتهاء' : 'منتهي'}
                               </span>
                            )}
                            <span className="text-[10px] px-2 py-0.5 bg-gray-100 rounded-md text-gray-500 font-bold whitespace-nowrap">
                               {activeTab === 'jobs' ? (item as Job).category : (item as Ad).position}
                            </span>
                         </div>
                         <div className="text-[10px] text-gray-400 font-bold">{item.createdAt?.toDate?.().toLocaleDateString('ar-SA')}</div>
                      </div>
                   </div>
                ))}
            </div>

            {(activeTab === 'jobs' ? jobs : ads).length === 0 && (
              <div className="p-20 text-center text-gray-400 font-bold">لا يوجد بيانات حالياً</div>
            )}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-brand-black/70 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, y: 50, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 50, scale: 0.95 }} className="relative bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
              <div className="p-5 md:p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="text-lg md:text-xl font-bold">
                  {editingItem ? 'تعديل' : 'إضافة'} {activeTab === 'jobs' ? 'وظيفة' : activeTab === 'ads' ? 'إعلان' : 'مشرف'}
                </h3>
                <button onClick={() => setShowModal(false)} className="p-2 bg-white rounded-xl shadow-sm hover:text-red-500 transition-all active:scale-90"><X size={20} /></button>
              </div>
              <div className="p-5 md:p-6 overflow-y-auto space-y-6 scrollbar-hide no-scrollbar">
                {activeTab === 'admins' ? (
                  <AdminForm onSuccess={() => { setShowModal(false); fetchData(); }} />
                ) : (
                  <ItemForm 
                    type={activeTab as 'jobs' | 'ads'} 
                    initialData={editingItem} 
                    onSuccess={() => { setShowModal(false); fetchData(); }} 
                  />
                )}
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

  async function handleDeleteAdmin(id: string) {
    if (!confirm('هل أنت متأكد من سحب صلاحية هذا المشرف؟')) return;
    try {
      await deleteDoc(doc(db, 'admins', id));
      fetchData();
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `admins/${id}`);
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
              <label className="text-sm font-bold text-gray-700">نوع الجهة</label>
              <select 
                value={formData.company} 
                onChange={e => setFormData({ ...formData, company: e.target.value })} 
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-yellow"
              >
                <option value="">اختر نوع الجهة</option>
                <option value="حكومية">حكومية</option>
                <option value="شركات">شركات</option>
                <option value="قطاع خاص">قطاع خاص</option>
                <option value="شبه حكومية">شبه حكومية</option>
                <option value="هيئة ومؤسسة عامة">هيئة ومؤسسة عامة</option>
              </select>
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

function AdminForm({ onSuccess }: { onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'owner' | 'employee'>('employee');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, 'admins'), {
        email,
        name,
        role,
        addedAt: serverTimestamp()
      });
      onSuccess();
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'admins');
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-bold text-gray-700">البريد الإلكتروني (جوجل)</label>
        <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-yellow font-medium" placeholder="example@gmail.com" />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-bold text-gray-700">الاسم</label>
        <input required value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-yellow font-medium" />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-bold text-gray-700">الصلاحية</label>
        <select value={role} onChange={e => setRole(e.target.value as any)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-yellow">
           <option value="employee">موظف (إدارة الوظائف والإعلانات)</option>
           <option value="owner">شريك (كامل الصلاحيات)</option>
        </select>
      </div>
      <button disabled={loading} type="submit" className="w-full bg-brand-yellow text-brand-black py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:shadow-xl transition-all disabled:opacity-50">
        {loading ? 'جاري الإضافة...' : 'إضافة مشرف الآن'}
        {!loading && <ShieldCheck size={20} />}
      </button>
    </form>
  )
}
