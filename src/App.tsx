/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Link, useLocation, useParams } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './lib/firebase';
import { Menu, X, User, Instagram, Send } from 'lucide-react';
import { TikTokIcon } from './components/Icons';
import { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from './lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Real Pages
import Home from './pages/Home';
import JobList from './pages/JobList';
import JobDetail from './pages/JobDetail';
import Admin from './pages/Admin';
import StaticPage from './pages/StaticPages';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="فرصتي" className="h-12 w-auto" onError={(e) => (e.currentTarget.style.display = 'none')} />
            <span className="text-2xl font-bold text-brand-black tracking-tight logo-text">فرصتي</span>
            <div className="w-2 h-2 rounded-full bg-brand-yellow animate-pulse" />
          </Link>

          <div className="hidden lg:flex items-center gap-6">
            <Link to="/" className={`text-[13px] font-bold hover:text-brand-yellow transition-all ${location.pathname === '/' ? 'text-brand-yellow' : 'text-gray-600'}`}>الرئيسية</Link>
            <Link to="/jobs" className={`text-[13px] font-bold hover:text-brand-yellow transition-all ${location.pathname === '/jobs' ? 'text-brand-yellow' : 'text-gray-600'}`}>جميع الوظائف</Link>
            <Link to="/category/military" className={`text-[13px] font-bold hover:text-brand-yellow transition-all ${location.pathname === '/category/military' ? 'text-brand-yellow' : 'text-gray-600'}`}>عسكرية</Link>
            <Link to="/category/company" className={`text-[13px] font-bold hover:text-brand-yellow transition-all ${location.pathname === '/category/company' ? 'text-brand-yellow' : 'text-gray-600'}`}>الشركات</Link>
            <Link to="/category/government" className={`text-[13px] font-bold hover:text-brand-yellow transition-all ${location.pathname === '/category/government' ? 'text-brand-yellow' : 'text-gray-600'}`}>حكومية</Link>
            <Link to="/category/remote" className={`text-[13px] font-bold hover:text-brand-yellow transition-all ${location.pathname === '/category/remote' ? 'text-brand-yellow' : 'text-gray-600'}`}>عن بعد</Link>
            <Link to="/category/university" className={`text-[13px] font-bold hover:text-brand-yellow transition-all ${location.pathname === '/category/university' ? 'text-brand-yellow' : 'text-gray-600'}`}>الجامعات</Link>
            <Link to="/category/training" className={`text-[13px] font-bold hover:text-brand-yellow transition-all ${location.pathname === '/category/training' ? 'text-brand-yellow' : 'text-gray-600'}`}>دورات</Link>
            <Link to="/category/employment_training" className={`text-[13px] font-bold hover:text-brand-yellow transition-all ${location.pathname === '/category/employment_training' ? 'text-brand-yellow' : 'text-gray-600'}`}>تدريب توظيف</Link>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden p-2 bg-gray-50 rounded-xl">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: 1, scaleY: 1 }}
            exit={{ opacity: 0, scaleY: 0 }}
            className="lg:hidden bg-white border-t border-gray-100 p-4 space-y-2 shadow-xl origin-top"
          >
            <Link onClick={() => setIsOpen(false)} to="/" className="block text-sm font-bold p-3 hover:bg-gray-50 rounded-xl">الرئيسية</Link>
            <Link onClick={() => setIsOpen(false)} to="/jobs" className="block text-sm font-bold p-3 hover:bg-gray-50 rounded-xl">جميع الوظائف</Link>
            <Link onClick={() => setIsOpen(false)} to="/category/military" className="block text-sm font-bold p-3 hover:bg-gray-50 rounded-xl">وظائف عسكرية</Link>
            <Link onClick={() => setIsOpen(false)} to="/category/company" className="block text-sm font-bold p-3 hover:bg-gray-50 rounded-xl">وظائف الشركات</Link>
            <Link onClick={() => setIsOpen(false)} to="/category/government" className="block text-sm font-bold p-3 hover:bg-gray-50 rounded-xl">وظائف حكومية</Link>
            <Link onClick={() => setIsOpen(false)} to="/category/remote" className="block text-sm font-bold p-3 hover:bg-gray-50 rounded-xl">عن بعد</Link>
            <Link onClick={() => setIsOpen(false)} to="/category/university" className="block text-sm font-bold p-3 hover:bg-gray-50 rounded-xl">مواعيد الجامعات</Link>
            <Link onClick={() => setIsOpen(false)} to="/category/training" className="block text-sm font-bold p-3 hover:bg-gray-50 rounded-xl">دورات تدريبية</Link>
            <Link onClick={() => setIsOpen(false)} to="/category/employment_training" className="block text-sm font-bold p-3 hover:bg-gray-50 rounded-xl">تدريب منتهي بالتوظيف</Link>
            <hr className="border-gray-50 my-2" />
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 font-bold p-2">
              <Link onClick={() => setIsOpen(false)} to="/about" className="p-2">من نحن</Link>
              <Link onClick={() => setIsOpen(false)} to="/contact" className="p-2">اتصل بنا</Link>
              <Link onClick={() => setIsOpen(false)} to="/privacy" className="p-2">سياسة الخصوصية</Link>
              <Link onClick={() => setIsOpen(false)} to="/terms" className="p-2">الشروط والأحكام</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = async (e: FormEvent) => {
    e.preventDefault();
    if (!email) return;
    try {
      await addDoc(collection(db, 'subscriptions'), {
        email,
        createdAt: serverTimestamp()
      });
      setSubscribed(true);
      setEmail('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <footer className="bg-white border-t border-gray-100 mt-20 py-12">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div className="space-y-6">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="فرصتي" className="h-14 w-auto" onError={(e) => (e.currentTarget.style.display = 'none')} />
            <span className="text-2xl font-bold logo-text">فرصتي</span>
          </Link>
          <p className="text-sm text-gray-400 leading-relaxed">بوابتك للوظائف العسكرية والحكومية والشركات في المملكة العربية السعودية.</p>
          <div className="flex gap-4">
            <a href="https://t.me/forsatisa" target="_blank" rel="noopener noreferrer" className="p-2 bg-blue-50 text-blue-500 rounded-xl hover:bg-blue-500 hover:text-white transition-all shadow-sm">
              <Send size={20} />
            </a>
            <a href="https://instagram.com/forsatisa" target="_blank" rel="noopener noreferrer" className="p-2 bg-pink-50 text-pink-500 rounded-xl hover:bg-pink-500 hover:text-white transition-all shadow-sm">
              <Instagram size={20} />
            </a>
            <a href="https://tiktok.com/@forsatisa" target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-50 text-black rounded-xl hover:bg-black hover:text-white transition-all shadow-sm">
              <TikTokIcon size={20} />
            </a>
          </div>
        </div>
        <div>
          <h3 className="font-bold mb-4">روابط سريعة</h3>
          <ul className="space-y-2 text-sm text-gray-600 font-medium">
            <li><Link to="/" className="hover:text-brand-yellow">الرئيسية</Link></li>
            <li><Link to="/about" className="hover:text-brand-yellow">من نحن</Link></li>
            <li><Link to="/contact" className="hover:text-brand-yellow">اتصل بنا</Link></li>
            <li><Link to="/faq" className="hover:text-brand-yellow">الأسئلة الشائعة</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold mb-4">قانوني</h3>
          <ul className="space-y-2 text-sm text-gray-600 font-medium">
            <li><Link to="/privacy" className="hover:text-brand-yellow">سياسة الخصوصية</Link></li>
            <li><Link to="/terms" className="hover:text-brand-yellow">الشروط والأحكام</Link></li>
            <li><Link to="/privacy-settings" className="hover:text-brand-yellow">إدارة إعدادات الخصوصية</Link></li>
          </ul>
        </div>
        <div className="p-4 bg-brand-yellow/10 rounded-2xl border border-brand-yellow/20">
          <h4 className="font-bold ml-1 mb-2 text-brand-black">كن على اطلاع</h4>
          <p className="text-xs text-gray-600 mb-4 font-medium">اشترك لتصلك أحدث الوظائف فور طرحها.</p>
          {subscribed ? (
            <div className="text-xs text-green-600 font-bold bg-green-50 p-2 rounded-lg text-center">تم الاشتراك بنجاح!</div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="بريدك الإلكتروني" 
                className="bg-white px-3 py-2 rounded-lg text-xs flex-1 border border-brand-yellow/30 text-right" 
              />
              <button type="submit" className="bg-brand-black text-white px-3 py-2 rounded-lg text-xs font-bold hover:bg-brand-yellow hover:text-brand-black transition-all">اشتراك</button>
            </form>
          )}
        </div>
      </div>
      <div className="text-center mt-12 pt-8 border-t border-gray-50 text-xs text-gray-400 font-bold">
        جميع الحقوق محفوظة &copy; {new Date().getFullYear()} فرصتي
      </div>
    </footer>
  );
}

function CategoryWrapper() {
  const { category } = useParams<{ category: string }>();
  return <JobList category={category} />;
}

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col font-sans selection:bg-brand-yellow/30">
        <Routes>
          {/* Admin Routes - No Header/Footer */}
          <Route path="/admin/*" element={<Admin />} />

          {/* Public Routes - With Header/Footer */}
          <Route
            path="*"
            element={
              <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-1">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/jobs" element={<JobList />} />
                    <Route path="/category/:category" element={<CategoryWrapper />} />
                    <Route path="/job/:id" element={<JobDetail />} />
                    <Route path="/about" element={<StaticPage title="من نحن" />} />
                    <Route path="/contact" element={<StaticPage title="اتصل بنا" />} />
                    <Route path="/privacy" element={<StaticPage title="سياسة الخصوصية" />} />
                    <Route path="/terms" element={<StaticPage title="الشروط والأحكام" />} />
                    <Route path="/faq" element={<StaticPage title="الأسئلة الشائعة" />} />
                    <Route path="/privacy-settings" element={<StaticPage title="إدارة إعدادات الخصوصية" />} />
                  </Routes>
                </main>
                <Footer />
              </div>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}


