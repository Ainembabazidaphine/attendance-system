import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Fingerprint, MapPin, CheckCircle2, XCircle, Loader2, Clock } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function AttendanceTracker({ user }) {
  const [step, setStep] = useState('idle');
  const [error, setError] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [selectedShift, setSelectedShift] = useState(null);

  const startCheckIn = (shift) => {
    setSelectedShift(shift);
    setStep('location');
    setError(null);
    checkLocation();
  };

  const checkLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      setStep('error');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      () => {
        // In a real app, calculate distance to SCHOOL_LOCATION
        // For this demo, we'll assume they are within range
        setTimeout(() => setStep('biometric'), 1500);
      },
      () => {
        setError("Failed to get location. Please enable GPS.");
        setStep('error');
      }
    );
  };

  const handleBiometricVerify = async () => {
    setIsVerifying(true);
    
    // Simulate biometric scan
    setTimeout(async () => {
      try {
        const attendanceData = {
          userId: user.uid,
          userName: user.name,
          status: 'present',
          subject: 'General Reporting',
          classId: user.classId || 'Staff',
          entry_type: user.role === 'student' ? 'student' : 'teacher'
        };

        // 1. Save to MySQL strictly
        const res = await fetch('/api/attendance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(attendanceData)
        });

        if (!res.ok) throw new Error("Local database offline");

        setIsVerifying(false);
        setStep('success');
      } catch (err) {
        console.error("Local MySQL Sync Error:", err);
        setError("Local MySQL Connection Failed. Attendance not saved.");
        setStep('error');
        setIsVerifying(false);
      }
    }, 2000);
  };

  return (
    <div id="attendance-tracker" className="max-w-md mx-auto p-6 bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
      <div className="flex flex-col items-center gap-6 py-8">
        <AnimatePresence mode="wait">
          {step === 'idle' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center w-full"
            >
              <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center mb-4 mx-auto border border-zinc-700">
                <Fingerprint className="w-10 h-10 text-zinc-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Daily Presence</h2>
              <p className="text-zinc-400 text-sm mb-8 italic">Choose your shift to verify identity</p>
              
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => startCheckIn('reporting')}
                  className="w-full bg-blue-600/10 text-blue-400 border border-blue-600/20 py-4 rounded-xl font-bold hover:bg-blue-600/20 transition-all active:scale-95 flex items-center justify-center gap-3 group"
                >
                  <Clock className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  <div>
                    <div className="text-sm">Reporting (8 AM)</div>
                    <div className="text-[10px] font-medium opacity-60">Session Start</div>
                  </div>
                </button>
                
                <button
                  onClick={() => startCheckIn('leaving')}
                  className="w-full bg-orange-600/10 text-orange-400 border border-orange-600/20 py-4 rounded-xl font-bold hover:bg-orange-600/20 transition-all active:scale-95 flex items-center justify-center gap-3 group"
                >
                  <Clock className="w-5 h-5 group-hover:-rotate-12 transition-transform" />
                  <div>
                    <div className="text-sm">Leaving (5 PM)</div>
                    <div className="text-[10px] font-medium opacity-60">End of Duty</div>
                  </div>
                </button>
              </div>
            </motion.div>
          )}

          {step === 'location' && (
            <motion.div
              key="location"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="text-center"
            >
              <div className="relative">
                <div className="w-24 h-24 bg-zinc-800 flex items-center justify-center mb-6 mx-auto rounded-full border border-zinc-700">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    <MapPin className="w-12 h-12 text-blue-400" />
                  </motion.div>
                </div>
                <div className="absolute inset-0 w-24 h-24 mx-auto border-2 border-blue-500/20 rounded-full animate-ping" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Verifying Location</h3>
              <p className="text-zinc-500 text-sm mb-6">Please stay within school grounds</p>
              <button 
                onClick={() => setStep('idle')}
                className="text-[10px] uppercase font-bold text-zinc-600 hover:text-white transition-colors"
              >
                Cancel Verification
              </button>
            </motion.div>
          )}

          {step === 'biometric' && (
            <motion.div
              key="biometric"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <div className="mb-8 relative group cursor-pointer" onClick={!isVerifying ? handleBiometricVerify : undefined}>
                <div className={cn(
                  "w-32 h-32 rounded-3xl flex items-center justify-center mx-auto transition-all duration-500",
                  isVerifying ? "bg-blue-600 shadow-[0_0_30px_rgba(37,99,235,0.4)]" : "bg-zinc-800 border border-zinc-700 hover:border-blue-500/50"
                )}>
                  {isVerifying ? (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-t from-blue-400/50 to-transparent h-0 z-10"
                      animate={{ height: ["0%", "100%", "0%"] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    />
                  ) : null}
                  <Fingerprint className={cn(
                    "w-16 h-16 transition-colors duration-500",
                    isVerifying ? "text-white" : "text-zinc-500 group-hover:text-blue-400"
                  )} />
                </div>
                {isVerifying && (
                  <div className="mt-4 flex items-center justify-center gap-2 text-blue-400 font-mono text-xs tracking-widest uppercase">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Scanning...
                  </div>
                )}
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Biometric Scan</h3>
              <p className="text-zinc-500 text-sm mb-6">Place your finger on the sensor</p>
              <button 
                onClick={() => setStep('idle')}
                disabled={isVerifying}
                className="text-[10px] uppercase font-bold text-zinc-600 hover:text-white transition-colors disabled:opacity-0"
              >
                Exit Verification
              </button>
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div
              key="success"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center"
            >
              <div className="w-24 h-24 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-6 mx-auto border border-green-500/50">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Verified!</h3>
              <p className="text-zinc-400 mb-8 lowercase tracking-tight font-medium">Record Saved: {selectedShift === 'reporting' ? 'morning check-in (8am)' : 'evening check-out (5pm)'}</p>
              <button
                onClick={() => {
                  setStep('idle');
                  setSelectedShift(null);
                }}
                className="px-8 py-3 bg-zinc-800 text-white rounded-xl hover:bg-zinc-700 transition-colors"
              >
                Done
              </button>
            </motion.div>
          )}

          {step === 'error' && (
            <motion.div
              key="error"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="text-center"
            >
              <div className="w-20 h-20 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mb-6 mx-auto border border-red-500/50">
                <XCircle className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Check-in Failed</h3>
              <p className="text-red-400 text-sm mb-8">{error}</p>
              <button
                onClick={() => setStep('idle')}
                className="px-8 py-3 bg-white text-black rounded-xl hover:bg-zinc-200 transition-colors"
              >
                Try Again
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
