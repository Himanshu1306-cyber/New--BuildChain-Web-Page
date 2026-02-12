import { auth, db } from "./firebase.js";
import { signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { collection, addDoc, getDocs, where, query, orderBy, limit, serverTimestamp, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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
    const milestone = document.getElementById('milestoneStatus').value; // Naya milestone read karein

    if(!projectName || !materialInfo || !workerCount || !milestone) {
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
            milestone: parseInt(milestone), 
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
    
    // Milestone ke liye ek chota progress bar style
    const milestoneUI = `
        <div style="width: 100%; background: #333; border-radius: 10px; height: 10px; margin-top: 5px;">
            <div style="width: ${d.milestone}%; background: #ffa500; height: 100%; border-radius: 10px;"></div>
        </div>
        <small>${d.milestone}% Done</small>
    `;

    rows += `
        <tr>
            <td>${date}</td>
            <td>${d.projectName || 'Jasper'}</td>
            <td>${d.materialInfo}</td>
            <td>${d.workerCount}</td>
            <td>${milestoneUI}</td> <td>${d.hash ? d.hash.substring(0, 10) + '...' : '0xba27020e...'}</td>
            <td>${d.status || 'Verified'}</td>
            <td>
        <a href="#" onclick="openUpdateModal('${doc.id}', '${d.milestone || 0}')" style="color: #f39c12; text-decoration: none; font-weight: bold;">
            Update ✏️
        </a>
    </td>
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
// Modal kholne ke liye function
window.openUpdateModal = (id, currentMilestone) => {
    document.getElementById('editDocId').value = id;
    document.getElementById('newMilestoneStatus').value = currentMilestone;
    document.getElementById('updateMilestoneModal').style.display = 'block';
    document.getElementById('modalOverlay').style.display = 'block';
};

// Modal band karne ke liye function
window.closeUpdateModal = () => {
    document.getElementById('updateMilestoneModal').style.display = 'none';
    document.getElementById('modalOverlay').style.display = 'none';
};

// Firestore mein data update karne ke liye function
window.saveNewProgress = async () => {
    const docId = document.getElementById('editDocId').value;
    const newProgress = document.getElementById('newMilestoneStatus').value;

    try {
        // Firebase Firestore update command
        const projectRef = doc(db, "projects", docId);
        await updateDoc(projectRef, {
            milestone: parseInt(newProgress),
            lastUpdated: serverTimestamp() // Track karne ke liye kab update hua
        });

        alert("Progress Updated! Admin ab naya status dekh sakta hai.");
        window.location.reload(); // Page refresh karke changes dikhane ke liye
    } catch (error) {
        console.error("Update Error:", error);
        alert("Update fail ho gaya: " + error.message);
    }
};
