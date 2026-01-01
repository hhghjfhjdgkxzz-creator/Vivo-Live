
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

  const ADMIN_EMAILS = ['admin@coffee.chat', 'superadmin@vivo.live'];
  const LOGO = appLogo || 'https://storage.googleapis.com/static.aistudio.google.com/stables/2025/03/06/f0e64906-e7e0-4a87-af9b-029e2467d302/f0e64906-e7e0-4a87-af9b-029e2467d302.png';

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);
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
    <div className="min-h-[100dvh] w-full bg-[#020617] flex flex-col items-center justify-center overflow-hidden font-cairo select-none">
      {/* شاشة الترحيب (Splash) */}
      <AnimatePresence>
        {showSplash && (
          <motion.div 
            initial={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-[100] bg-[#020617] flex flex-col items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              className="relative"
            >
              <div className="w-32 h-32 md:w-44 md:h-44 bg-gradient-to-br from-amber-400 to-orange-500 rounded-[2.5rem] overflow-hidden shadow-[0_0_40px_rgba(245,158,11,0.2)] border-4 border-white/10 flex items-center justify-center p-1">
                <img src={LOGO} className="w-full h-full object-cover rounded-[2.2rem]" alt="Splash Logo" />
              </div>
              <motion.div 
                animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.3, 0.1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 bg-amber-500 rounded-full blur-[40px] -z-10"
              />
            </motion.div>
            <motion.h1 
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-6 text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600"
            >
              فـيـفـو لايف
            </motion.h1>
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: 100 }}
              className="h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent mt-3 rounded-full"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* نموذج تسجيل الدخول */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: showSplash ? 0 : 1, y: showSplash ? 20 : 0 }} 
        className="w-full max-w-[360px] px-6 flex flex-col items-center justify-center h-full overflow-y-auto scrollbar-hide py-4"
      >
        <div className="text-center mb-4 w-full shrink-0">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-[1.8rem] mx-auto mb-2 overflow-hidden shadow-xl border-2 border-white/10 p-0.5"
          >
            <img src={LOGO} className="w-full h-full object-cover rounded-[1.6rem]" alt="Auth Logo" />
          </motion.div>
          <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600">فـيـفـو لايف</h1>
          <p className="text-slate-500 text-[9px] font-black mt-1 tracking-[2px] uppercase">Official Live App</p>
        </div>

        <div className="w-full bg-slate-900/60 backdrop-blur-2xl border border-white/5 rounded-[2rem] p-5 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 blur-2xl -z-10 rounded-full" />
          
          <div className="flex bg-black/40 p-1 rounded-xl mb-5 border border-white/5">
            <button 
              onClick={() => setIsLogin(true)} 
              className={`flex-1 py-2.5 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-2 ${isLogin ? 'bg-amber-500 text-black shadow-lg' : 'text-slate-500'}`}
            >
              <LogIn size={14} /> دخول
            </button>
            <button 
              onClick={() => setIsLogin(false)} 
              className={`flex-1 py-2.5 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-2 ${!isLogin ? 'bg-amber-500 text-black shadow-lg' : 'text-slate-500'}`}
            >
              <UserPlus size={14} /> تسجيل
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-3">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }} 
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="space-y-1 overflow-hidden"
                >
                  <label className="text-[9px] font-black text-slate-500 pr-1 uppercase">الاسم المستعار</label>
                  <div className="relative">
                    <User className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input 
                      type="text" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                      className="w-full bg-black/40 border border-white/5 rounded-xl py-3 pr-10 text-white text-xs outline-none focus:border-amber-500/30 transition-all text-right" 
                      placeholder="أدخل اسمك" 
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-500 pr-1 uppercase">البريد الإلكتروني</label>
              <div className="relative">
                <Mail className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  className="w-full bg-black/40 border border-white/5 rounded-xl py-3 pr-10 text-white text-xs outline-none focus:border-amber-500/30 transition-all text-right" 
                  placeholder="name@email.com" 
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-500 pr-1 uppercase">كلمة المرور</label>
              <div className="relative">
                <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  className="w-full bg-black/40 border border-white/5 rounded-xl py-3 pr-10 text-white text-xs outline-none focus:border-amber-500/30 transition-all text-right" 
                  placeholder="••••••••" 
                />
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
                className="bg-red-500/10 border border-red-500/20 p-2 rounded-lg text-red-400 text-[10px] font-bold text-center"
              >
                {error}
              </motion.div>
            )}

            <button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-gradient-to-r from-amber-500 to-orange-600 py-3.5 rounded-xl text-black font-black text-xs shadow-lg shadow-amber-900/10 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-4 group"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Zap size={16} className="group-hover:animate-pulse" fill="currentColor" /> 
                  {isLogin ? 'تسجيل الدخول' : 'بدء الاستخدام'}
                </>
              )}
            </button>
          </form>
          
          <div className="mt-6 pt-4 border-t border-white/5 text-center">
            <p className="text-[8px] text-slate-600 font-bold uppercase tracking-[3px]">VIVO NETWORK SYSTEM</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthScreen;
