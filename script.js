import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  getDoc,
  deleteDoc,
  updateDoc,
  arrayUnion,
  addDoc,
  query,
  where,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAZxkineyP_sEWykl-LqNoAP8mgqXev8qc",
  authDomain: "pet-project-5192f.firebaseapp.com",
  projectId: "pet-project-5192f",
  storageBucket: "pet-project-5192f.appspot.com",
  messagingSenderId: "458685541624",
  appId: "1:458685541624:web:978e8e3d4a4156ff251f0d"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const petsCollection = collection(db, "pets");
const medicalHistoryCollection = collection(db, "medical_history");

window.addPet = async function() {
  const rfid = document.getElementById('rfid').value.trim();
  if (!rfid) return alert('RFID is required');

  const data = {
    rfid: rfid,
    ownerName: document.getElementById('ownerName').value,
    contactNumber: document.getElementById('contactNumber').value,
    petName: document.getElementById('petName').value,
    species: document.getElementById('species').value,
    breed: document.getElementById('breed').value,
    age: parseInt(document.getElementById('age').value),
    diagnosis: document.getElementById('diagnosis').value,
    timestamp: serverTimestamp()
  };

  await setDoc(doc(petsCollection, rfid), data, { merge: true });
  await addDoc(medicalHistoryCollection, data);
  window.loadPets();
};

window.addMedicalRecord = async function(rfid) {
  const record = prompt('Enter medical record:');
  if (!record) return;

  const petSnap = await getDoc(doc(petsCollection, rfid));
  if (!petSnap.exists()) return alert('Pet not found!');

  const petData = petSnap.data();

  await updateDoc(doc(petsCollection, rfid), {
    medicalRecords: arrayUnion(record)
  });

  await addDoc(medicalHistoryCollection, {
    ...petData,
    diagnosis: record,
    timestamp: serverTimestamp()
  });

  window.loadPets();
};

window.searchMedicalHistory = async function() {
  const rfid = document.getElementById('rfidHistorySearch').value.trim();
  if (!rfid) return alert('Enter RFID to search medical history');

  const q = query(medicalHistoryCollection, where("rfid", "==", rfid), orderBy("timestamp", "desc"));
  const snapshot = await getDocs(q);

  const tableBody = document.querySelector('#historyTable tbody');
  tableBody.innerHTML = '';

  if (snapshot.empty) {
    tableBody.innerHTML = '<tr><td colspan="4">No history found</td></tr>';
    return;
  }

  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    const tr = document.createElement('tr');
    const date = data.timestamp?.toDate().toLocaleString() || 'Pending...';
    tr.innerHTML = `
      <td>${date}</td>
      <td>${data.petName}</td>
      <td>${data.diagnosis}</td>
      <td>
        <button onclick="updateMedicalHistory('${docSnap.id}', '${data.diagnosis}')">Update</button>
        <button onclick="deleteMedicalHistory('${docSnap.id}')">Delete</button>
      </td>
    `;
    tableBody.appendChild(tr);
  });
};

window.updateMedicalHistory = async function(docId, oldDiagnosis) {
  const newDiagnosis = prompt('Enter updated diagnosis:', oldDiagnosis);
  if (!newDiagnosis) return;

  await updateDoc(doc(medicalHistoryCollection, docId), {
    diagnosis: newDiagnosis,
    timestamp: serverTimestamp()
  });

  alert('Record updated.');
  window.searchMedicalHistory();
};

window.deleteMedicalHistory = async function(docId) {
  if (!confirm('Delete this medical history record?')) return;
  await deleteDoc(doc(medicalHistoryCollection, docId));
  alert('Record deleted.');
  window.searchMedicalHistory();
};

window.deletePet = async function(rfid) {
  if (!confirm('Delete this pet?')) return;
  await deleteDoc(doc(petsCollection, rfid));
  window.loadPets();
};

window.loadPets = async function() {
  const tableBody = document.querySelector('#petsTable tbody');
  tableBody.innerHTML = '';
  const snapshot = await getDocs(petsCollection);
  snapshot.forEach(docSnap => {
    const pet = docSnap.data();
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${pet.rfid}</td>
      <td>${pet.ownerName}</td>
      <td>${pet.contactNumber}</td>
      <td>${pet.petName}</td>
      <td>${pet.species}</td>
      <td>${pet.breed}</td>
      <td>${pet.age}</td>
      <td>${pet.diagnosis}</td>
      <td></td>
      <td>
        <button onclick="addMedicalRecord('${pet.rfid}')">Add Record</button>
        <button onclick="deletePet('${pet.rfid}')">Delete</button>
      </td>
    `;
    tableBody.appendChild(tr);
  });
};

document.addEventListener("DOMContentLoaded", () => {
  window.loadPets();
});
