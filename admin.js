import { db, auth } from "./firebase.js";
import { collection, getDocs, query, orderBy, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

let workerChartInstance = null;
import { signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// Logout Logic
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        signOut(auth).then(() => {
            window.location.href = "login.html";
        }).catch((err) => console.error("Logout Error:", err));
    });
}
async function loadProjects() {
    const tableBody = document.getElementById("projectTableBody");
    tableBody.innerHTML = "<tr><td colspan='5'>Loading...</td></tr>";

    const q = query(collection(db, "projects"), orderBy("timestamp", "desc"));
    const querySnapshot = await getDocs(q);
    
    tableBody.innerHTML = "";
    const projectNames = [];
    const workerCounts = [];

    querySnapshot.forEach((doc) => {
        const data = doc.data();
        projectNames.push(data.projectName);
        workerCounts.push(data.workers || 0);

      // admin.js ke loadProjects function ke loop ke andar:
const d = doc.data();
const docId = doc.id; // Document ID zaroori hai
const isVerified = d.status === "Verified";

const row = `
    <tr>
        <td>${d.projectName}</td>
        <td>${d.workers || 0}</td>
        <td>
           
            <button class="hash-btn" 
                onclick="openModal('${d.projectName}', '${d.materialInfo}', ${d.workers}, '${d.blockchainHash}', '${d.previousHash}', '${d.contractorEmail}')">
                ${d.blockchainHash.substring(0,8)}...
            </button>
       
        </td>
        <td>
            <button class="approve-btn" 
                onclick="verifyProject('${docId}')" 
                style="background: ${isVerified ? '#2ecc71' : '#f39c12'}; cursor: ${isVerified ? 'default' : 'pointer'}"
                ${isVerified ? 'disabled' : ''}>
                ${isVerified ? 'Verified ✓' : 'Verify'}
            </button>
        </td>
    </tr>`;
tableBody.innerHTML += row;
    });

    renderChart(projectNames, workerCounts);
}

// Modal kholne ka function
// admin.js mein openModal ko aise update karein
window.openModal = (name, mat, work, hash, prev, email) => { // 'email' add kiya
    document.getElementById("m-project").innerText = name;
    document.getElementById("m-material").innerText = mat;
    document.getElementById("m-workers").innerText = work;
    document.getElementById("m-hash").innerText = hash;
    document.getElementById("m-prev").innerText = prev;
    document.getElementById("m-email").innerText = email || "N/A"; // Email set kiya
    document.getElementById("detailsModal").style.display = "flex";
};
// Chart.js Setup
function renderChart(labels, data) {
    const ctx = document.getElementById('workerChart').getContext('2d');
    if (workerChartInstance) workerChartInstance.destroy();

    workerChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Workers count',
                data: data,
                backgroundColor: '#f39c12'
            }]
        },
        options: { responsive: true, scales: { y: { beginAtZero: true } } }
    });
}
// --- Isko Line 68 ke niche add karein ---
window.verifyProject = async (docId) => {
    try {
        const projectRef = doc(db, "projects", docId);
        await updateDoc(projectRef, {
            status: "Verified"
        });
        alert("Project Verified Successfully! ✅");
        location.reload(); 
    } catch (err) {
        alert("Error verifying: " + err.message);
    }
};

loadProjects();