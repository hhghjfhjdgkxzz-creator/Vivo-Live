
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Crown, ShieldCheck, Mic, Zap, LogIn, UserPlus, Sparkles } from 'lucide-react';
import { UserLevel, User as UserType } from '../types';
import { auth, db } from '../services/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  serverTimestamp 
} from 'firebase/firestore';

interface AuthScreenProps {
  onAuth: (user: UserType) => void;
  appLogo?: string;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onAuth, appLogo }) => {
  const [showSplash, setShowSplash] = useState(true);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // قائمة الإيميلات التي ستحصل على صلاحيات المدير تلقائياً
  const ADMIN_EMAILS = ['admin@coffee.chat', 'superadmin@vivo.live'];
  
  const LOGO = appLogo || 'https://storage.googleapis.com/static.aistudio.google.com/stables/2025/03/06/f0e64906-e7e0-4a87-af9b-029e2467d302/f0e64906-e7e0-4a87-af9b-029e2467d302.png';

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (!isLogin && !name)) {
      setError('الرجاء ملء جميع الحقول');
      return;
    }

    setLoading(true);
    setError('');

    const isTargetAdmin = ADMIN_EMAILS.includes(email.toLowerCase());

    try {
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        
        if (userDoc.exists()) {
          onAuth(userDoc.data() as UserType);
        } else {
          const userData: UserType = {
            id: firebaseUser.uid,
            customId: Math.floor(100000 + Math.random() * 899999),
            name: email.split('@')[0],
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${firebaseUser.uid}`,
            level: UserLevel.NEW,
            coins: isTargetAdmin ? 10000000 : 5000, 
            diamonds: 0,
            wealth: 0, 
            charm: 0, 
            isVip: false,
            isAdmin: isTargetAdmin,
            stats: { likes: 0, visitors: 0, following: 0, followers: 0 },
            ownedItems: []
          };
          await setDoc(doc(db, 'users', firebaseUser.uid), userData);
          onAuth(userData);
        }
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;
        
        const userData: UserType = {
          id: firebaseUser.uid,
          customId: Math.floor(100000 + Math.random() * 899999),
          name: name,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${firebaseUser.uid}`,
          level: UserLevel.NEW,
          coins: isTargetAdmin ? 10000000 : 10000,
          diamonds: 0,
          wealth: 0, 
          charm: 0, 
          isVip: false, 
          isAdmin: isTargetAdmin,
          bio: isTargetAdmin ? 'مدير النظام 👑' : 'مرحباً بك في فيفو لايف 🌹',
          stats: { likes: 0, visitors: 0, following: 0, followers: 0 },
          ownedItems: []
        };
        await setDoc(doc(db, 'users', firebaseUser.uid), { ...userData, createdAt: serverTimestamp() });
        onAuth(userData);
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        setError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
      } else if (err.code === 'auth/wrong-password') {
        setError('كلمة المرور غير صحيحة');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('البريد الإلكتروني مستخدم بالفعل');
      } else {
        setError('حدث خطأ في الاتصال، حاول مرة أخرى');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] w-full bg-[#020617] flex flex-col items-center justify-center p-6 relative overflow-hidden font-cairo">
      <AnimatePresence>
        {showSplash && (
          <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-[#020617] flex flex-col items-center justify-center">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative">
              <div className="w-48 h-48 bg-yellow-400 rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white/20">
                <img src={LOGO} className="w-full h-full object-cover" alt="Splash Logo" />
              </div>
            </motion.div>
            <h1 className="mt-8 text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600">فـيـفـو لايف</h1>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: showSplash ? 0 : 1, y: 0 }} className="w-full max-w-md z-10">
        <div className="text-center mb-10">
          <div className="w-24 h-24 bg-yellow-400 rounded-[2rem] mx-auto mb-4 overflow-hidden shadow-2xl border-2 border-white/10">
            <img src={LOGO} className="w-full h-full object-cover" alt="Auth Logo" />
          </div>
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600">فـيـفـو لايف</h1>
          <p className="text-slate-400 text-sm mt-2">عالم من التواصل المباشر والمرح</p>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-8 shadow-2xl">
          <div className="flex bg-black/40 p-1.5 rounded-2xl mb-8 border border-white/5">
            <button onClick={() => setIsLogin(true)} className={`flex-1 py-3.5 rounded-xl text-sm font-black transition-all flex items-center justify-center gap-2 ${isLogin ? 'bg-amber-500 text-black shadow-lg' : 'text-slate-500'}`}><LogIn size={18} /> دخول</button>
            <button onClick={() => setIsLogin(false)} className={`flex-1 py-3.5 rounded-xl text-sm font-black transition-all flex items-center justify-center gap-2 ${!isLogin ? 'bg-amber-500 text-black shadow-lg' : 'text-slate-500'}`}><UserPlus size={18} /> تسجيل</button>
          </div>

          <form onSubmit={handleAuth} className="space-y-5">
            {!isLogin && (
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 pr-2 uppercase">الاسم المستعار</label>
                <div className="relative">
                  <User className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pr-12 text-white text-sm outline-none" placeholder="أدخل اسمك" />
                </div>
              </div>
            )}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 pr-2 uppercase">البريد الإلكتروني</label>
              <div className="relative">
                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pr-12 text-white text-sm outline-none" placeholder="your@email.com" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 pr-2 uppercase">كلمة المرور</label>
              <div className="relative">
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pr-12 text-white text-sm outline-none" placeholder="••••••••" />
              </div>
            </div>
            {error && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-red-400 text-xs font-bold text-center">{error}</motion.div>)}
            <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-amber-500 to-amber-600 py-4 rounded-2xl text-black font-black text-sm shadow-xl active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3 mt-4">
              {loading ? <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div> : <><Zap size={18} fill="currentColor" /> {isLogin ? 'تسجيل الدخول' : 'ابدأ الرحلة الآن'}</>}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthScreen;
