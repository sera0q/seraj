// Student Submission Code
subs.push({
  id: Date.now().toString(36),
  name: studentName.value.trim(),
  email: studentEmail.value.trim(),
  passport: studentPassport.value.trim(),
  mcqScore,
  writingAnswer: writingAns,
  writingScore: null,
  videoUrl: videoUrlInput.value.trim() // Assuming there's an input for the video URL
});
localStorage.setItem('submissions', JSON.stringify(subs));

// Admin Table Rendering Code
function render(){
  const rows = document.getElementById('rows'); // assuming 'rows' is the table body

  rows.innerHTML = '';
  getSubs().forEach(sub => {
    const total = sub.writingScore == null ? '—' : sub.mcqScore + sub.writingScore;
    const wStat = sub.writingScore == null ? '⏳ not graded' : sub.writingScore + '/20';
    const vStat = sub.videoUrl ? `<button onclick="openVideo('${sub.videoUrl}')">View Video</button>` : '—';

    rows.insertAdjacentHTML('beforeend', `
      <tr>
        <td>${sub.name || '—'}</td>
        <td>${sub.email || '—'}</td>
        <td>${sub.passport || '—'}</td>
        <td>${sub.mcqScore}/26</td>
        <td>${wStat}</td>
        <td style="text-align:center">${vStat}</td>
        <td>${total}</td>
        <td><button onclick="openModal('${sub.id}')">Open</button></td>
      </tr>`);
  });
}

// Video Modal Code
function openVideo(videoUrl){
  const modal = document.createElement('div');
  modal.style.position = 'fixed';
  modal.style.top = 0;
  modal.style.left = 0;
  modal.style.width = '100%';
  modal.style.height = '100%';
  modal.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
  modal.style.display = 'flex';
  modal.style.justifyContent = 'center';
  modal.style.alignItems = 'center';

  const iframe = document.createElement('iframe');
  iframe.src = videoUrl;
  iframe.style.width = '80%';
  iframe.style.height = '80%';
  iframe.style.border = 'none';

  const closeBtn = document.createElement('button');
  closeBtn.textContent = 'Close';
  closeBtn.style.position = 'absolute';
  closeBtn.style.top = '10px';
  closeBtn.style.right = '10px';
  closeBtn.style.padding = '10px';
  closeBtn.style.background = '#e53935';
  closeBtn.style.color = 'white';
  closeBtn.style.border = 'none';
  closeBtn.style.cursor = 'pointer';

  closeBtn.addEventListener('click', () => {
    document.body.removeChild(modal);
  });

  modal.appendChild(iframe);
  modal.appendChild(closeBtn);
  document.body.appendChild(modal);
}

// Generate PIN Code
const pinDisplay = document.getElementById('pinDisplay'); // span to show code
const genBtn = document.getElementById('genBtn'); // "Generate" button

function makePin() {
  const pin = String(Math.floor(100000 + Math.random() * 900000)); // Generate 6-digit PIN
  const expires = Date.now() + 30 * 60 * 1000; // 30 minutes expiry time
  
  // Store PIN and expiry in localStorage
  localStorage.setItem('examPin', JSON.stringify({ pin, expires }));

  console.log("Generated PIN: ", pin);
  startPinCountdown(); // Start countdown
}

genBtn.addEventListener('click', () => {
  const pin = String(Math.floor(100000 + Math.random() * 900000)); // 6-digit
  const life = 30 * 60 * 1000; // 30 minutes
  const store = { pin, expires: Date.now() + life };

  localStorage.setItem('examPin', JSON.stringify(store));
  pinDisplay.textContent = pin; // show teacher
  startCountdown(life); // your existing timer function
});
