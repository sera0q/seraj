document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("welcome-form");
  const pinError = document.getElementById("pin-error");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
  
    const name = document.getElementById("studentName").value.trim();
    const passport = document.getElementById("studentPassport").value.trim();
    const email = document.getElementById("studentEmail").value.trim();
    const code = document.getElementById("pinInput").value.trim();
  
    if (!name || !passport || !email || !code) {
      alert("Please fill in all fields.");
      return;
    }
  
    try {
      const pinDoc = await db.collection("accessPins").doc(code).get({ source: "server" });
  
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
  
      // Optional: Prevent same person (email) from using PIN again
      const existingStudent = await db.collection("students")
        .where("pin", "==", code)
        .where("email", "==", email)
        .get();
  
      if (!existingStudent.empty) {
        pinError.style.display = "block";
        pinError.textContent = "This email has already used this PIN.";
        return;
      }
  
      // Hide error
      pinError.style.display = "none";
  
      // Save new student
      const newStudentRef = await db.collection("students").add({
        name,
        passport,
        email,
        pin: code,
        startTime: firebase.firestore.Timestamp.now()
      });
  
      // Store student ID locally
      localStorage.setItem("studentId", newStudentRef.id);
      localStorage.setItem("currentStudent", JSON.stringify({
        name, passport, email, pin: code
      }));
  
      // Redirect
      window.location.href = "exam.html";
  
    } catch (err) {
      console.error("Error during login:", err);
      alert("Something went wrong. Please try again.");
    }
  });
  

const query = await db.collection("students")
  .where("pin", "==", pin)
  .where("email", "==", email) // optional: to make PIN + email unique
  .get();

if (query.empty) {
  alert("Invalid or expired code.");
  return;
}

// Use the first matching student
const doc = query.docs[0];
const studentId = doc.id;
localStorage.setItem("studentId", studentId);
localStorage.setItem("currentStudent", JSON.stringify(doc.data()));
window.location.href = "exam.html";
