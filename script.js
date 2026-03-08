const book = document.querySelector(".book");
const foldedContent = document.querySelector(".fold--2");
const toggleButton = document.querySelector(".openBtn");
const bgAudio = document.getElementById("bgAudio");

let hideButtonTimeoutId = null;
let hasStartedAudio = false;
let isOpen = false;
let isAnimating = false;

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

    isAnimating = true;
    animateButton();
    setBookState(!isOpen);
    void startAudio();

    window.setTimeout(() => {
      isAnimating = false;
    }, 2300);
  });
}
