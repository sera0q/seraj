document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("welcome-form");
  const pinError = document.getElementById("pin-error");

  const scriptURL = "https://script.google.com/macros/s/AKfycbyARBQN6BBUixxxG_OHwDL8IDaaE1sPmdSTSqM1b6s3JvcPEmgof9yO17DB6t8vpG_2nA/exec";

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("studentName").value.trim();
    const passport = document.getElementById("studentPassport").value.trim();
    const email = document.getElementById("studentEmail").value.trim();
    const pin = document.getElementById("pinInput").value.trim();

    try {
      const res = await fetch(scriptURL);
      const data = await res.json();

      const isValid = data.some(row => row.pin === pin);

      if (!isValid) {
        pinError.style.display = "block";
        return;
      }

      pinError.style.display = "none";

      const newStudent = {
        id: Date.now().toString(),
        name,
        passport,
        email,
        pin,
        startTime: new Date().toISOString()
      };

      await fetch(scriptURL, {
        method: "POST",
        body: JSON.stringify(newStudent),
        headers: {
          "Content-Type": "application/json"
        }
      });
      

      window.location.href = `exam.html?id=${newStudent.id}`;

    } catch (error) {
      console.error("Something went wrong:", error);
    }
  });
});
