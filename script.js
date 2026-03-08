const booklet = document.querySelector(".booklet");
const toggleButton = document.querySelector(".openBtn");
const bgAudio = document.getElementById("bgAudio");

let hideButtonTimeoutId = null;
let hasStartedAudio = false;

const animateButton = () => {
  toggleButton.classList.add("hide");

  window.clearTimeout(hideButtonTimeoutId);
  hideButtonTimeoutId = window.setTimeout(() => {
    toggleButton.classList.remove("hide");
  }, 1200);
};

const startAudio = async () => {
  if (!bgAudio || hasStartedAudio) {
    return;
  }

  try {
    await bgAudio.play();
    hasStartedAudio = true;
  } catch (error) {
    console.warn("Audio playback failed:", error);
  }
};

if (booklet && toggleButton) {
  toggleButton.addEventListener("click", async () => {
    animateButton();
    booklet.classList.toggle("open");
    await startAudio();
  });
}
