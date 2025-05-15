import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAZxkineyP_sEWykl-LqNoAP8mgqXev8qc",
  authDomain: "pet-project-5192f.firebaseapp.com",
  projectId: "pet-project-5192f",
  storageBucket: "pet-project-5192f.firebasestorage.app",
  messagingSenderId: "458685541624",
  appId: "1:458685541624:web:978e8e3d4a4156ff251f0d",
  measurementId: "G-VX7NZNJ3ZR"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

async function addPet() {
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

    await petsCollection.doc(rfid).set(data, { merge: true });
    loadPets();
}

async function loadPets() {
    const tableBody = document.querySelector('#petsTable tbody');
    tableBody.innerHTML = '';
    const snapshot = await petsCollection.get();
    snapshot.forEach(doc => {
        const pet = doc.data();
        const tr = document.createElement('tr');
        tr.innerHTML = \`
            <td>\${pet.rfid}</td>
            <td>\${pet.ownerName}</td>
            <td>\${pet.contactNumber}</td>
            <td>\${pet.petName}</td>
            <td>\${pet.species}</td>
            <td>\${pet.breed}</td>
            <td>\${pet.age}</td>
            <td>\${pet.diagnosis}</td>
            <td>\${pet.medicalRecords.join(', ')}</td>
            <td>
                <button onclick="addMedicalRecord('\${pet.rfid}')">Add Record</button>
                <button onclick="deletePet('\${pet.rfid}')">Delete</button>
            </td>
        \`;
        tableBody.appendChild(tr);
    });
}

async function searchByRFID() {
    const rfid = document.getElementById('rfidSearch').value.trim();
    if (!rfid) return alert('Enter RFID to search');

    const doc = await petsCollection.doc(rfid).get();
    if (!doc.exists) return alert('No data found for RFID: ' + rfid);

    const pet = doc.data();
    alert(\`Owner: \${pet.ownerName}\nPet: \${pet.petName}\nDiagnosis: \${pet.diagnosis}\`);
}

async function deletePet(rfid) {
    if (!confirm('Delete this pet?')) return;
    await petsCollection.doc(rfid).delete();
    loadPets();
}

async function addMedicalRecord(rfid) {
    const record = prompt('Enter medical record:');
    if (!record) return;

    await petsCollection.doc(rfid).update({
        medicalRecords: firebase.firestore.FieldValue.arrayUnion(record)
    });
    loadPets();
}

// Initial load
loadPets();
