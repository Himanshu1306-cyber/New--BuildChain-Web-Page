import { db } from "./firebase.js";
import { collection, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const tableBody = document.getElementById("publicTableBody");

if (tableBody) {
    const q = query(collection(db, "projects"), orderBy("createdAt", "desc"));
    onSnapshot(q, (snapshot) => {
        tableBody.innerHTML = "";
        snapshot.forEach((doc) => {
            const data = doc.data();
            tableBody.innerHTML += `
                <tr>
                    <td>${data.createdAt ? data.createdAt.toDate().toLocaleString() : 'Syncing...'}</td>
                    <td>${data["project name"]}</td>
                    <td>${data["materialinfo"]}</td>
                    <td><a href="https://sepolia.etherscan.io/tx/${data.blockchainHash}" target="_blank" style="color:cyan;">View Hash</a></td>
                    <td><span class="status">${data.status}</span></td>
                </tr>`;
        });
    });
}
