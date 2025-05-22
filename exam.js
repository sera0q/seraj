let timer = null;
let timeRemaining = 50 * 60;
let mediaStream = null, mediaRecorder = null, chunks = [], videoBlob = null;

function formatTime(sec) {
  const m = String(Math.floor(sec / 60)).padStart(2, "0");
  const s = String(sec % 60).padStart(2, "0");
  return `${m}:${s}`;
}

function startTimer() {
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
  document.querySelectorAll('.section').forEach(s => s.classList.add('hidden'));
  const section = document.getElementById(id);
  if (section) section.classList.remove('hidden');
  const container = document.getElementById('all-content');
  if (container) container.scrollTo({ top: 0, behavior: 'smooth' });
  else window.scrollTo({ top: 0, behavior: 'smooth' });
}

function startReading() { enableExamLock(); show("reading-section"); startTimer(); }
function backToIntro() { show("intro-section"); resetTimer(); }
function goToGrammar() { show("grammar-section"); }
function goToReading() { show("reading-section"); }
function goToWriting() { show("writing-section"); }
function goToVideo() { show("video-section"); }

function gradeMCQ() {
  const ANSWER_KEY = {
    q1: "a", q2: "b"
  };
  let correct = 0;
  Object.entries(ANSWER_KEY).forEach(([name, correctAnswer]) => {
    const chosen = document.querySelector(`input[name="${name}"]:checked`);
    if (chosen && chosen.value === correctAnswer) correct++;
  });
  window.mcqScore = correct;
  window.mcqTotal = Object.keys(ANSWER_KEY).length;
}

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
    setTimeout(() => { if (mediaRecorder?.state === 'recording') stopRecording(); }, 60000);
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
  playback.src = URL.createObjectURL(videoBlob);
  playback.classList.remove('hidden');
  redoBtn.disabled = false;
}

function redoRecording() {
  playback.classList.add('hidden');
  playback.src = '';
  videoBlob = null;
  startBtn.disabled = false;
  redoBtn.disabled = true;
}

async function finishExam() {
  gradeMCQ();
  const studentId = localStorage.getItem("studentId");
  const studentInfo = JSON.parse(localStorage.getItem("currentStudent") || '{}');
  if (!studentId) {
    alert("Student ID missing. Please restart.");
    return;
  }
  const writingAns = document.querySelector("textarea")?.value || '';
  let videoUrl = null;

  try {
    if (videoBlob) {
      const formData = new FormData();
      formData.append("file", videoBlob);
      formData.append("upload_preset", "exam_videos");
      formData.append("cloud_name", "dihabha4b");
      const res = await fetch("https://api.cloudinary.com/v1_1/dihabha4b/video/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!data.secure_url) throw new Error("Upload failed");
      videoUrl = data.secure_url;
    }

    await db.collection("students").doc(studentId).set({
      ...studentInfo,
      mcqScore: window.mcqScore || 0,
      writingAnswer: writingAns,
      videoUrl,
      submittedAt: firebase.firestore.Timestamp.now()
    }, { merge: true });

    alert("✅ Exam submitted successfully!");
    window.location.href = "end.html";
  } catch (err) {
    console.error("Submission error:", err);
    alert("Something went wrong during submission.");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const finishBtn = document.getElementById("finishBtn");
  if (finishBtn) finishBtn.addEventListener("click", finishExam);
});
