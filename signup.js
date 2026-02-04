import { auth, db } from "./firebase.js";
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { setDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const signupForm = document.getElementById("signupForm");

signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("signupEmail").value.trim();
    const password = document.getElementById("signupPassword").value;

    try {
        // 1. Firebase Auth mein account banana
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 2. Firestore mein user ka 'contractor' role save karna
        // Ye wahi 'users' collection hai jo aapke screenshot mein dikh raha hai
        await setDoc(doc(db, "users", user.uid), {
            email: email,
            role: "contractor", // Fix role for this page
            wallet: ""
        });

        alert("Contractor Account Created Successfully!");
        window.location.href = "login.html";

    } catch (error) {
        console.error("Signup Error:", error);
        alert("Error: " + error.message);
    }
});