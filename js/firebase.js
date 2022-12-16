// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-app.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, onSnapshot, setDoc, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD8kurHDlUtHudqmatXOClk8CPbOIbxgzw",
  authDomain: "global-notes-app.firebaseapp.com",
  projectId: "global-notes-app",
  storageBucket: "global-notes-app.appspot.com",
  messagingSenderId: "266419436656",
  appId: "1:266419436656:web:8a76c31539643371a208b5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// AUTH

export async function newAccount(email, password){
  try {
    const newUser = await createUserWithEmailAndPassword(auth, email,password);
    return newUser.user;
  } catch (error) {
    throw new Error(error);
  }
}

export async function loginUser(email, password){
  try {
    const currentUser = await signInWithEmailAndPassword(auth, email, password);
    return currentUser.user;
  } catch (error) {
    throw new Error(error);
  }
}

export function logout(){
  signOut(auth);
}

export async function googleLogin(){
  try {
    const provider = new GoogleAuthProvider();
    auth.lenguageCode = 'es';
    const response = await signInWithPopup(auth, provider);
    return response.user;
  } catch (error) {
    throw new Error(error);
  }
}

export async function checkUser(callback) {
  onAuthStateChanged(auth, callback);
}

// CRUD

export async function setNewNote(newNote){
  const docRef = await addDoc(collection(db, 'notes'), newNote);
  return docRef;
}

export async function getNotes(){
  const notes = [];
  const q = query(collection(db, 'notes'), orderBy('index', 'asc'));
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach(doc => {
    const note = {...doc.data()};
    note.docId = doc.id;
    notes.push(note);
  });
  return notes;
}

export function onChangeNotes(callback) {
  onSnapshot(collection(db, 'notes'), callback);
}

export async function editNote(id, newNote){
  await setDoc(doc(db, 'notes', id), newNote);
}

export async function deleteNote(id){
  await deleteDoc(doc(db, 'notes', id));
}