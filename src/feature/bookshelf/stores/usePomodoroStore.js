import { create } from "zustand";
import { collection, addDoc, onSnapshot, query, where, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../../../lib/firebase";
import { useGoalStore } from "./useGoalStore";

export const usePomodoroStore = create((set, get) => ({
  sessions: [],
  isSessionsLoading: true,
  unsubscribeSessions: null,

  // Timer state
  activeGoal: null,
  timeLeft: 25 * 60, // 25 minutes 
  isRunning: false,
  timerInterval: null,
  isBreakTime: false,

  initializeSessions: () => {
    const user = auth.currentUser;
    if (!user) return;
    const q = query(collection(db, "pomodoroSessions"), where("userId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const sessionsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      set({ sessions: sessionsData, isSessionsLoading: false });
    }, (error) => {
      console.error("Error fetching pomodoro sessions:", error);
      set({ isSessionsLoading: false });
    });
    set({ unsubscribeSessions: unsubscribe });
  },

  clearSessions: () => {
    const { unsubscribeSessions, timerInterval } = get();
    if (unsubscribeSessions) unsubscribeSessions();
    if (timerInterval) clearInterval(timerInterval);
    set({ sessions: [], unsubscribeSessions: null, isSessionsLoading: true, timerInterval: null, isRunning: false, activeGoal: null });
  },

  setActiveGoal: (goal) => {
    const { timerInterval } = get();
    if (timerInterval) clearInterval(timerInterval);
    set({ activeGoal: goal, timeLeft: 25 * 60, isRunning: false, timerInterval: null, isBreakTime: false });
  },

  startTimer: () => {
    const { isRunning, timeLeft } = get();
    if (isRunning) return;
    
    // If starting from 0, reset to 25 mins
    let initialTimeLeft = timeLeft;
    if (initialTimeLeft <= 0) {
        initialTimeLeft = 25 * 60;
        set({ timeLeft: initialTimeLeft, isBreakTime: false });
    }

    // Best Practice: Hitung kapan waktu persisnya timer ini harus selesai
    const endTime = Date.now() + (initialTimeLeft * 1000);

    const interval = setInterval(() => {
      const now = Date.now();
      const remainingSeconds = Math.round((endTime - now) / 1000);
      
      if (remainingSeconds <= 0) {
        set({ timeLeft: 0 }); // Memastikan UI tidak pernah menampilkan waktu minus
        get().finishTimer();
      } else {
        // Cek agar tidak memicu re-render jika detiknya belum benar-benar berubah
        if (get().timeLeft !== remainingSeconds) {
          set({ timeLeft: remainingSeconds });
        }
      }
    }, 250); // Interval lebih cepat (250ms) agar UI terasa lebih responsif tanpa menguras performa
    
    set({ isRunning: true, timerInterval: interval });
  },

  pauseTimer: () => {
    const { timerInterval } = get();
    if (timerInterval) clearInterval(timerInterval);
    set({ isRunning: false, timerInterval: null });
  },

  stopTimer: async () => {
    const { timerInterval, activeGoal, isBreakTime, timeLeft } = get();
    if (timerInterval) clearInterval(timerInterval);
    
    // Calculate time spent and save to Firestore if not a break
    if (!isBreakTime && activeGoal) {
      // Waktu total pomodoro adalah 25 menit
      const timeSpent = (25 * 60) - timeLeft;
      
      // Hanya simpan jika ada waktu yang terpakai
      if (timeSpent > 0) {
        const user = auth.currentUser;
        if (user) {
          try {
            await addDoc(collection(db, "pomodoroSessions"), {
              userId: user.uid,
              goalId: activeGoal.id,
              goalTitle: activeGoal.title,
              goalCategory: activeGoal.category || "Uncategorized",
              duration: timeSpent, // real time spent
              date: new Date().toISOString(),
              createdAt: serverTimestamp(),
            });
          } catch (e) {
            console.error("Error saving partial pomodoro session", e);
          }
        }
      }
    }
    
    set({ isRunning: false, timerInterval: null, timeLeft: 25 * 60, isBreakTime: false });
  },

  finishTimer: async () => {
    const { timerInterval, activeGoal, isBreakTime } = get();
    if (timerInterval) clearInterval(timerInterval);
    
    // Play sound "tit..tit.."
    const playSound = () => {
      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const playBeep = (time) => {
          const oscillator = audioCtx.createOscillator();
          const gainNode = audioCtx.createGain();
          oscillator.type = "sine";
          oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
          oscillator.connect(gainNode);
          gainNode.connect(audioCtx.destination);
          
          gainNode.gain.setValueAtTime(0, time);
          gainNode.gain.linearRampToValueAtTime(1, time + 0.05);
          gainNode.gain.linearRampToValueAtTime(0, time + 0.15);
          
          oscillator.start(time);
          oscillator.stop(time + 0.2);
        };
        playBeep(audioCtx.currentTime);
        playBeep(audioCtx.currentTime + 0.4);
        playBeep(audioCtx.currentTime + 0.8);
        playBeep(audioCtx.currentTime + 1.2);
        playBeep(audioCtx.currentTime + 1.6);
        playBeep(audioCtx.currentTime + 2.0);
      } catch (e) {
        console.error("Audio playback failed", e);
      }
    };
    playSound();

    if (!isBreakTime) {
      // Finished a pomodoro work session
      set({ isRunning: false, timerInterval: null, timeLeft: 5 * 60, isBreakTime: true }); // 5 mins break
      
      const user = auth.currentUser;
      if (user && activeGoal) {
        try {
          await addDoc(collection(db, "pomodoroSessions"), {
            userId: user.uid,
            goalId: activeGoal.id,
            goalTitle: activeGoal.title,
            goalCategory: activeGoal.category || "Uncategorized",
            duration: 25 * 60, // 25 mins in seconds
            date: new Date().toISOString(),
            createdAt: serverTimestamp(),
          });
        } catch (e) {
          console.error("Error saving pomodoro session", e);
        }
      }
    } else {
      // Finished break
      set({ isRunning: false, timerInterval: null, timeLeft: 25 * 60, isBreakTime: false });
    }
  },

  adjustTotalTime: async (goalId, newTotalSeconds, targetDate) => {
    const state = get();
    const user = auth.currentUser;
    if (!user) return;

    // Calculate current total
    const currentTotal = state.sessions
      .filter(s => s.goalId === goalId)
      .reduce((sum, s) => sum + s.duration, 0);

    const difference = newTotalSeconds - currentTotal;
    if (difference === 0) return;

    const allGoals = useGoalStore.getState().goals;
    const goalToAdjust = allGoals.find(g => g.id === goalId) || (state.activeGoal?.id === goalId ? state.activeGoal : null);
    
    // Fallback title/category if goal is not active (though it usually is when editing from widget)
    const goalTitle = goalToAdjust ? goalToAdjust.title : "Manual Adjustment";
    const goalCategory = goalToAdjust ? (goalToAdjust.category || "Uncategorized") : "Uncategorized";

    try {
      await addDoc(collection(db, "pomodoroSessions"), {
        userId: user.uid,
        goalId: goalId,
        goalTitle: goalTitle,
        goalCategory: goalCategory,
        duration: difference, // difference can be negative to subtract time
        date: targetDate || new Date().toISOString(),
        createdAt: serverTimestamp(),
        type: "adjustment"
      });
    } catch (e) {
      console.error("Error adjusting pomodoro time", e);
    }
  }
}));
