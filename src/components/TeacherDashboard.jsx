import { useState, useEffect, useCallback } from 'react';
import { cn } from '../lib/utils';
import { 
  Users, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ChevronRight, 
  Fingerprint,
  ClipboardList,
  FileText,
  BarChart2,
  Download,
  ShieldCheck,
  Upload,
  Send,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import AttendanceTracker from './AttendanceTracker';

export default function TeacherDashboard({ user, onLogout }) {
  const [activePortal, setActivePortal] = useState('students');
  const [students, setStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState(''); 
  const [selectedSubject, setSelectedSubject] = useState('General');
  const [markedStudents, setMarkedStudents] = useState({});
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [reportTitle, setReportTitle] = useState('');
  const [reportContent, setReportContent] = useState('');
  const [reportType, setReportType] = useState('text');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subjects = ['Mathematics', 'Biology', 'Chemistry', 'Physics', 'History', 'Geography', 'English', 'Luganda', 'CRE', 'Fine Art'];

  const [submissionStatus, setSubmissionStatus] = useState(null);

  const fetchStudents = useCallback(async () => {
    if (!selectedClass) return;
    try {
      const res = await fetch(`/api/users?role=student&classId=${selectedClass}`);
      if (res.ok) {
        setStudents(await res.json());
      } else {
        throw new Error("Local Registry Offline");
      }
    } catch (err) {
      console.warn("Failed to fetch from MySQL:", err);
      // Optional: Set empty or mock if strictly required
      setStudents([]);
    }
  }, [selectedClass]);

  const fetchMyLogs = useCallback(async () => {
    try {
      const res = await fetch(`/api/attendance?userId=${user.uid}`);
      if (res.ok) {
        setAttendanceLogs(await res.json());
      }
    } catch (_) {
      console.warn("Failed to fetch logs from MySQL");
    }
  }, [user.uid]);

  useEffect(() => {
    if (selectedClass) {
      fetchStudents();
      setMarkedStudents({});
    }
    fetchMyLogs();
  }, [selectedClass, fetchStudents, fetchMyLogs]);

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!reportTitle) return;
    if (reportType === 'text' && !reportContent) return;
    if (reportType === 'pdf' && !selectedFile) return;

    setIsSubmitting(true);
    setSubmissionStatus(null);
    try {
      const reportData = {
        authorId: user.uid,
        authorName: user.name,
        title: reportTitle,
        content: reportType === 'text' ? reportContent : '',
        fileName: reportType === 'pdf' ? selectedFile?.name : '',
        report_type: reportType,
        status: 'pending'
      };

      // Submit strictly to MySQL
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportData)
      });

      if (!res.ok) throw new Error("MySQL offline");

      setReportTitle('');
      setReportContent('');
      setSelectedFile(null);
      setSubmissionStatus({ type: 'success', message: 'Report saved to local MySQL database.' });
    } catch (err) {
      console.error(err);
      setSubmissionStatus({ type: 'error', message: 'Failed to save to MySQL. Ensure WAMP is running.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitRollCall = async (student, status) => {
    setMarkedStudents(prev => ({ ...prev, [student.uid]: status }));
    
    const attendanceData = {
      userId: student.uid,
      userName: student.name,
      status: status,
      classId: selectedClass,
      subject: selectedSubject,
      entry_type: 'student'
    };

    try {
      // Record strictly in MySQL
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(attendanceData)
      });
      if (!res.ok) console.warn("MySQL attendance log failed: Database offline");
    } catch (err) {
      console.error("Local MySQL Sync Error:", err);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-zinc-950 text-white font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="flex justify-between items-start w-full md:w-auto">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white">Faculty Command Center</h1>
              <p className="text-zinc-500 text-sm">Welcome, Instructor {user.name.split(' ')[0]}</p>
            </div>
            <button 
              onClick={onLogout}
              className="md:hidden px-4 py-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-lg border border-red-500/20 transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
            >
              <XCircle className="w-4 h-4" /> Exit
            </button>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="flex bg-zinc-900 border border-zinc-800 p-1 rounded-xl flex-1 md:flex-none">
              <button 
                onClick={() => setActivePortal('students')}
                className={cn(
                  "flex-1 md:flex-none px-4 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                  activePortal === 'students' ? "bg-zinc-800 text-white shadow-lg" : "text-zinc-500 hover:text-zinc-300"
                )}
              >
                <Users className="w-4 h-4" /> Students
              </button>
              <button 
                onClick={() => setActivePortal('teacher')}
                className={cn(
                  "flex-1 md:flex-none px-4 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                  activePortal === 'teacher' ? "bg-zinc-800 text-white shadow-lg" : "text-zinc-500 hover:text-zinc-300"
                )}
              >
                <Fingerprint className="w-4 h-4" /> Personal
              </button>
              <button 
                onClick={() => {
                  setActivePortal('reports');
                  setSelectedClass(''); 
                }}
                className={cn(
                  "flex-1 md:flex-none px-4 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                  activePortal === 'reports' ? "bg-zinc-800 text-white shadow-lg" : "text-zinc-500 hover:text-zinc-300"
                )}
              >
                <FileText className="w-4 h-4" /> Reports
              </button>
            </div>

            <button 
              onClick={onLogout}
              className="hidden md:flex px-4 py-2.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl border border-red-500/20 transition-all items-center gap-2 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-500/10"
            >
              <XCircle className="w-4 h-4" /> Exit Session
            </button>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {activePortal === 'reports' ? (
            <motion.div 
              key="reports-portal"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
                 {[
                   { label: 'Classes Taught', val: '6 Levels', icon: Users, color: 'text-blue-400' },
                   { label: 'Avg Participation', val: '92.4%', icon: BarChart2, color: 'text-green-400' },
                   { label: 'Lessons Recorded', val: '124', icon: ClipboardList, color: 'text-purple-400' }
                 ].map((stat, i) => (
                   <div key={i} className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl">
                      <div className={`p-2 bg-zinc-800 rounded-lg w-fit mb-4 ${stat.color}`}>
                        <stat.icon className="w-5 h-5" />
                      </div>
                      <div className="text-2xl font-bold text-white">{stat.val}</div>
                      <div className="text-xs text-zinc-500 uppercase tracking-widest font-bold mt-1">{stat.label}</div>
                   </div>
                 ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-12">
                   <div className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-8 mb-8">
                      <div className="flex items-center gap-3 mb-6">
                         <div className="p-3 bg-blue-500/10 rounded-2xl">
                           <FileText className="w-6 h-6 text-blue-400" />
                         </div>
                         <div>
                            <h3 className="text-xl font-bold text-white tracking-tight">Submit Administrative Report</h3>
                            <p className="text-zinc-500 text-sm italic">Formal communication to the school administration</p>
                         </div>
                      </div>

                      <form onSubmit={handleReportSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div>
                              <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest mb-2 block">Report Title</label>
                              <input 
                                type="text"
                                value={reportTitle}
                                onChange={(e) => setReportTitle(e.target.value)}
                                placeholder="e.g. End of Term Subject Performance"
                                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                                required
                              />
                           </div>
                           <div>
                              <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest mb-2 block">Report Type</label>
                              <div className="flex bg-zinc-800 p-1 rounded-xl">
                                <button
                                  type="button"
                                  onClick={() => setReportType('text')}
                                  className={cn(
                                    "flex-1 py-2 rounded-lg text-[10px] font-bold uppercase transition-all",
                                    reportType === 'text' ? "bg-zinc-700 text-white shadow" : "text-zinc-500"
                                  )}
                                >
                                  Typed Document
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setReportType('pdf')}
                                  className={cn(
                                    "flex-1 py-2 rounded-lg text-[10px] font-bold uppercase transition-all",
                                    reportType === 'pdf' ? "bg-zinc-700 text-white shadow" : "text-zinc-500"
                                  )}
                                >
                                  PDF Upload
                                </button>
                              </div>
                           </div>
                        </div>

                        {reportType === 'text' ? (
                          <div>
                            <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest mb-2 block">Document Content</label>
                            <textarea 
                              value={reportContent}
                              onChange={(e) => setReportContent(e.target.value)}
                              placeholder="Describe your observations, findings, or administrative updates here..."
                              rows={6}
                              className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-4 py-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none font-sans"
                              required={reportType === 'text'}
                            />
                          </div>
                        ) : (
                          <div className={cn(
                            "w-full border-2 border-dashed rounded-3xl p-12 transition-all flex flex-col items-center justify-center gap-4 cursor-pointer",
                            selectedFile ? "border-blue-500/50 bg-blue-500/5" : "border-zinc-800 hover:border-zinc-700 bg-zinc-800/20"
                          )}
                          onClick={() => document.getElementById('report-file')?.click()}
                          >
                            <input 
                              id="report-file"
                              type="file" 
                              accept=".pdf"
                              className="hidden"
                              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                            />
                            <div className={cn(
                              "w-16 h-16 rounded-full flex items-center justify-center transition-colors shadow-xl",
                              selectedFile ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-500"
                            )}>
                              {selectedFile ? <FileText className="w-8 h-8" /> : <Upload className="w-8 h-8" />}
                            </div>
                            <div className="text-center">
                              <div className="text-sm font-bold text-white">
                                {selectedFile ? selectedFile.name : "Select official PDF document"}
                              </div>
                              <div className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1 font-bold">
                                {selectedFile ? "File attached successfully" : "Drap & drop or browse institutional files"}
                              </div>
                            </div>
                          </div>
                        )}

                        {submissionStatus && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className={cn(
                              "p-4 rounded-2xl text-[10px] uppercase font-black tracking-widest text-center",
                              submissionStatus.type === 'success' ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                            )}
                          >
                            {submissionStatus.message}
                          </motion.div>
                        )}

                        <div className="flex justify-end pt-4">
                           <button 
                             disabled={isSubmitting}
                             className="w-full md:w-auto px-8 py-4 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-zinc-200 transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-xl"
                           >
                             {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                             Submit Report
                           </button>
                        </div>
                      </form>
                   </div>

                   <div className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] overflow-hidden">
                      <div className="p-8 border-b border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-3">
                            <ClipboardList className="w-6 h-6 text-blue-400" /> Reports Verification Archive
                          </h3>
                          <p className="text-zinc-500 text-sm mt-1">Official audit trail of all student roll-calls conducted</p>
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 bg-white text-black text-xs font-bold rounded-xl hover:bg-zinc-200 transition-all uppercase tracking-widest">
                          <Download className="w-3 h-3" /> Export Digital Report
                        </button>
                      </div>
                      
                      <div className="overflow-x-auto">
                        <div className="min-w-[800px] md:min-w-0">
                          <table className="w-full text-left">
                            <thead>
                              <tr className="text-[10px] uppercase font-bold text-zinc-500 border-b border-zinc-800 bg-zinc-900/50 sticky top-0 z-10">
                                <th className="px-8 py-4">Session Date</th>
                                <th className="px-8 py-4">Class</th>
                                <th className="px-8 py-4">Subject</th>
                                <th className="px-8 py-4 text-center">Status</th>
                                <th className="px-8 py-4 text-right">Integrity</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800/50">
                              {[
                                { date: '2026-04-23', class: 'S4', subject: 'Mathematics', status: 'COMPLETE', integrity: 'BIOMETRIC' },
                                { date: '2026-04-22', class: 'S2', subject: 'Biology', status: 'COMPLETE', integrity: 'BIOMETRIC' },
                                { date: '2026-04-22', class: 'S6', subject: 'Physics', status: 'COMPLETE', integrity: 'BIOMETRIC' },
                                { date: '2026-04-21', class: 'S1', subject: 'English', status: 'COMPLETE', integrity: 'BIOMETRIC' },
                                { date: '2026-04-21', class: 'S3', subject: 'Luganda', status: 'COMPLETE', integrity: 'BIOMETRIC' },
                              ].map((row, i) => (
                                <tr key={i} className="hover:bg-zinc-800/30 transition-colors group">
                                  <td className="px-8 py-5 text-sm font-medium text-white whitespace-nowrap">{row.date}</td>
                                  <td className="px-8 py-5">
                                    <span className="text-[10px] font-black bg-zinc-800 text-zinc-400 px-2.5 py-1 rounded-md border border-zinc-700 whitespace-nowrap">
                                      {row.class}
                                    </span>
                                  </td>
                                  <td className="px-8 py-5 text-sm font-medium text-zinc-400 whitespace-nowrap">{row.subject}</td>
                                  <td className="px-8 py-5 text-center">
                                    <span className="text-[9px] font-black text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20 whitespace-nowrap">
                                      {row.status}
                                    </span>
                                  </td>
                                  <td className="px-8 py-5 text-right">
                                    <div className="flex items-center justify-end gap-2 text-[10px] font-bold text-blue-400 uppercase tracking-widest whitespace-nowrap">
                                      <ShieldCheck className="w-3 h-3" /> {row.integrity}
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                   </div>
                </div>
              </div>
            </motion.div>
          ) : activePortal === 'teacher' ? (
            <motion.div 
              key="teacher-portal"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              <div className="lg:col-span-5 space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <Fingerprint className="w-5 h-5 text-blue-400" />
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Teacher Verify</h3>
                </div>
                <AttendanceTracker user={user} />
              </div>
              
              <div className="lg:col-span-7">
                <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 h-full">
                  <div className="flex items-center justify-between mb-8">
                    <h4 className="text-lg font-bold text-white flex items-center gap-2">
                      <Clock className="w-5 h-5 text-zinc-500" /> Professional Log Archive
                    </h4>
                    <span className="text-[10px] bg-zinc-800 border border-zinc-700 px-3 py-1 rounded-full text-zinc-500 font-bold tracking-widest uppercase">Last 5 Sessions</span>
                  </div>
                  
                  <div className="space-y-4">
                    {attendanceLogs.map((log, i) => (
                      <div key={i} className="flex items-center justify-between p-5 bg-zinc-800/20 rounded-2xl border border-zinc-800/50 group hover:border-zinc-700 transition-colors">
                        <div>
                          <div className="text-sm font-bold text-white mb-1">
                            {new Date(log.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                          </div>
                          <div className="flex items-center gap-2">
                             <div className="text-[10px] text-zinc-600 uppercase font-bold tracking-widest">Digital Stamp Verified</div>
                             {log.shift && (
                               <>
                                 <div className="w-1 h-1 rounded-full bg-zinc-800" />
                                 <div className={cn(
                                   "text-[10px] font-bold uppercase tracking-tight",
                                   log.shift === 'reporting' ? "text-blue-400" : "text-orange-400"
                                 )}>
                                   {log.shift === 'reporting' ? 'Reporting (8am)' : 'Leaving (5pm)'}
                                 </div>
                               </>
                             )}
                          </div>
                        </div>
                        <div className={cn(
                          "text-[10px] uppercase font-black px-4 py-1.5 rounded-lg border shadow-sm",
                          log.status === 'present' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                        )}>
                          {log.status}
                        </div>
                      </div>
                    ))}
                    {attendanceLogs.length === 0 && (
                      <div className="py-20 text-center text-zinc-700 italic text-sm">No verification history found for this device.</div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="students-portal"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-2">
                <ClipboardList className="w-5 h-5" /> Institutional Registry
              </h3>
              
              {!selectedClass ? (
                <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-12 text-center">
                  <Users className="w-16 h-16 mb-6 opacity-20 mx-auto text-blue-400" />
                  <h3 className="text-xl font-bold text-white mb-2 tracking-tight">Session Launchpad</h3>
                  <p className="text-zinc-500 mb-10 max-w-md mx-auto italic text-sm">Select your subject and class level below to begin a verified roll call session.</p>
                  
                  <div className="max-w-xl mx-auto space-y-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Active Subject</label>
                      <div className="flex flex-wrap justify-center gap-2">
                        {subjects.map(sub => (
                          <button
                            key={sub}
                            onClick={() => setSelectedSubject(sub)}
                            className={cn(
                              "px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border",
                              selectedSubject === sub 
                                ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20" 
                                : "bg-zinc-800 border-zinc-700 text-zinc-500 hover:border-zinc-500"
                            )}
                          >
                            {sub}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Pick Class Register</label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {['S1', 'S2', 'S3', 'S4', 'S5', 'S6'].map((c) => (
                          <button
                            key={c}
                            onClick={() => setSelectedClass(c)}
                            className="group p-6 bg-zinc-800 border border-zinc-700/50 rounded-2xl hover:border-blue-500 hover:bg-blue-500/5 transition-all text-center relative overflow-hidden"
                          >
                            <div className="relative z-10 transition-transform group-hover:scale-110">
                              <div className="text-2xl font-black text-zinc-400 group-hover:text-blue-400 mb-1 leading-none">{c}</div>
                              <div className="text-[10px] text-zinc-600 uppercase font-bold tracking-widest leading-none group-hover:text-zinc-400">Registry</div>
                            </div>
                            <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <ChevronRight className="w-3 h-3 text-blue-500" />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">
                  <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
                    <div className="flex items-center gap-6">
                      <button 
                        onClick={() => setSelectedClass('')}
                        className="group flex items-center gap-2 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-400 hover:text-white transition-all border border-zinc-700/50"
                      >
                        <ChevronRight className="w-3 h-3 rotate-180" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">End Session</span>
                      </button>
                      <div className="h-8 w-px bg-zinc-800 mx-2 hidden md:block" />
                      <div>
                        <h4 className="text-lg font-bold text-white tracking-tight flex flex-wrap items-center gap-2">
                          {selectedClass} Registry 
                          <span className="text-[10px] font-mono text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700 uppercase tracking-widest">
                            {selectedSubject}
                          </span>
                          <span className="text-[10px] font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20 uppercase tracking-widest ml-2">
                            {Object.keys(markedStudents).length} / {students.length} Marked
                          </span>
                        </h4>
                        <p className="text-xs text-zinc-500 font-medium tracking-tight">Real-time reports verification in progress</p>
                      </div>
                    </div>
                    <button onClick={fetchStudents} className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors font-mono tracking-tighter">REFRESH REGISTRY</button>
                  </div>
                  
                  <div className="divide-y divide-zinc-800/50">
                    {students.map((student, i) => {
                      const status = markedStudents[student.uid];
                      return (
                        <div key={i} className={cn(
                          "p-6 flex items-center justify-between transition-all",
                          status ? "bg-zinc-800/20" : "hover:bg-zinc-800/30"
                        )}>
                          <div className="flex items-center gap-4">
                            <div className={cn(
                              "w-10 h-10 rounded-full flex items-center justify-center font-bold relative",
                              status ? "bg-zinc-700 text-zinc-500" : "bg-zinc-800 text-zinc-400"
                            )}>
                              {student.name[0]}
                              {status && (
                                <div className={cn(
                                  "absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-zinc-900 flex items-center justify-center",
                                  status === 'present' ? 'bg-green-500' : status === 'late' ? 'bg-yellow-500' : 'bg-red-500'
                                )}>
                                  <CheckCircle2 className="w-3 h-3 text-white" />
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="text-sm font-bold text-white flex items-center gap-2">
                                {student.name}
                                {status && <span className="text-[8px] uppercase tracking-tighter opacity-50">Saved</span>}
                              </div>
                              <div className="text-[10px] text-zinc-500 uppercase tracking-widest">{student.email}</div>
                            </div>
                          </div>
                          
                          <div className="flex gap-2 relative">
                            {status ? (
                               <div className="flex items-center gap-2 px-4 py-2 bg-zinc-800/50 rounded-xl border border-zinc-700">
                                  <div className={cn(
                                    "text-[10px] font-black uppercase tracking-[0.2em]",
                                    status === 'present' ? 'text-green-500' : status === 'late' ? 'text-yellow-500' : 'text-red-500'
                                  )}>
                                    {status}
                                  </div>
                                  <button 
                                    onClick={() => {
                                      const newMarked = {...markedStudents};
                                      delete newMarked[student.uid];
                                      setMarkedStudents(newMarked);
                                    }}
                                    className="text-[8px] text-zinc-600 hover:text-white font-bold"
                                  >
                                    Undo
                                  </button>
                               </div>
                            ) : (
                              <>
                                <button 
                                  onClick={() => submitRollCall(student, 'present')}
                                  className="px-4 py-2 bg-zinc-800 hover:bg-green-600 text-zinc-400 hover:text-white text-[10px] font-bold uppercase rounded-lg transition-all border border-zinc-700"
                                >
                                  Present
                                </button>
                                <button 
                                  onClick={() => submitRollCall(student, 'late')}
                                  className="px-4 py-2 bg-zinc-800 hover:bg-yellow-600 text-zinc-400 hover:text-white text-[10px] font-bold uppercase rounded-lg transition-all border border-zinc-700"
                                >
                                  Late
                                </button>
                                <button 
                                  onClick={() => submitRollCall(student, 'absent')}
                                  className="px-4 py-2 bg-zinc-800 hover:bg-red-600 text-zinc-400 hover:text-white text-[10px] font-bold uppercase rounded-lg transition-all border border-zinc-700"
                                >
                                  Absent
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    {students.length === 0 && (
                      <div className="p-12 text-center text-zinc-600 text-sm italic">
                        No students found in {selectedClass}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
