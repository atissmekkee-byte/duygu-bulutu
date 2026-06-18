// Firebase ayarlarinizi buraya yapistirin.
// Firebase Console > Project settings > General > Your apps > Firebase SDK config
const firebaseConfig = {
  apiKey: "AIzaSyDrTwtmBT7g0NR3brOsGaxfadVzBVp_Ato",
  authDomain: "duygu-bulutu.firebaseapp.com",
  databaseURL: "https://duygu-bulutu-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "duygu-bulutu",
  storageBucket: "duygu-bulutu.firebasestorage.app",
  messagingSenderId: "270426642684",
  appId: "1:270426642684:web:13fcdc6f5069a3ef775f79",
  measurementId: "G-101HMYNS4C"
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();
