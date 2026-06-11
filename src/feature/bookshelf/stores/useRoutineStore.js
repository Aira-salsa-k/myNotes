import { create } from "zustand";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  onSnapshot,
  query,
  where,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { db, auth } from "../../../lib/firebase";

export const useRoutineStore = create((set, get) => ({
  routines: [],
  routineLogs: [],
  isLoading: true,
  unsubscribeRoutines: null,
  unsubscribeLogs: null,

  initializeRoutines: () => {
    const user = auth.currentUser;
    if (!user) return;

    // Fetch Routines
    const qRoutines = query(collection(db, "routines"), where("userId", "==", user.uid));
    const unsubRoutines = onSnapshot(qRoutines, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      data.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
      set({ routines: data });
      get().checkLoading();
    });

    // Fetch Logs
    const qLogs = query(collection(db, "routineLogs"), where("userId", "==", user.uid));
    const unsubLogs = onSnapshot(qLogs, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      set({ routineLogs: data });
      get().checkLoading();
    });

    set({ unsubscribeRoutines: unsubRoutines, unsubscribeLogs: unsubLogs });
  },

  checkLoading: () => {
    set({ isLoading: false });
  },

  clearRoutines: () => {
    const { unsubscribeRoutines, unsubscribeLogs } = get();
    if (unsubscribeRoutines) unsubscribeRoutines();
    if (unsubscribeLogs) unsubscribeLogs();
    set({
      routines: [],
      routineLogs: [],
      unsubscribeRoutines: null,
      unsubscribeLogs: null,
      isLoading: true,
    });
  },

  addRoutine: async (title) => {
    const user = auth.currentUser;
    if (!user || !title.trim()) return;

    const newRoutine = {
      userId: user.uid,
      title: title.trim(),
      createdAt: serverTimestamp(),
      orderIndex: get().routines.length,
    };

    try {
      await addDoc(collection(db, "routines"), newRoutine);
    } catch (error) {
      console.error("Error adding routine:", error);
    }
  },

  updateRoutine: async (id, title) => {
    try {
      const routineRef = doc(db, "routines", id);
      await updateDoc(routineRef, { title: title.trim() });
    } catch (error) {
      console.error("Error updating routine:", error);
    }
  },

  deleteRoutine: async (id) => {
    try {
      await deleteDoc(doc(db, "routines", id));
    } catch (error) {
      console.error("Error deleting routine:", error);
    }
  },

  setRoutines: async (newRoutines) => {
    set({ routines: newRoutines });
    try {
      const batch = writeBatch(db);
      newRoutines.forEach((routine, index) => {
        const routineRef = doc(db, "routines", routine.id);
        batch.update(routineRef, { orderIndex: index });
      });
      await batch.commit();
    } catch (error) {
      console.error("Error reordering routines:", error);
    }
  },

  toggleRoutineStatus: async (routineId, dateString) => {
    const user = auth.currentUser;
    if (!user) return;

    const { routineLogs } = get();
    const existingLog = routineLogs.find(
      (log) => log.routineId === routineId && log.date === dateString
    );

    try {
      if (existingLog) {
        await deleteDoc(doc(db, "routineLogs", existingLog.id));
      } else {
        await addDoc(collection(db, "routineLogs"), {
          userId: user.uid,
          routineId: routineId,
          date: dateString,
          createdAt: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error("Error toggling routine status:", error);
    }
  },
}));
