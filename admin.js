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
    const projectProgress = [];

    querySnapshot.forEach((doc) => {
        const data = doc.data();
        projectNames.push(data.projectName);
        workerCounts.push(data.workers || 0);
        projectProgress.push(data.milestone || 0);

      // admin.js ke loadProjects function ke loop ke andar:
const d = doc.data();
const docId = doc.id; // Document ID zaroori hai
const isVerified = d.status === "Verified";

const row = `
    <tr>
        <td>${d.projectName}</td>
        <td>${d.workers || 0}</td>
        <td>
            <div style="width: 80px; background: #222; border-radius: 10px; height: 8px; border: 1px solid #444; margin-bottom: 4px;">
                <div style="width: ${d.milestone || 0}%; background: #f39c12; height: 100%; border-radius: 10px;"></div>
            </div>
            <span style="font-size: 10px; color: #f39c12;">${d.milestone || 0}% Complete</span>
        </td>
        <td>
          
<button class="hash-btn" onclick="openModal('${d.projectName}', '${d.materialInfo}', '${d.workers}', '${d.blockchainHash}', '${d.previousHash}', '${d.contractorEmail}')">
    ${d.blockchainHash ? d.blockchainHash.substring(0,8) : '0x...'}...
</button>
        </td>
        <td>
            <button class="approve-btn" 
                onclick="verifyProject('${docId}')"
                style="background: ${isVerified ? '#2ecc71' : '#f39c12'}; cursor: ${isVerified ? 'default' : 'pointer'};"
                ${isVerified ? 'disabled' : ''}>
                ${isVerified ? 'Verified ✓' : 'Verify'}
            </button>
        </td>
    </tr>
`;
tableBody.innerHTML += row;
    });

    renderChart(projectNames, projectProgress);
}

// Modal kholne ka function
// admin.js mein openModal ko aise update karein
// admin.js -> Line 72 ke paas
window.openModal = (name, mat, work, hash, prev, email) => {
    document.getElementById("m-project").innerText = name;
    document.getElementById("m-material").innerText = mat;
    document.getElementById("m-workers").innerText = work;
    document.getElementById("m-hash").innerText = hash;
    
    // Ye do lines fix karengi jo missing tha:
    document.getElementById("m-prev").innerText = prev || "First Block"; 
    document.getElementById("m-email").innerText = email || "Not Available";

    document.getElementById("detailsModal").style.display = "flex";
};
// Chart.js Setup
// admin.js -> Line 82
function renderChart(labels, data) {
    const ctx = document.getElementById('workerChart').getContext('2d');
    
    // Purane chart instance ko destroy karna zaroori hai
    if (window.workerChartInstance) {
        window.workerChartInstance.destroy();
    }

    window.workerChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Project Completion (%)', // Label badal dein
                data: data, // Ab yahan milestone ka data aayega
                backgroundColor: '#f39c12',
                borderRadius: 5
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100, // Kyunki progress 100% tak hoti hai
                    ticks: {
                        callback: function(value) { return value + '%'; }
                    }
                }
            }
        }
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
