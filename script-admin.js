

/*Elements de base (importer la config Firebase, déclarer des constantes, etc)*/

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { 
  getFirestore, collection, addDoc, getDocs, updateDoc, deleteDoc, doc, orderBy, query 
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

import { 
  getAuth, signInWithEmailAndPassword, onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";


const firebaseConfig = {
  apiKey: "AIzaSyAmN1UgexStdiOm4VQ1HDUFtzFi4WTvVHo",
  authDomain: "formulaire-50044.firebaseapp.com",
  projectId: "formulaire-50044",
  storageBucket: "formulaire-50044.firebasestorage.app",
  messagingSenderId: "837388957419",
  appId: "1:837388957419:web:d1b0d5c4a7431664fe30ae",
  measurementId: "G-EQE4P4CETC"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const loginForm = document.getElementById("loginForm");
const loginSection = document.getElementById("loginSection");
const adminContent = document.querySelector("main");
adminContent.style.display = "none";




/*Section Login*/
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (err) {
    alert("Identifiants incorrects !");
  }
});

document.getElementById('showPwdChk').addEventListener('change', function(e){
    const pwd = document.getElementById('password');
    pwd.type = this.checked ? 'text' : 'password';
  });

onAuthStateChanged(auth, user => {
  if (user) {
    loginSection.classList.add("hidden");
    adminContent.style.display = "block";
    afficherMessages(); 
  } else {
    loginSection.classList.remove("hidden");
    adminContent.style.display = "none";
  }
});




/*Gerer les messages*/
let selectedId = null;

async function ajouterMessage(nom, email, message) {
  await addDoc(collection(db, "messages"), { nom, email, message, date: new Date() });
}

async function afficherMessages() {
  const tbody = document.getElementById("messageTable");
  tbody.innerHTML = "";
  const q = query(collection(db, "messages"), orderBy("date", "desc"));
  const snapshot = await getDocs(q);

  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    const row = tbody.insertRow();
    row.insertCell().textContent = data.nom;
    row.insertCell().textContent = data.email;
    row.insertCell().textContent = data.message;

    const actionsCell = row.insertCell();
    const editBtn = document.createElement("button");
    editBtn.textContent = "✏️";
    editBtn.addEventListener("click", () => {
      document.getElementById("name").value = data.nom;
      document.getElementById("email").value = data.email;
      document.getElementById("message").value = data.message;
      selectedId = docSnap.id;
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "🗑️";
    deleteBtn.addEventListener("click", async () => {
      if (confirm("Voulez-vous vraiment supprimer ce message ?")) {
        await deleteDoc(doc(db, "messages", docSnap.id));
        afficherMessages();
      }
    });

    actionsCell.appendChild(editBtn);
    actionsCell.appendChild(deleteBtn);
  });
}

/*Enregistrer les messages dans la BDD */
async function enregistrerMessage(e) {
  e.preventDefault();
  const nom = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const message = document.getElementById("message").value.trim();

  if (!nom || !email || !message) {
    alert("Merci de remplir tous les champs !");
    return;
  }

  if (selectedId) {
    await updateDoc(doc(db, "messages", selectedId), { nom, email, message });
    selectedId = null;
  } else {
    await ajouterMessage(nom, email, message);
  }

  document.getElementById("messageForm").reset();
  afficherMessages();
}

document.getElementById("messageForm").addEventListener("submit", enregistrerMessage);