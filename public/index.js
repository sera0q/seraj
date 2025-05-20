document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("welcome-form");
  const pinError = document.getElementById("pin-error");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Get input values
    const name = document.getElementById("studentName").value.trim();
    const passport = document.getElementById("studentPassport").value.trim();
    const email = document.getElementById("studentEmail").value.trim();
    const code = document.getElementById("pinInput").value.trim();
    

    // Simple validation
    if (!name || !passport || !email || !code) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      // Validate PIN from Firestore
      const pinDoc = await db.collection("accessPins").doc(code).get();

      if (!pinDoc.exists) {
        pinError.style.display = "block";
        pinError.textContent = "Invalid PIN.";
        return;
      }

      const pinData = pinDoc.data();
      const now = new Date();

      if (pinData.expiresAt.toDate() < now) {
        pinError.style.display = "block";
        pinError.textContent = "PIN has expired.";
        return;
      }

      // Hide PIN error if valid
      pinError.style.display = "none";

// Save student info to Firestore
const newStudentRef = db.collection("students").doc(); // generate new doc with ID
await newStudentRef.set({
  name,
  passport,
  email,
  pin: code,
  startTime: firebase.firestore.Timestamp.now()
});

// Save the student ID locally for use in the exam page
localStorage.setItem("studentId", newStudentRef.id);

// Redirect to exam page
window.location.href = "exam.html";


      // Redirect to exam page with student ID in URL
      window.location.href = `exam.html?id=${newStudentRef.id}`;

    } catch (error) {
      console.error("Error validating PIN or saving student:", error);
      alert("An error occurred. Please try again later.");
    }
  });
});
