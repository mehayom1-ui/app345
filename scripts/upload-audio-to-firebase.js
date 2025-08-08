// scripts/upload-audio-to-firebase.js

// Usage: node upload-audio-to-firebase.js <localFilePath> <soundKey>

const { initializeApp } = require('firebase/app');
const { getStorage, ref, uploadBytes, getDownloadURL } = require('firebase/storage');
const fs = require('fs');
const path = require('path');

// TODO: Replace with your actual Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCVgg653oikNPfUxHvOPQEG1iwnAEZ_RVY",
  authDomain: "mehayom-e400b.firebaseapp.com",
  projectId: "mehayom-e400b",
  storageBucket: "mehayom-e400b.firebasestorage.app",
  messagingSenderId: "311596941398",
  appId: "1:311596941398:web:474f40d8bf454b3a237bf7",
  measurementId: "G-2NY7QQFSGM"
};

const [,, localFilePath, soundKey] = process.argv;

if (!localFilePath || !soundKey) {
  console.error('Usage: node upload-audio-to-firebase.js <localFilePath> <soundKey>');
  process.exit(1);
}

async function uploadAudio() {
  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const storage = getStorage(app);

  // Read file as buffer
  const fileBuffer = fs.readFileSync(path.resolve(localFilePath));

  // Create a Blob from the buffer
  const blob = new Uint8Array(fileBuffer);

  // Reference in Firebase Storage
  const fileRef = ref(storage, `sounds/${soundKey}.mp3`);

  // Upload
  await uploadBytes(fileRef, blob, { contentType: 'audio/mpeg' });
  const url = await getDownloadURL(fileRef);
  console.log('Upload complete! Download URL:', url);
}

uploadAudio().catch(err => {
  console.error('Error uploading audio:', err);
  process.exit(1);
}); 