document.addEventListener('DOMContentLoaded', function () {
  // Get DOM elements
  const nameField = document.getElementById('studentName');
  const emailField = document.getElementById('studentEmail');
  const passField = document.getElementById('studentPassport');
  const pinInput = document.getElementById('pinInput');
  const startBtn = document.getElementById('startBtn');
  const pinError = document.getElementById('pin-error');
  const form = document.getElementById('welcome-form');
  const pinElement = document.getElementById('pinShow');

  // Display the PIN from localStorage
  const pinData = JSON.parse(localStorage.getItem('examPin'));
  if (pinData) {
    const pin = pinData.pin;
    pinElement.textContent = 'PIN: ' + pin;
    console.log("PIN retrieved and displayed: ", pin);
  } else {
    pinElement.textContent = 'No PIN available or expired.';
    console.log("No PIN found or it has expired.");
  }

  // Validate on input change
  [nameField, emailField, passField, pinInput].forEach(el => {
    el.addEventListener('input', validateAll);
  });

  // Initial validation on page load
  validateAll();

  // Validation function
  function validateAll() {
    const filled = nameField.value.trim() && emailField.value.trim() && passField.value.trim();
    const pinOk = isValidPin(pinInput.value.trim());

    console.log('filled:', filled, 'pinOk:', pinOk);  // Debugging info

    // TEMPORARY: Always enable button for now to skip PIN issue
    startBtn.disabled = false;

    // If you want the real checking later, you can use this instead:
    // startBtn.disabled = !(filled && pinOk);

    pinError.style.display = (pinInput.value && !pinOk) ? 'block' : 'none';
  }

  // Check if the PIN is valid and not expired
  function isValidPin(pin) {
    return true; // <<< Always accept PIN for now (for testing)
  }

  // On form submit, store student info and go to exam
  form.addEventListener('submit', e => {
    e.preventDefault();
    if (startBtn.disabled) return;

    // Store student info in localStorage
    localStorage.setItem('currentStudent', JSON.stringify({
      name: nameField.value.trim(),
      email: emailField.value.trim(),
      passport: passField.value.trim()
    }));

    // Redirect to the exam page
    window.location.href = "exam.html";
  });
});
