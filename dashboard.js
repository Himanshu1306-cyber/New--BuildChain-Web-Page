import { db } from "./firebase.js";
import { collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

async function loadPublicLedger() {
    const tableBody = document.getElementById("publicLedgerBody");
    const q = query(collection(db, "projects"), orderBy("timestamp", "desc"));
    const snap = await getDocs(q);
    
    let rows = "";
    snap.forEach(doc => {
        const d = doc.data();
        const date = d.timestamp ? d.timestamp.toDate().toLocaleString() : "Recently";
        const statusColor = d.status === "Verified" ? "#2ecc71" : "#f39c12";
        const milestoneVal = d.milestone || 0;
    const milestoneUI = `
        <div style="width: 100px; background: #222; border-radius: 5px; height: 10px; border: 1px solid #444; margin-bottom: 4px;">
            <div style="width: ${milestoneVal}%; background: #00ff88; height: 100%; border-radius: 4px;"></div>
        </div>
        <span style="font-size: 11px; color: #00ff88;">${milestoneVal}% Done</span>
    `;

        rows += `
            <tr>
                <td>${date}</td>
                <td>${d.projectName}</td>
                <td>${d.materialInfo}</td>
                <td>${d.workers || 0}</td>
               <td>
                <div style="width: 100px; background: #222; border-radius: 5px; height: 10px; border: 1px solid #444;">
                    <div style="width: ${milestoneVal}%; background: #00ff88; height: 100%; border-radius: 4px;"></div>
                </div>
                <span style="font-size: 11px; color: #00ff88;">${milestoneVal}% Done</span>
            </td>
            <td>
                
                    <button onclick="openPublicModal('${d.projectName}', '${d.materialInfo}', ${d.workers}, '${d.blockchainHash}', '${d.previousHash}', '${d.contractorEmail}')" 
                        style="background:none; border:none; color:#3498db; cursor:pointer; text-decoration:underline;">
                        View Hash
                    </button>
                </td>
                <td style="color:${statusColor}; font-weight:bold;">${d.status.toUpperCase()}</td>
            </tr>`;
    });
    tableBody.innerHTML = rows;
}

// Modal Functions
// dashboard.js ke end mein:
window.openPublicModal = (name, mat, work, hash, prev, email) => {
    document.getElementById("p-project").innerText = name;
    document.getElementById("p-material").innerText = mat;
    document.getElementById("p-workers").innerText = work;
    document.getElementById("p-hash").innerText = hash;
    
    // Naye fields set karein
    document.getElementById("p-prev").innerText = prev || "0000000000000000"; 
    document.getElementById("p-email").innerText = email || "Unknown Contractor";
    
    document.getElementById("publicModal").style.display = "flex";
};

window.closePublicModal = () => {
    document.getElementById("publicModal").style.display = "none";
};

loadPublicLedger();
