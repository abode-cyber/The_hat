import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

// تكوين Firebase - يجب استبدال القيم بمتغيرات البيئة الحقيقية عند النشر
// حالياً سنستخدم قيم وهمية للتطوير المحلي، ولكن يجب تحديثها لاحقاً
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "demo-api-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "demo-project.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "demo-project",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "demo-project.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789:web:abcdef",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://demo-project-default-rtdb.firebaseio.com"
};

// تهيئة التطبيق
const app = initializeApp(firebaseConfig);

// تصدير خدمات قاعدة البيانات
export const db = getFirestore(app); // Firestore للبيانات الثابتة (المنيو)
export const rtdb = getDatabase(app); // Realtime Database للطلبات الحية

export default app;
