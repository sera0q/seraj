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

if (videoBlob) {
  const formData = new FormData();
  formData.append("file", videoBlob);
  formData.append("upload_preset", "exam_videos");  // ✅ Must match your preset
  // Do NOT append cloud_name here, it's only needed in the API URL

  try {
    const response = await fetch("https://api.cloudinary.com/v1_1/dihabha4b/video/upload", {
      method: "POST",
      body: formData
    });

    const data = await response.json();
    console.log("Cloudinary upload result:", data);

    if (!data.secure_url) {
      alert("Upload failed: " + JSON.stringify(data));
      return;
    }

    const videoUrl = data.secure_url;

    // 🔐 Save to Firestore
    await db.collection("students").doc(studentId).set({
      videoUrl,
      submittedAt: firebase.firestore.Timestamp.now(),
      mcqScore: window.mcqScore || 0,
      writingAnswer: document.getElementById("writingAnswer").value || ""
    }, { merge: true });

    alert("✅ Exam submitted successfully!");
    window.location.href = "end.html";

  } catch (err) {
    console.error("Upload error:", err);
    alert("❌ Failed to upload video: " + err.message);
  }
}

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

