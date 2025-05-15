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
  arrayUnion
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAZxkineyP_sEWykl-LqNoAP8mgqXev8qc",
  authDomain: "pet-project-5192f.firebaseapp.com",
  projectId: "pet-project-5192f",
  storageBucket: "pet-project-5192f.appspot.com",
  messagingSenderId: "458685541624",
  appId: "1:458685541624:web:978e8e3d4a4156ff251f0d",
  measurementId: "G-VX7NZNJ3ZR"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const petsCollection = collection(db, "pets");

window.addPet = async function() {
  const rfid = document.getElementById('rfid').value.trim();
  if (!rfid) return alert('RFID is required');

  const data = {
    rfid,
    ownerName: document.getElementById('ownerName').value,
    contactNumber: document.getElementById('contactNumber').value,
    petName: document.getElementById('petName').value,
    species: document.getElementById('species').value,
    breed: document.getElementById('breed').value,
    age: parseInt(document.getElementById('age').value),
    diagnosis: document.getElementById('diagnosis').value,
    medicalRecords: []
  };

  await setDoc(doc(petsCollection, rfid), data, { merge: true });
  loadPets();
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
      <td>${pet.medicalRecords.join(', ')}</td>
      <td>
        <button onclick="addMedicalRecord('${pet.rfid}')">Add Record</button>
        <button onclick="deletePet('${pet.rfid}')">Delete</button>
      </td>
    `;
    tableBody.appendChild(tr);
  });
};

window.searchByRFID = async function() {
  const rfid = document.getElementById('rfidSearch').value.trim();
  if (!rfid) return alert('Enter RFID to search');

  const docSnap = await getDoc(doc(petsCollection, rfid));
  if (!docSnap.exists()) return alert('No data found for RFID: ' + rfid);

  const pet = docSnap.data();
  alert(`Owner: ${pet.ownerName}\nPet: ${pet.petName}\nDiagnosis: ${pet.diagnosis}`);
};

window.deletePet = async function(rfid) {
  if (!confirm('Delete this pet?')) return;
  await deleteDoc(doc(petsCollection, rfid));
  loadPets();
};

window.addMedicalRecord = async function(rfid) {
  const record = prompt('Enter medical record:');
  if (!record) return;

  await updateDoc(doc(petsCollection, rfid), {
    medicalRecords: arrayUnion(record)
  });
  loadPets();
};

document.addEventListener("DOMContentLoaded", () => {
  loadPets();
});
