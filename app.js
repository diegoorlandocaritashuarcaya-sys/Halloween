// Intro loader
let progress = 0;
const loader = document.querySelector("#loader");
const bar = document.querySelector("#loadbar");
const pct = document.querySelector("#loadpct");
const loaderTimer = setInterval(() => {
  progress = Math.min(100, progress + Math.ceil(Math.random() * 13));
  bar.style.width = progress + "%";
  pct.textContent = String(progress).padStart(2, "0") + "%";
  if (progress >= 100) {
    clearInterval(loaderTimer);
    setTimeout(() => loader.classList.add("done"), 350);
  }
}, 100);

// Sound design: actual female terror scream (CC0) + a locally generated bass impact.
// The scream is hosted by SFXMint; internet access is required for this sound.
const scareAudio = new Audio("https://sfxmint.com/dl/female-scream-04.mp3");
scareAudio.preload = "auto";
scareAudio.volume = 0.92;

function playScareSound() {
  try {
    scareAudio.pause();
    scareAudio.currentTime = 0;
    const playback = scareAudio.play();
    if (playback && typeof playback.catch === "function") {
      playback.catch(() => {}); // If external audio is blocked, keep the visual scare; no fake scream.
    }
  } catch (error) {
    // Keep the visual scare if audio is unavailable.
  }
  playBassImpact();
}

function playBassImpact() {
  let ctx;
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    ctx = new AudioCtx();
    const now = ctx.currentTime;
    const bass = ctx.createOscillator();
    const gain = ctx.createGain();
    bass.type = "sine";
    bass.frequency.setValueAtTime(92, now);
    bass.frequency.exponentialRampToValueAtTime(36, now + 0.58);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.32, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.72);
    bass.connect(gain);
    gain.connect(ctx.destination);
    bass.start(now);
    bass.stop(now + 0.75);
    bass.onended = () => ctx.close();
  } catch (error) {
    if (ctx && ctx.state !== "closed") ctx.close().catch(() => {});
  }
}

// Jumpscare: a brief black pause builds tension; the apparition then lunges in.
const scare = document.querySelector("#jumpscare");
const openScare = document.querySelector("#openScare");
const closeScareButton = document.querySelector("#closeScare");
let scareTimeout;
let impactTimeout;
let previousFocus = null;
function closeScare() {
  clearTimeout(scareTimeout);
  clearTimeout(impactTimeout);
  scare.classList.remove("show", "hit");
  scare.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  if (previousFocus && typeof previousFocus.focus === "function") previousFocus.focus();
}
openScare.addEventListener("click", () => {
  clearTimeout(scareTimeout);
  clearTimeout(impactTimeout);
  previousFocus = openScare;
  scare.classList.remove("hit");
  scare.classList.add("show");
  scare.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  // Pause in total darkness before the sudden image and sound.
  impactTimeout = setTimeout(() => {
    scare.classList.add("hit");
    playScareSound();
  }, 720);
  scareTimeout = setTimeout(closeScare, 4300);
});
closeScareButton.addEventListener("click", closeScare);
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && scare.classList.contains("show")) closeScare();
});

// Small visual delay on the gallery cards.
if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  document.querySelectorAll(".polaroid").forEach((card, i) => {
    card.style.transitionDelay = (i * 35) + "ms";
  });
}
