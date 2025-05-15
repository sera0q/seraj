/*****  GLOBAL TIMER  *****/
let timer = null;
let timeRemaining = 50 * 60;            // 50 minutes in seconds

function formatTime(sec) {
  const m = String(Math.floor(sec / 60)).padStart(2, "0");
  const s = String(sec % 60).padStart(2, "0");
  return `${m}:${s}`;
}

function startTimer() {
  // ensure we never create two timers
  if (timer) return;
  timer = setInterval(() => {
    timeRemaining--;
    document.getElementById("timer").textContent = `⏳ ${formatTime(timeRemaining)}`;
    if (timeRemaining <= 0) {
      clearInterval(timer);
      timer = null;
      finishExam();
    }
  }, 1000);
}

function resetTimer() {
  clearInterval(timer);
  timer = null;
  timeRemaining = 50 * 60;
  document.getElementById("timer").textContent = "⏳ 50:00";
}

function show(id) {
  // 1. Hide all sections first
  document.querySelectorAll('.section').forEach(section => {
    section.classList.add('hidden');
  });

  // 2. Show the targeted section
  const section = document.getElementById(id);
  section.classList.remove('hidden');

  // 3. Scroll to the top (depending where your sections live)
  const container = document.getElementById('all-content');
  if (container) {
    container.scrollTo({ top: 0, behavior: 'smooth' });
  } else {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}



/*****  BUTTON HANDLERS  *****/
function startReading(){
  enableExamLock();          // <-- add this line
  show("reading-section");
  startTimer();
}



function backToIntro() {
  show("instructions-box");
  resetTimer();
}

function goToGrammar()   { show("grammar-section"); }
function goToReading()   { show("reading-section"); }
function goToWriting()   { show("writing-section"); }
function goToVideo()     { show("video-section");   }

function finishExam() {
  // Show a message to the user on the page instead of using alert
  const messageDiv = document.createElement('div');
  messageDiv.textContent = "Thank you for completing the test! You will be redirected shortly.";
  messageDiv.style.fontSize = "20px";
  messageDiv.style.textAlign = "center";
  messageDiv.style.marginTop = "20px";
  document.body.appendChild(messageDiv);  // Or append it to a specific section of your page

  // Reset the timer
  resetTimer();

  // Redirect to the end page after a short delay (2 seconds)
  setTimeout(() => {
    window.location.href = "end.html";  // Adjust the path if needed
  }, 2000);  // 2000ms = 2 seconds
}


/*  ----  expose handlers to HTML  ----
    If you declared the functions AFTER <script src="main.js">,
    the browser already sees them. No further work needed.     */

    // exam.js
const subs  = JSON.parse(localStorage.getItem('submissions') || '[]');

/* when exam is finished */
const subs = JSON.parse(localStorage.getItem('submissions') || '[]');

subs.push({
  id            : Date.now().toString(36),
  ...(JSON.parse(localStorage.getItem('currentStudent') || '{}')),
  mcqScore      : window.mcqScore || 0,     // auto‑graded score
  writingAnswer : writingAns      || '',    // the textarea text
  writingScore  : null,                     // teacher will grade later
  videoUrl      : null                      // fill when you upload
});


function submitExam(){
  if (!videoBlob) {
    alert("Please record your video before submitting.");
    return;
  }

  const reader = new FileReader();
  reader.onloadend = function() {
    const base64Video = reader.result; // <- This is the video in Base64 string

    const examData = {
      name: document.getElementById('name').value,
      email: document.getElementById('email').value,
      answers: "Student answers here...",  // whatever you already collect
      video: base64Video
    };

    // Now send `examData` to your server/database
    fetch('/submit-exam', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(examData)
    })
    .then(res => res.json())
    .then(data => {
      alert("Exam submitted successfully!");
      // Redirect or thank you page
    })
    .catch(err => {
      console.error(err);
      alert("Failed to submit exam.");
    });
  };
  reader.readAsDataURL(videoBlob);
}
/*****  VIDEO RECORDING  *****/
let mediaStream = null;
let mediaRecorder = null;
let chunks = [];
let videoBlob = null;

// Initialize camera
async function initCamera() {
  if (mediaStream) return;  // Prevent re-requesting if already granted
  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    document.getElementById('preview').srcObject = mediaStream;
  } catch (e) {
    alert('Webcam/microphone access denied.');
  }
}

// Start recording
function startRecording() {
  initCamera().then(() => {
    chunks = [];
    mediaRecorder = new MediaRecorder(mediaStream, { mimeType: 'video/webm;codecs=vp9,opus' });

    mediaRecorder.ondataavailable = e => chunks.push(e.data);
    mediaRecorder.onstop = handleRecordingStop;
    
    mediaRecorder.start();

    // UI updates
    startBtn.disabled = true;
    stopBtn.disabled = false;
    redoBtn.disabled = true;

    // Auto-stop after 1 minute
    setTimeout(() => {
      if (mediaRecorder?.state === 'recording') stopRecording();
    }, 60000);
  });
}

// Stop recording
function stopRecording() {
  if (mediaRecorder?.state === 'recording') {
    mediaRecorder.stop();
    stopBtn.disabled = true;
  }
}

// Handle stop event
function handleRecordingStop() {
  videoBlob = new Blob(chunks, { type: 'video/webm' });

  // Preview playback
  const playback = document.getElementById('playback');
  playback.src = URL.createObjectURL(videoBlob);
  playback.classList.remove('hidden');

  redoBtn.disabled = false; // Allow re-recording
}

// Redo recording
function redoRecording() {
  const playback = document.getElementById('playback');
  playback.classList.add('hidden');
  playback.src = '';
  videoBlob = null;

  startBtn.disabled = false;
  redoBtn.disabled = true;
}

// Submit video (along with exam data)
function submitExam() {
  if (!videoBlob) {
    alert("Please record your video before submitting.");
    return;
  }

  const reader = new FileReader();
  reader.onloadend = function() {
    const base64Video = reader.result; // Video as Base64 string

    const examData = {
      name: document.getElementById('name').value,
      email: document.getElementById('email').value,
      answers: "Student answers here...",  // You can customize this
      video: base64Video
    };

    fetch('/submit-exam', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(examData)
    })
    .then(res => res.json())
    .then(data => {
      alert("Exam submitted successfully!");
      window.location.href = "end.html";  // Redirect after success
    })
    .catch(err => {
      console.error(err);
      alert("Failed to submit exam.");
    });
  };
  
  reader.readAsDataURL(videoBlob);
  localStorage.setItem('submissions', JSON.stringify(subs));

}
const student = {
  type: "submit",
  name: "Real Student",
  email: "student@example.com",
  passport: "L1234567",
  pin: "111111",
  mcqScore: 22,
  writingAnswer: "Test from real form",
  videoUrl: ""
};

