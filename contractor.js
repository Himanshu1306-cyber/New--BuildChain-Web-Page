import { auth, db } from "./firebase.js";
import { signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { collection, addDoc, getDocs, where, query, orderBy, limit, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- LOGOUT LOGIC ---
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        signOut(auth).then(() => {
            window.location.href = "login.html";
        }).catch((error) => console.error("Logout Error:", error));
    });
}

// --- SUBMIT LOGIC (SIMULATED BLOCKCHAIN) ---
const projectForm = document.getElementById("projectForm");
// Agar aapne form tag use nahi kiya hai, toh button ki ID use karein:
const submitBtn = document.getElementById("submitProjectBtn");

const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    const projectName = document.getElementById("projectName").value;
    const materialInfo = document.getElementById("materialInfo").value;
    const workerCount = document.getElementById("workerCount").value;

    if(!projectName || !materialInfo || !workerCount) {
        alert("Saari details bhariye!");
        return;
    }

    try {
        console.log("Submitting...");
        
        // 1. Previous Hash fetch karein Firestore se
        const q = query(collection(db, "projects"), orderBy("timestamp", "desc"), limit(1));
        const querySnapshot = await getDocs(q);
        let prevHash = "0000000000000000"; 

        if (!querySnapshot.empty) {
            prevHash = querySnapshot.docs[0].data().blockchainHash;
        }

        // 2. Naya Random Hash generate karein (Simulation)
        const txHash = "0x" + Math.random().toString(16).slice(2, 10) + Math.random().toString(16).slice(2, 10);

        // 3. Firestore mein save karein
        await addDoc(collection(db, "projects"), {
            projectName: projectName,
            materialInfo: materialInfo,
            workers: parseInt(workerCount),
            blockchainHash: txHash,
            previousHash: prevHash,
            contractorEmail: auth.currentUser.email,
            status: "Pending",
            timestamp: serverTimestamp()
        });

        alert("Project Locked on Blockchain! Hash: " + txHash);
        window.location.reload();

    } catch (err) {
        console.error("Error details:", err);
        alert("Submission failed: " + err.message);
    }
};

// Dono tareeqon se bind kar dete hain taaki fail na ho
if (projectForm) {
    projectForm.addEventListener("submit", handleSubmit);
} else if (submitBtn) {
    submitBtn.addEventListener("click", handleSubmit);
}
// --- BHEJE GAYE TRANSACTIONS LOAD KARNE KE LIYE ---

async function loadMySubmissions() {
    const historyTable = document.querySelector(".history-container table tbody");
    if (!historyTable) return;

    // Sirf current user ka data filter karein
   // contractor.js mein isey update karein
const q = query(
    collection(db, "projects"), 
    where("contractorEmail", "==", auth.currentUser.email)
    // orderBy abhi ke liye hata diya taaki data turant dikhe
);

    const querySnapshot = await getDocs(q);
    let rows = "";

    querySnapshot.forEach((doc) => {
        const d = doc.data();
        const date = d.timestamp ? d.timestamp.toDate().toLocaleString() : "Pending...";
        
        rows += `
            <tr>
                <td>${date}</td>
                <td>${d.projectName}</td>
                <td>${d.materialInfo}</td>
                <td>${d.workers || 0}</td>
                <td style="font-family: monospace; font-size: 12px;">${d.blockchainHash.substring(0, 10)}...</td>
                <td><span class="status-badge ${d.status.toLowerCase()}">${d.status}</span></td>
            </tr>
        `;
    });

    historyTable.innerHTML = rows;
}

// Login hote hi data load karein
auth.onAuthStateChanged((user) => {
    if (user) {
        loadMySubmissions();
    }
});