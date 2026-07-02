import { useState, useEffect, useCallback } from 'react';
import { 
  Calendar, 
  MapPin, 
  CheckCircle2, 
  XCircle, 
  Fingerprint,
  TrendingUp,
  Award
} from 'lucide-react';
import AttendanceTracker from './AttendanceTracker';

export default function StudentDashboard({ user, onLogout }) {
  const [logs, setLogs] = useState([]);

  const fetchMyLogs = useCallback(async () => {
    try {
      const res = await fetch(`/api/attendance?userId=${user.uid}`);
      if (res.ok) {
        setLogs(await res.json());
      }
    } catch (err) {
      console.warn("Failed to fetch student logs from MySQL:", err);
    }
  }, [user.uid]);

  useEffect(() => {
    if (user?.uid) {
      fetchMyLogs();
    }
  }, [user.uid, fetchMyLogs]);

  const presentCount = logs.filter(l => l.status === 'present').length;
  const attendanceRate = logs.length > 0 ? (presentCount / logs.length) * 100 : 0;

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-zinc-950 text-white">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Student Portal</h1>
            <p className="text-zinc-500">Welcome, {user.name} • Class: {user.classId || 'Not Assigned'}</p>
          </div>
          <div className="flex items-center gap-6 w-full md:w-auto justify-between">
            <div className="text-right">
                <div className="text-xs uppercase font-bold text-zinc-500 tracking-widest mb-1">Attendance Rate</div>
                <div className="text-2xl font-bold text-green-400">{attendanceRate.toFixed(1)}%</div>
            </div>
            <button 
              onClick={onLogout}
              className="px-6 py-2.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl border border-red-500/20 transition-all flex items-center gap-2 text-xs font-black uppercase tracking-widest shadow-lg shadow-red-500/10"
            >
              <XCircle className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-4 flex items-center gap-2">
              <Fingerprint className="w-4 h-4" /> Identity Verification
            </h3>
            <AttendanceTracker user={user} />
            
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl">
               <div className="flex items-center gap-4 mb-4">
                 <div className="p-3 bg-blue-500/10 rounded-2xl">
                    <Award className="w-6 h-6 text-blue-400" />
                 </div>
                 <div>
                   <div className="text-sm font-bold">Good Standing</div>
                   <div className="text-xs text-zinc-500">Keep up the consistency!</div>
                 </div>
               </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-8">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl">
                   <h4 className="text-xs font-bold uppercase text-zinc-500 mb-6 flex items-center gap-2">
                     <TrendingUp className="w-4 h-4 text-zinc-500" /> Performance Overview
                   </h4>
                   <div className="space-y-4">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-zinc-400">Total Records</span>
                        <span className="font-bold">{logs.length}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-zinc-400">Present</span>
                        <span className="font-bold text-green-400">{presentCount}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-zinc-400">Late / Absent</span>
                        <span className="font-bold text-red-400">{logs.length - presentCount}</span>
                      </div>
                   </div>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl flex items-center justify-center">
                  <div className="text-center">
                     <div className="text-zinc-700 font-mono text-xs uppercase mb-2">GPS Verification</div>
                     <div className="flex items-center gap-2 text-green-500 font-bold">
                       <CheckCircle2 className="w-4 h-4" /> Secure Handshake Active
                     </div>
                  </div>
                </div>
             </div>

             <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">
                <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
                  <h4 className="text-lg font-bold text-white tracking-tight">Attendance Timeline</h4>
                  <Calendar className="w-4 h-4 text-zinc-500" />
                </div>
                <div className="max-h-[400px] overflow-y-auto divide-y divide-zinc-800/50">
                  {logs.map((log, i) => (
                    <div key={i} className="p-6 flex items-center justify-between hover:bg-zinc-800/30 transition-colors">
                      <div className="flex items-center gap-4">
                         <div className={`w-2 h-2 rounded-full ${
                           log.status === 'present' ? 'bg-green-500' :
                           log.status === 'late' ? 'bg-yellow-500' : 'bg-red-500'
                         }`} />
                         <div>
                            <div className="text-sm font-bold text-white capitalize flex items-center gap-2">
                               {log.status}
                               {log.subject && (
                                 <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-1.5 py-0.5 rounded uppercase font-bold tracking-tighter">
                                   {log.subject}
                                 </span>
                               )}
                            </div>
                            <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">{log.date}</div>
                         </div>
                      </div>
                      <div className="text-right">
                         <div className="text-xs text-zinc-400">
                           {log.timestamp?.toDate ? log.timestamp.toDate().toLocaleTimeString() : 'Recently Sync'}
                         </div>
                         <div className="text-[10px] text-blue-500 flex items-center gap-1 justify-end font-bold">
                            <MapPin className="w-2 h-2" /> Verified Location
                         </div>
                      </div>
                    </div>
                  ))}
                  {logs.length === 0 && (
                    <div className="p-12 text-center text-zinc-600 text-sm italic">
                      No attendance records found yet.
                    </div>
                  )}
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
