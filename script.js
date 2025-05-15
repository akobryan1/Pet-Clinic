// Firebase config (replace with your own config)
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const petsCollection = db.collection('pets');

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