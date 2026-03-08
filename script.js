const book = document.querySelector(".book");
const foldedContent = document.querySelector(".fold--2");
const toggleButton = document.querySelector(".openBtn");
const toggleButtonText = document.querySelector(".openBtn__text");
const bgAudio = document.getElementById("bgAudio");

let hideButtonTimeoutId = null;
let hasStartedAudio = false;
let isOpen = false;
let isAnimating = false;
const OPEN_ANIMATION_MS = 2300;
const CLOSE_ANIMATION_MS = 2300;

const animateButton = () => {
  toggleButton.classList.add("hide");

  window.clearTimeout(hideButtonTimeoutId);
  hideButtonTimeoutId = window.setTimeout(() => {
    toggleButton.classList.remove("hide");
  }, 1400);
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

const setBookState = (openState) => {
  isOpen = openState;
  book.classList.toggle("is-open", isOpen);
  book.dataset.state = isOpen ? "open" : "closed";
  toggleButton.setAttribute("aria-pressed", String(isOpen));
  if (toggleButtonText) {
    toggleButtonText.textContent = isOpen ? "Flip Close" : "Flip Open";
  }
  toggleButton.setAttribute(
    "aria-label",
    isOpen ? "Close booklet and continue music" : "Open booklet and play music"
  );
  if (foldedContent) {
    foldedContent.setAttribute("aria-hidden", String(!isOpen));
  }
};

if (book && toggleButton) {
  setBookState(false);

  toggleButton.addEventListener("click", () => {
    if (isAnimating) {
      return;
    }

    const willOpen = !isOpen;
    isAnimating = true;
    animateButton();
    setBookState(willOpen);
    void startAudio();

    window.setTimeout(() => {
      isAnimating = false;
    }, willOpen ? OPEN_ANIMATION_MS : CLOSE_ANIMATION_MS);
  });
}
