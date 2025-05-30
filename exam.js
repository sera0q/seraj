/*****  GLOBAL TIMER  *****/
let timer = null;
let timeRemaining = 50 * 60; // 50 minutes in seconds

function formatTime(sec) {
  const m = String(Math.floor(sec / 60)).padStart(2, "0");
  const s = String(sec % 60).padStart(2, "0");
  return `${m}:${s}`;
}

function startTimer() {
  if (timer) return; // prevent multiple timers
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
  document.querySelectorAll('.section').forEach(section => section.classList.add('hidden'));
  const section = document.getElementById(id);
  if (section) section.classList.remove('hidden');

  // Scroll top for UX
  const container = document.getElementById('all-content');
  if (container) container.scrollTo({ top: 0, behavior: 'smooth' });
  else window.scrollTo({ top: 0, behavior: 'smooth' });
}

/***** BUTTON HANDLERS *****/
function startReading(){
  enableExamLock(); // Fullscreen lock
  show("reading-section");
  startTimer();
}

function backToIntro() {
  show("intro-section"); // fixed from instructions-box to intro-section
  resetTimer();
}

function goToGrammar()   { show("grammar-section"); }
function goToReading()   { show("reading-section"); }
function goToWriting()   { show("writing-section"); }
function goToVideo()     { show("video-section"); }

  gradeMCQ(); // grade before finishing

  // Get answers now to capture user input at finish time
  const writingAns = document.querySelector('textarea')?.value || '';

  // Save submission locally
  const subs = JSON.parse(localStorage.getItem('submissions') || '[]');
  subs.push({
    id: Date.now().toString(36),
    ...(JSON.parse(localStorage.getItem('currentStudent') || '{}')),
    mcqScore: window.mcqScore || 0,
    writingAnswer: writingAns,
    writingScore: null,  // to be graded later by teacher
    videoUrl: null       // will update when upload is done
  });
  localStorage.setItem('submissions', JSON.stringify(subs));

  // Show thank you message
  const messageDiv = document.createElement('div');
  messageDiv.textContent = "Thank you for completing the test! You will be redirected shortly.";
  messageDiv.style.fontSize = "20px";
  messageDiv.style.textAlign = "center";
  messageDiv.style.marginTop = "20px";
  document.body.appendChild(messageDiv);

  resetTimer();

  // Redirect after 2 seconds
  setTimeout(() => {
    window.location.href = "end.html";
  }, 2000);


/***** MCQ GRADING FUNCTION (example) *****/
function gradeMCQ() {
  // This should calculate score based on your MCQ input
  // Replace with your actual logic if different
  const ANSWER_KEY = {
    q1: "a", q2: "b", /* etc. your key */
  };

  let correct = 0, total = 0;
  Object.entries(ANSWER_KEY).forEach(([name, right]) => {
    total++;
    const chosen = document.querySelector(`input[name="${name}"]:checked`);
    if (chosen && chosen.value === right) correct++;
  });
  window.mcqScore = correct;
  window.mcqTotal = total;
}

/***** VIDEO RECORDING *****/
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const redoBtn = document.getElementById('redoBtn');
const playback = document.getElementById('playback');


let mediaStream = null;
let mediaRecorder = null;
let chunks = [];
let videoBlob = null;

async function initCamera() {
  if (mediaStream) return;
  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    document.getElementById('preview').srcObject = mediaStream;
  } catch {
    alert('Webcam/microphone access denied.');
  }
}

function startRecording() {
  initCamera().then(() => {
    chunks = [];
    mediaRecorder = new MediaRecorder(mediaStream, { mimeType: 'video/webm;codecs=vp9,opus' });
    mediaRecorder.ondataavailable = e => chunks.push(e.data);
    mediaRecorder.onstop = handleRecordingStop;
    mediaRecorder.start();

    startBtn.disabled = true;
    stopBtn.disabled = false;
    redoBtn.disabled = true;

    setTimeout(() => {
      if (mediaRecorder?.state === 'recording') stopRecording();
    }, 60000);
  });
}

function stopRecording() {
  if (mediaRecorder?.state === 'recording') {
    mediaRecorder.stop();
    stopBtn.disabled = true;
  }
}

function handleRecordingStop() {
  videoBlob = new Blob(chunks, { type: 'video/webm' });
  const playback = document.getElementById('playback');
  playback.src = URL.createObjectURL(videoBlob);
  playback.classList.remove('hidden');
  redoBtn.disabled = false;
}

function redoRecording() {
  const playback = document.getElementById('playback');
  playback.classList.add('hidden');
  playback.src = '';
  videoBlob = null;

  startBtn.disabled = false;
  redoBtn.disabled = true;
}

/***** SUBMIT EXAM (optional if using server) *****/
async function finishExam() {
  gradeMCQ(); // score MCQs

  const writingAns = document.querySelector('textarea')?.value || '';
  const studentId = localStorage.getItem("studentId");

  if (!studentId) {
    alert("Student ID not found.");
    return;
  }

  let videoUrl = null;

  if (videoBlob) {
    // Upload to Cloudinary
    const formData = new FormData();
    formData.append("file", videoBlob);
    formData.append("upload_preset", "exam_videos");
    formData.append("cloud_name", "dihabha4b");

    try {
      const res = await fetch("https://api.cloudinary.com/v1_1/dihabha4b/video/upload", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      videoUrl = data.secure_url;
    } catch (err) {
      alert("Video upload failed.");
      console.error(err);
      return; // Stop if upload fails
    }
  }

  // Save to Firestore
if (useProxy) {
  // Use proxy for China users
  try {
    const res = await fetch("https://your-proxy.onrender.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentId,
        mcqScore: window.mcqScore || 0,
        writingAnswer: writingAns,
        videoUrl,
        studentInfo
      })
    });
    if (!res.ok) throw new Error("Proxy submit failed");
    alert("Exam submitted via proxy!");
    window.location.href = "end.html";
  } catch (err) {
    alert("Proxy submission failed.");
    console.error(err);
  }
} else {
  // Use Firebase for non-China
  await db.collection("students").doc(studentId).set({
    mcqScore: window.mcqScore || 0,
    writingAnswer: writingAns,
    videoUrl,
    submittedAt: firebase.firestore.Timestamp.now()
  }, { merge: true });

  alert("Exam submitted successfully!");
  window.location.href = "end.html";

}

const studentId = localStorage.getItem("studentId");
const studentInfo = JSON.parse(localStorage.getItem("currentStudent") || '{}');

import { detectChina } from './detectCountry.js';

let useProxy = false;

window.addEventListener("DOMContentLoaded", async () => {
  useProxy = await detectChina();
});


