import { auth, db } from "./firebase.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const selectedRole = document.getElementById("role").value;

        try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            const userData = userSnap.data();
            const dbRole = userData.role;

            // Dono ko lowercase karke check karein taaki mismatch na ho
            if (dbRole.toLowerCase() === selectedRole.toLowerCase()) {
                alert(`Success! Logging in as ${dbRole}`);

                // Redirection Logic
                if (dbRole.toLowerCase() === "admin") {
                    window.location.href = "admin.html";
                } else if (dbRole.toLowerCase() === "contractor") {
                    window.location.href = "contractor.html";
                }
            } else {
                alert(`Role Mismatch! DB says: ${dbRole}`);
                await auth.signOut();
            }
        } else {
            alert("User Data missing in Firestore!");
        }

    } catch (error) {
        console.error("Critical Error:", error);
        alert("Error: " + error.message);
    }

       
    });
}
