import { useState, useEffect } from 'react';
import { 
  LogOut, 
  School, 
  LayoutDashboard, 
  CalendarCheck, 
  ShieldCheck, 
  X,
  Loader2,
  Mail,
  Lock,
  ArrowRight,
  Menu
} from 'lucide-react';
import AttendanceTracker from './components/AttendanceTracker';
import AdminPanel from './components/AdminPanel';
import TeacherDashboard from './components/TeacherDashboard';
import StudentDashboard from './components/StudentDashboard';
import BackgroundSlideshow from './components/BackgroundSlideshow';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState(null);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [currentAuthView, setCurrentAuthView] = useState('home');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('edutrack_session');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('edutrack_session');
      }
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('edutrack_session');
    setUser(null);
    setActiveTab('dashboard');
  };

  const handleEmailAuth = async () => {
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      setLoginError("Please provide both email and password.");
      return;
    }

    setIsLoggingIn(true);
    setLoginError(null);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail, password: trimmedPassword })
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        localStorage.setItem('edutrack_session', JSON.stringify(data.user));
      } else {
        setLoginError(data.error || "INVALID CREDENTIALS: Identification failed.");
      }
    } catch (err) {
      console.error("Login request failed:", err);
      setLoginError("COMMUNICATION ERROR: Could not reach the security database. Check your connection.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (loading && !user) {
    return (
      <div className="h-screen w-full bg-zinc-950 flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-2xl animate-pulse">
            <School className="text-black w-7 h-7" />
          </div>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-[0.3em] animate-pulse">Initializing Portal...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    if (currentAuthView === 'home') {
      return (
        <div className="h-screen w-full bg-zinc-950 flex flex-col items-center justify-center p-6 overflow-hidden relative">
          <BackgroundSlideshow />
          <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 via-transparent to-transparent pointer-events-none" />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-4xl w-full text-center space-y-12 relative z-10"
          >
            <div className="flex flex-col items-center gap-6">
              <motion.div 
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="w-20 h-20 bg-white rounded-[2.5rem] flex items-center justify-center shadow-[0_0_50px_rgba(255,255,255,0.1)]"
              >
                <School className="text-black w-10 h-10" />
              </motion.div>
              <div className="space-y-2">
                <h1 className="text-6xl md:text-8xl font-bold text-white tracking-tighter italic leading-none">
                  EDUTRACK<span className="text-zinc-500 font-light not-italic">PRO</span>
                </h1>
                <p className="text-zinc-500 text-sm md:text-base font-bold uppercase tracking-[0.4em]">
                  Next-Gen Secondary School Infrastructure
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-center gap-6">
              <button 
                onClick={() => { setCurrentAuthView('login'); }}
                className="group relative px-10 py-5 bg-white text-black font-bold rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-[0_20px_50px_rgba(255,255,255,0.1)] flex items-center gap-3 overflow-hidden"
              >
                <div className="absolute inset-0 bg-zinc-200 translate-y-full group-hover:translate-y-0 transition-transform" />
                <span className="relative z-10 flex items-center gap-3 text-xs uppercase tracking-widest font-black">
                  <ShieldCheck className="w-5 h-5" />
                  PROCEED TO SIGN IN
                </span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 pt-12 text-left opacity-50 hover:opacity-100 transition-opacity">
               {[
                 { label: 'Biometrics', desc: 'Secure fingerprint-linked attendance logs.' },
                 { label: 'Real-Time', desc: 'Instant roll call sync for faculty & parents.' },
                 { label: 'Analytics', desc: 'Performance insights generated automatically.' }
               ].map((f, i) => (
                 <div key={i} className="space-y-2">
                   <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{f.label}</div>
                   <p className="text-xs text-zinc-600 leading-relaxed">{f.desc}</p>
                 </div>
               ))}
            </div>
          </motion.div>

          <footer className="absolute bottom-8 left-0 w-full text-center">
            <p className="text-[10px] text-zinc-700 font-bold uppercase tracking-[0.5em]">
              Authorized Use Only • Sector 001 Digital Node
            </p>
          </footer>
        </div>
      );
    }

    return (
      <div className="h-screen w-full bg-zinc-950 flex items-center justify-center p-6 overflow-y-auto relative">
        <BackgroundSlideshow />
        <button 
          onClick={() => setCurrentAuthView('home')}
          className="absolute top-8 left-8 p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-500 hover:text-white transition-colors group flex items-center gap-2 text-xs font-bold uppercase tracking-widest"
        >
          <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
          Return to Hub
        </button>
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent pointer-events-none" />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full"
        >
          <div className="flex flex-col items-center gap-4 mb-10">
            <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center shadow-2xl">
              <School className="text-black w-8 h-8" />
            </div>
            <div className="text-center">
              <h1 className="text-3xl font-bold text-white tracking-tighter">EDUTRACK PRO</h1>
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">Institutional Access Gate</p>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-[60px]" />
            
            <div className="text-center mb-8">
              <h2 className="text-xl font-bold text-white tracking-widest uppercase mb-1">Credentials Access</h2>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em]">Restricted to IT-Assigned Personnel Only</p>
            </div>

            <div className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input 
                    type="email" 
                    placeholder="Institutional Email (e.g. 1001@nextgen.ac.com)"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-zinc-800/50 border border-zinc-700 rounded-2xl pl-12 pr-4 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Secure Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-zinc-800/50 border border-zinc-700 rounded-2xl pl-12 pr-4 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div className="flex items-center gap-2 px-2">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input 
                      type="radio" 
                      onClick={() => setShowPassword(!showPassword)}
                      checked={showPassword}
                      readOnly
                      className="w-4 h-4 appearance-none rounded-full border border-zinc-700 bg-zinc-800 checked:bg-blue-500 checked:border-blue-400 transition-all cursor-pointer relative after:content-[''] after:absolute after:inset-1 after:rounded-full after:bg-white after:opacity-0 checked:after:opacity-100" 
                    />
                    <span className="text-[10px] text-zinc-500 group-hover:text-zinc-300 font-black uppercase tracking-widest transition-colors">
                      Show password
                    </span>
                  </label>
                </div>

                <button 
                  onClick={handleEmailAuth}
                  disabled={isLoggingIn}
                  className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 text-sm border border-zinc-700 disabled:opacity-50"
                >
                  {isLoggingIn ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      Authorize Access
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-zinc-800" /></div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold text-zinc-600 px-2 bg-zinc-900 mx-auto w-fit">
                Institutional Node
              </div>
            </div>

            {loginError && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 rounded-2xl bg-red-400/10 border border-red-400/20 space-y-3"
              >
                <p className="text-red-400 text-[10px] leading-relaxed text-center font-black uppercase tracking-widest ">
                  {loginError}
                </p>
              </motion.div>
            )}
          </div>

          <p className="mt-8 text-[10px] text-zinc-600 text-center uppercase tracking-[0.2em] font-bold">
            001 Secondary School • Secure Protocol v4.2
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex bg-zinc-950 text-white overflow-hidden">
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg">
          {isSidebarOpen ? <X /> : <Menu />}
        </button>
      </div>

      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside className={`
        fixed lg:relative z-40 h-full w-72 bg-zinc-900 border-r border-zinc-800 p-8 flex flex-col transition-transform duration-300
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex items-center gap-3 mb-10">
          <div className="p-2 bg-white rounded-lg"><School className="w-5 h-5 text-black" /></div>
          <span className="font-bold text-lg tracking-tight">EduTrack</span>
        </div>

        <nav className="flex-1 space-y-2">
          {[
            { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
            { id: 'attendance', label: 'Record Attendance', icon: CalendarCheck },
            user.role === 'admin' ? { id: 'admin', label: 'Institutional Admin', icon: ShieldCheck } : null,
            user.role === 'it_admin' ? { id: 'it_admin', label: 'IT Infrastructure', icon: Lock } : null,
          ].filter(Boolean).map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === item.id ? 'bg-zinc-800 text-white shadow-inner' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <item.icon className={`w-4 h-4 ${activeTab === item.id ? 'text-white' : 'text-zinc-600'}`} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto space-y-4 pt-6 border-t border-zinc-800">
           <div className="flex items-center gap-3 px-2">
              <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold ring-2 ring-zinc-800 ring-offset-2 ring-offset-zinc-950">
                {user.name?.[0] || '?'}
              </div>
              <div className="overflow-hidden">
                <div className="text-sm font-bold truncate">{user.name}</div>
                <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">{user.role}</div>
              </div>
           </div>
           <button 
             onClick={handleLogout}
             className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 rounded-xl transition-all text-xs font-bold uppercase tracking-widest shadow-lg shadow-red-500/10"
           >
             <LogOut className="w-4 h-4" /> Secure Exit Protocol
           </button>
        </div>
      </aside>

      <main className="flex-1 overflow-hidden relative flex flex-col">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <div className="flex-1 overflow-hidden flex flex-col">
              {user.role === 'admin' ? (
                <AdminPanel user={user} view="institutions" onLogout={handleLogout} />
              ) : user.role === 'it_admin' ? (
                <AdminPanel user={user} view="it" onLogout={handleLogout} />
              ) : user.role === 'teacher' ? (
                <TeacherDashboard user={user} onLogout={handleLogout} />
              ) : (
                <StudentDashboard user={user} onLogout={handleLogout} />
              )}
            </div>
          )}

          {activeTab === 'attendance' && (
            <motion.div 
              key="attendance"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="flex-1 flex items-center justify-center p-8 bg-[radial-gradient(circle_at_center,#111111,transparent)]"
            >
              <AttendanceTracker user={user} />
            </motion.div>
          )}

          {activeTab === 'admin' && user.role === 'admin' && (
            <motion.div 
              key="admin"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 flex flex-col overflow-hidden"
            >
              <AdminPanel user={user} view="institutions" onLogout={handleLogout} />
            </motion.div>
          )}

          {activeTab === 'it_admin' && user.role === 'it_admin' && (
            <motion.div 
              key="it_admin"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="flex-1 flex flex-col overflow-hidden"
            >
              <AdminPanel user={user} view="it" onLogout={handleLogout} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
