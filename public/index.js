const nameInput = document.getElementById('studentName');
const emailInput = document.getElementById('studentEmail');
const passportInput = document.getElementById('studentPassport');
const pinInput = document.getElementById('pinInput');
const startBtn = document.getElementById('startBtn');
const pinError = document.getElementById('pin-error');

function validateAll() {
  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  const passport = passportInput.value.trim();
  const enteredPin = pinInput.value.trim();
  const savedPin = localStorage.getItem('examPin');

  if (name && email && passport && enteredPin === savedPin) {
    startBtn.disabled = false;
    pinError.style.display = "none";
  } else {
    startBtn.disabled = true;
    pinError.style.display = "block";
  }
}

// Event listeners
nameInput.addEventListener('input', validateAll);
emailInput.addEventListener('input', validateAll);
passportInput.addEventListener('input', validateAll);
pinInput.addEventListener('input', validateAll);

// On Start button click
startBtn.addEventListener('click', function () {
  localStorage.setItem('studentName', nameInput.value.trim());
  localStorage.setItem('studentEmail', emailInput.value.trim());
  localStorage.setItem('studentPassport', passportInput.value.trim());
  window.location.href = "exam.html"; // redirect to the exam
});
