import { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Trash2, 
  BarChart3, 
  ShieldAlert, 
  Search, 
  UserCircle,
  TrendingUp,
  Mail,
  Bell,
  Fingerprint,
  FileText,
  Eye,
  CheckCircle,
  Clock,
  Download,
  XCircle
} from 'lucide-react';
import { motion } from 'motion/react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip
} from 'recharts';

const UserTable = ({ users, title, onDelete, onStatusToggle, onClassChange }) => (
  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col overflow-hidden mb-8">
    <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
      <h3 className="text-lg font-bold text-white tracking-tight">{title}</h3>
      <span className="text-[10px] font-black bg-zinc-800 px-3 py-1 rounded-full text-zinc-400">
        {users.length} RECORDS
      </span>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-zinc-800 text-[10px] uppercase tracking-widest text-zinc-500">
            <th className="px-6 py-4">User</th>
            <th className="px-6 py-4">Credential</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4">Class</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800">
          {users.map((u, i) => (
            <tr key={i} className="hover:bg-zinc-800/40 transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 font-bold text-xs ring-1 ring-zinc-700">
                    {u.name[0]}
                  </div>
                  <div>
                    <div className="text-white font-medium text-sm">{u.name}</div>
                    <div className="text-zinc-500 text-xs">{u.email}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-[10px] font-mono text-blue-400 bg-blue-400/5 px-2 py-1 rounded border border-blue-400/10 w-fit">
                  {u.password || '••••••••'}
                </div>
              </td>
              <td className="px-6 py-4">
                <button 
                  onClick={() => onStatusToggle(u)}
                  className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter transition-all ${
                    u.status === 'active' 
                      ? 'bg-green-500/10 text-green-500 border border-green-500/20' 
                      : 'bg-red-500/10 text-red-500 border border-red-500/20'
                  }`}
                >
                  {u.status || 'active'}
                </button>
              </td>
              <td className="px-6 py-4">
                <input 
                  type="text"
                  value={u.classId || ''}
                  onChange={(e) => onClassChange(u, e.target.value)}
                  placeholder="Class"
                  className="bg-transparent border-b border-zinc-800 text-xs text-zinc-400 focus:border-blue-500 outline-none w-16"
                />
              </td>
              <td className="px-6 py-4 text-right">
                <button 
                  onClick={() => onDelete(u.uid)}
                  className="p-2 text-zinc-500 hover:text-red-400 transition-colors hover:bg-zinc-800 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default function AdminPanel({ view = 'it', onLogout }) {
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [activeTab, setActiveTab] = useState(view === 'it' ? 'users' : 'reports');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [isDeploying, setIsDeploying] = useState(false);
  const [notification, setNotification] = useState({ type: null, message: null });

  const [newUser, setNewUser] = useState({ 
    name: '', 
    email: '', 
    password: '',
    role: 'student',
    classId: '',
    uid: '' 
  });

  const fetchData = async () => {
    let allUsers;
    let allReports;
    const mockUsers = [
      { uid: 'sim_admin_0', name: 'Mugisha Atwine', email: '001@nextgen.ac.com', password: 'Admin826', role: 'admin', status: 'active', createdAt: new Date().toISOString() },
      { uid: 'sim_admin_1', name: 'Aainembabazi Daphine', email: 'daphineainembabazi50@gmail.com', password: 'Auth9123', role: 'admin', status: 'active', createdAt: new Date().toISOString() },
      { uid: 'sim_it', name: 'Okello Solomon', email: '999@nextgen.ac.com', password: 'Supp9123', role: 'it_admin', status: 'active', createdAt: new Date().toISOString() },
      { uid: 'sim_t1', name: 'Namubiru Sarah', email: '2001@nextgen.ac.com', password: 'Teac9456', role: 'teacher', status: 'active', classId: 'S4', createdAt: new Date().toISOString() },
      { uid: 'sim_s1', name: 'Ahumuza Kyomugisha', email: '5001@nextgen.ac.com', password: 'Stud9789', role: 'student', status: 'active', classId: 'S1', createdAt: new Date().toISOString() },
    ];

    try {
      // 1. Fetch Users strictly via MySQL API
      const userRes = await fetch('/api/users');
      if (userRes.ok) {
        allUsers = await userRes.json();
      } else {
        allUsers = mockUsers;
      }

      // Merge with mock if empty
      if (allUsers.length === 0) allUsers = mockUsers;

      // 2. Fetch Reports via MySQL API
      const reportRes = await fetch('/api/reports');
      if (reportRes.ok) {
        allReports = await reportRes.json();
      }
      
    } catch (err) {
      console.warn("MySQL connection issue, providing mocks:", err);
      allUsers = mockUsers;
    } finally {
      setUsers(allUsers);
      setReports(allReports);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddUser = async (e) => {
    e.preventDefault();
    
    const trimmedName = newUser.name.trim();
    const trimmedEmail = newUser.email.trim().toLowerCase();
    const trimmedPassword = newUser.password.trim();

    if (!trimmedName || !trimmedEmail || !trimmedPassword || !newUser.role) {
      setNotification({ type: 'error', message: "ERROR: All fields (Name, Email, Password, Role) must be filled." });
      return;
    }

    if ((newUser.role === 'student' || newUser.role === 'teacher') && !newUser.classId) {
      setNotification({ type: 'error', message: `ERROR: A class must be assigned for ${newUser.role} profiles.` });
      return;
    }

    if (!trimmedEmail.endsWith('@nextgen.ac.com')) {
      setNotification({ type: 'error', message: "SECURITY POLICY: Only institutional emails (@nextgen.ac.com) are permitted." });
      return;
    }

    if (trimmedPassword.length !== 8) {
      setNotification({ type: 'error', message: "SECURITY POLICY: Access Passwords must be exactly 8 characters long." });
      return;
    }

    const emailPrefix = trimmedEmail.split('@')[0];
    const isNumeric = /^\d+$/.test(emailPrefix);
    
    if (!isNumeric) {
      setNotification({ type: 'error', message: "SECURITY POLICY: Emails must use a Numeric Identifier (e.g., 2001@nextgen.ac.com)." });
      return;
    }

    setIsDeploying(true);
    try {
      const uid = `sim_${Math.random().toString(36).substr(2, 9)}`;
      
      const userToEnroll = {
        ...newUser,
        name: trimmedName,
        email: trimmedEmail,
        password: trimmedPassword,
        uid,
        status: 'active',
        createdAt: new Date().toISOString()
      };

      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userToEnroll)
      });

      if (!res.ok) throw new Error("MySQL Save Failed");
      
      setNotification({ type: 'success', message: `PROFILE ENROLLED: User "${newUser.name}" saved to MySQL.` });
      setTimeout(() => setNotification({ type: null, message: null }), 6000);
      
      setNewUser({ name: '', email: '', password: '', role: 'student', classId: '', uid: '' });
      await fetchData();
    } catch (err) {
      console.error("Failed to deploy profile:", err);
      setNotification({ type: 'error', message: "PROFILE UPLOAD FAILED: Local MySQL connection refused." });
    } finally {
      setIsDeploying(false);
    }
  };

  const handleDeleteUser = async (uid) => {
    if (!window.confirm("Are you sure you want to remove this user?")) return;
    try {
      const res = await fetch(`/api/users/${uid}`, { method: 'DELETE' });
      if (!res.ok) throw new Error("Delete failed");
      
      setNotification({ type: 'success', message: "USER REMOVED: Profile purged from MySQL registry." });
      setTimeout(() => setNotification({ type: null, message: null }), 4000);
      fetchData();
    } catch (err) {
      console.error("Delete error:", err);
      setNotification({ type: 'error', message: "DELETE FAILED: Could not reachable MySQL server." });
    }
  };

  const onStatusToggle = async (u) => {
    const newStatus = u.status === 'active' ? 'inactive' : 'active';
    try {
      await fetch(`/api/users/${u.uid}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      fetchData();
    } catch (err) { console.error(err); }
  };

  const onClassChange = async (u, newClass) => {
    try {
      await fetch(`/api/users/${u.uid}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ classId: newClass })
      });
      fetchData();
    } catch (err) { console.error(err); }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const chartData = [
    { name: 'Mon', students: 85, teachers: 95 },
    { name: 'Tue', students: 88, teachers: 92 },
    { name: 'Wed', students: 92, teachers: 98 },
    { name: 'Thu', students: 78, teachers: 90 },
    { name: 'Fri', students: 90, teachers: 96 },
  ];

  const teachers = filteredUsers.filter(u => u.role === 'teacher');
  const students = filteredUsers.filter(u => u.role === 'student');
  const admins = filteredUsers.filter(u => u.role === 'admin' || u.role === 'it_admin');

  return (
    <div className="flex-1 overflow-hidden flex flex-col bg-zinc-950 font-sans">
      <div className="border-b border-zinc-800 bg-zinc-900/50 p-4 md:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {view === 'it' ? 'IT Infrastructure HUB' : 'Executive Command Center'}
          </h1>
          <p className="text-zinc-500 text-sm">
            {view === 'it' ? 'Credentials & System Lifecycle' : 'Big Picture & Institutional Intelligence'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 md:gap-4">
          {view === 'it' ? (
            <>
              <button 
                onClick={() => setActiveTab('users')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${activeTab === 'users' ? 'bg-zinc-800 text-white border border-zinc-700' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                <Users className="w-4 h-4" /> Personnel Credentials
              </button>
              <button 
                onClick={() => setActiveTab('system')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${activeTab === 'system' ? 'bg-zinc-800 text-white border border-zinc-700' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                <ShieldAlert className="w-4 h-4" /> System Health
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={() => setActiveTab('reports')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${activeTab === 'reports' ? 'bg-zinc-800 text-white border border-zinc-700' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                <BarChart3 className="w-4 h-4" /> Strategic Intelligence
              </button>
              <button 
                onClick={() => setActiveTab('submissions')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${activeTab === 'submissions' ? 'bg-zinc-800 text-white border border-zinc-700' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                <FileText className="w-4 h-4" /> Faculty Reports
              </button>
            </>
          )}

          <button 
            onClick={onLogout}
            className="ml-2 px-4 py-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-lg border border-red-500/20 transition-all flex items-center gap-2 text-xs font-black uppercase tracking-widest shadow-lg shadow-red-500/10"
          >
            <XCircle className="w-4 h-4" /> Exit System
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8">
        {notification.message && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-2xl border flex items-center justify-between shadow-xl ${
              notification.type === 'success' 
                ? 'bg-green-500/10 border-green-500/20 text-green-500' 
                : 'bg-red-500/10 border-red-500/20 text-red-500'
            }`}
          >
            <div className="flex items-center gap-3">
              {notification.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
              <span className="text-sm font-bold tracking-tight">{notification.message}</span>
            </div>
            <button onClick={() => setNotification({ type: null, message: null })} className="p-1 hover:bg-white/5 rounded-full transition-colors">
              <XCircle className="w-4 h-4 opacity-50 hover:opacity-100" />
            </button>
          </motion.div>
        )}

        {activeTab === 'users' ? (
          <>
            <div className="flex items-center gap-3 p-4 bg-orange-500/5 border border-orange-500/10 rounded-2xl mb-8">
              <ShieldAlert className="w-5 h-5 text-orange-500" />
              <p className="text-[10px] uppercase font-black tracking-widest text-orange-500">
                IT PROTOCOL: Credential assignment and account lifecycle management active.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Total Users', val: users.length, icon: Users, color: 'text-blue-400' },
                { label: 'Teachers', val: users.filter(u => u.role === 'teacher').length, icon: UserCircle, color: 'text-purple-400' },
                { label: 'Students', val: users.filter(u => u.role === 'student').length, icon: UserCircle, color: 'text-green-400' },
                { label: 'Admins', val: users.filter(u => u.role === 'admin').length, icon: ShieldAlert, color: 'text-red-400' },
              ].map((s, i) => (
                <div key={i} className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-2 bg-zinc-800 rounded-lg ${s.color}`}>
                      <s.icon className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-white">{s.val}</div>
                  <div className="text-zinc-500 text-xs uppercase tracking-wider mt-1">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-blue-400" /> Enroll User
                </h3>
                <form onSubmit={handleAddUser} className="space-y-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest mb-1 block">Full Name</label>
                    <input 
                      type="text" 
                      value={newUser.name}
                      onChange={e => setNewUser({...newUser, name: e.target.value})}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-blue-500" 
                      placeholder="e.g. Okello Solomon"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest mb-1 block">Email Address</label>
                    <input 
                      type="email" 
                      value={newUser.email}
                      onChange={e => setNewUser({...newUser, email: e.target.value})}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-blue-500" 
                      placeholder="e.g. 1001@nextgen.ac.com"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest mb-1 block">Assigned Password</label>
                    <input 
                      type="text" 
                      value={newUser.password}
                      onChange={e => setNewUser({...newUser, password: e.target.value})}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono" 
                      placeholder="Initial Access Key"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest mb-1 block">System Role</label>
                    <select 
                      value={newUser.role}
                      onChange={e => setNewUser({...newUser, role: e.target.value})}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none"
                    >
                      <option value="student">Student</option>
                      <option value="teacher">Teacher</option>
                      <option value="it_admin">IT Administrator</option>
                      <option value="admin">Super Administrator</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest mb-1 block">Assigned Class</label>
                    <select 
                      value={newUser.classId}
                      onChange={e => setNewUser({...newUser, classId: e.target.value})}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none"
                    >
                      <option value="">Select Class</option>
                      {['S1', 'S2', 'S3', 'S4', 'S5', 'S6'].map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <button 
                    type="submit"
                    disabled={isDeploying}
                    className={`w-full flex items-center justify-center gap-2 font-bold py-4 rounded-xl transition-all shadow-lg ${
                      isDeploying 
                        ? 'bg-blue-600/50 cursor-not-allowed text-white/50' 
                        : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20'
                    }`}
                  >
                    {isDeploying ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        Syncing Profile...
                      </>
                    ) : (
                      <>
                        <Fingerprint className="w-5 h-5" />
                        Deploy Profile
                      </>
                    )}
                  </button>
                </form>
              </div>

              <div className="lg:col-span-2 space-y-8">
                <div className="relative mb-6">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input 
                    type="text" 
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder="Search Personnel Registry..."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <UserTable users={admins} title="Administrative & IT Personnel" onDelete={handleDeleteUser} onStatusToggle={onStatusToggle} onClassChange={onClassChange} />
                <UserTable users={teachers} title="Teaching Faculty" onDelete={handleDeleteUser} onStatusToggle={onStatusToggle} onClassChange={onClassChange} />
                <UserTable users={students} title="Student Body" onDelete={handleDeleteUser} onStatusToggle={onStatusToggle} onClassChange={onClassChange} />
              </div>
            </div>
          </>
        ) : activeTab === 'system' ? (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'DB Uptime', val: '99.9%', icon: Clock, color: 'text-green-500' },
                { label: 'API Latency', val: '24ms', icon: TrendingUp, color: 'text-blue-500' },
                { label: 'Security Level', val: 'HIGH', icon: ShieldAlert, color: 'text-red-500' }
              ].map((m, i) => (
                <div key={i} className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
                  <div className="flex justify-between items-center mb-4">
                    <m.icon className={`w-5 h-5 ${m.color}`} />
                  </div>
                  <div className="text-2xl font-bold text-white tracking-widest">{m.val}</div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mt-2">{m.label}</div>
                </div>
              ))}
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
              <h3 className="text-lg font-bold text-white mb-6">Ops Log</h3>
              <div className="space-y-4 font-mono text-[10px]">
                {[
                  { time: '15:10:04', event: 'CREDENTIAL: IT Admin assigned password to 2005@nextgen.ac.com', status: 'OK' },
                  { time: '14:22:04', event: 'RELOAD: Credentials whitelist synced with Firestore.', status: 'OK' },
                  { time: '12:05:11', event: 'CLEANUP: Removed 3 abandoned verification tokens.', status: 'OK' },
                ].map((log, i) => (
                  <div key={i} className="flex gap-4 p-3 bg-zinc-950 rounded-lg border border-zinc-900">
                    <span className="text-zinc-600">{log.time}</span>
                    <span className="text-zinc-400 flex-1">{log.event}</span>
                    <span className={log.status === 'OK' ? 'text-green-500' : 'text-blue-500'}>{log.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : activeTab === 'submissions' ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden">
             <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
                <div className="p-8 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
                   <div>
                      <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-3">
                         <FileText className="w-6 h-6 text-blue-400" /> Faculty Administrative Reports
                      </h3>
                      <p className="text-zinc-500 text-sm mt-1">Reviewing official documentation submitted by teaching staff</p>
                   </div>
                </div>

                <div className="divide-y divide-zinc-800 flex flex-col">
                   {reports.length === 0 ? (
                     <div className="p-20 text-center text-zinc-600 italic">No reports have been submitted for review.</div>
                   ) : (
                     reports.map((report) => (
                       <div key={report.id} className="p-6 hover:bg-zinc-800/30 transition-all group">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                             <div className="flex items-start gap-5">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${
                                  report.type === 'pdf' ? 'bg-red-500/10 text-red-400' : 'bg-blue-500/10 text-blue-400'
                                }`}>
                                   {report.type === 'pdf' ? <FileText className="w-6 h-6" /> : <Mail className="w-6 h-6" />}
                                </div>
                                <div>
                                   <h4 className="text-lg font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">{report.title}</h4>
                                   <div className="flex items-center gap-3 text-[10px] uppercase font-bold tracking-widest text-zinc-500">
                                      <span className="text-zinc-300">By {report.authorName}</span>
                                      <span className="w-1 h-1 rounded-full bg-zinc-800" />
                                      <span>{report.timestamp?.toDate ? new Date(report.timestamp.toDate()).toLocaleDateString() : 'Today'}</span>
                                      <span className="w-1 h-1 rounded-full bg-zinc-800" />
                                      <span className={report.status === 'pending' ? 'text-yellow-500' : 'text-green-500'}>{report.status}</span>
                                   </div>
                                </div>
                             </div>

                             <div className="flex items-center gap-3 whitespace-nowrap">
                                {report.type === 'pdf' ? (
                                  <div className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-xs font-bold text-zinc-400 flex items-center gap-2">
                                     <Download className="w-3 h-3" /> {report.fileName}
                                  </div>
                                ) : (
                                  <button 
                                    onClick={() => setSelectedReport(report)}
                                    className="px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold rounded-xl transition-all border border-zinc-700 flex items-center gap-2"
                                  >
                                    <Eye className="w-4 h-4" /> Read Document
                                  </button>
                                )}
                                <button 
                                  onClick={async () => {
                                    await fetch(`/api/reports/${report.id}/status`, {
                                      method: 'PATCH',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ status: 'reviewed' })
                                    });
                                    fetchData();
                                  }}
                                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2"
                                >
                                  <CheckCircle className="w-4 h-4" /> Mark Reviewed
                                </button>
                             </div>
                          </div>

                          {selectedReport?.id === report.id && (
                            <motion.div 
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              className="mt-6 p-8 bg-zinc-950 rounded-3xl border border-zinc-800 text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap font-sans"
                            >
                               <div className="flex justify-between items-start mb-6">
                                 <div className="text-[10px] uppercase font-black tracking-[0.2em] text-blue-500">Document Transmission Output</div>
                                 <button onClick={() => setSelectedReport(null)} className="text-zinc-600 hover:text-white transition-colors">
                                   <XCircle className="w-5 h-5" />
                                 </button>
                               </div>
                               {report.content}
                            </motion.div>
                          )}
                       </div>
                     ))
                   )}
                </div>
             </div>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-400" /> Attendance Trends
                  </h3>
                  <div className="text-xs text-zinc-500 uppercase tracking-widest font-bold">Past 5 Days</div>
                </div>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                      <XAxis dataKey="name" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: '12px' }}
                        itemStyle={{ fontSize: '12px' }}
                      />
                      <Area type="monotone" dataKey="students" stroke="#3b82f6" fillOpacity={1} fill="url(#colorStudents)" strokeWidth={2} />
                      <Area type="monotone" dataKey="teachers" stroke="#a855f7" fillOpacity={0} strokeWidth={2} strokeDasharray="5 5" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex flex-col">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-yellow-400" /> AI Insights & School Performance
                </h3>
                <div className="flex-1 space-y-4">
                  <div className="bg-zinc-800/50 p-4 rounded-xl border border-zinc-700 italic text-zinc-300 text-sm leading-relaxed">
                    &quot;Weekly attendance rates are steady at 89%. Noticeable drop in Student attendance on Thursday (78%). Teacher engagement remains high. Recommendation: Investigate transportation issues affecting students on late weekdays.&quot;
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-zinc-800/30 rounded-xl border border-zinc-700/50">
                       <div className="flex items-center gap-3">
                         <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg"><TrendingUp className="w-4 h-4" /></div>
                         <div className="text-sm font-medium text-white">Engagement Up 4%</div>
                       </div>
                       <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Calculated Today</div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-zinc-800/30 rounded-xl border border-zinc-700/50">
                       <div className="flex items-center gap-3">
                         <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg"><Users className="w-4 h-4" /></div>
                         <div className="text-sm font-medium text-white">Punctuality Score: 9.2</div>
                       </div>
                       <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">High Performance</div>
                    </div>
                  </div>
                </div>
                <button className="w-full mt-6 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-bold py-3 rounded-xl transition-all border border-zinc-700">
                  Generate Analytical Audit
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
