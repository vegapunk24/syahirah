const book = document.querySelector(".book");
const foldedContent = document.querySelector(".fold--2");
const toggleButton = document.querySelector(".openBtn");
const toggleButtonText = document.querySelector(".openBtn__text");
const bgAudio = document.getElementById("bgAudio");
const previewModal = document.getElementById("previewModal");
const previewOpenButton = document.querySelector("[data-open-preview]");
const previewCloseButtons = document.querySelectorAll("[data-close-preview]");
const daysCounter = document.querySelector("[data-days-counter]");
const daysSinceValue = document.querySelector("[data-days-since]");
const audioPlaylist = bgAudio?.dataset.songs
  ?.split(",")
  .map((song) => song.trim())
  .filter(Boolean) ?? [];

let hideButtonTimeoutId = null;
let hasStartedAudio = false;
let isOpen = false;
let isAnimating = false;
let currentSongIndex = -1;
const OPEN_ANIMATION_MS = 2300;
const CLOSE_ANIMATION_MS = 2300;

const getRandomSongIndex = () => {
  if (audioPlaylist.length === 0) {
    return -1;
  }

  if (audioPlaylist.length === 1) {
    return 0;
  }

  let nextIndex = currentSongIndex;
  while (nextIndex === currentSongIndex) {
    nextIndex = Math.floor(Math.random() * audioPlaylist.length);
  }

  return nextIndex;
};

const setAudioTrack = (trackIndex) => {
  if (!bgAudio || trackIndex < 0 || !audioPlaylist[trackIndex]) {
    return false;
  }

  currentSongIndex = trackIndex;
  bgAudio.src = audioPlaylist[trackIndex];
  bgAudio.load();
  return true;
};

const queueRandomTrack = () => {
  const nextTrackIndex = getRandomSongIndex();
  return setAudioTrack(nextTrackIndex);
};

const updateDaysSinceCounter = () => {
  if (!daysCounter || !daysSinceValue) {
    return;
  }

  const startDateValue = daysCounter.dataset.startDate;
  if (!startDateValue) {
    return;
  }

  const [year, month, day] = startDateValue.split("-").map(Number);
  const startDate = new Date(year, month - 1, day);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const daysElapsed = Math.max(0, Math.floor((today - startDate) / 86400000));
  const formattedValue = new Intl.NumberFormat().format(daysElapsed);

  daysSinceValue.textContent = formattedValue;
  daysCounter.setAttribute("aria-label", `Loving you for ${formattedValue} days since 13 January 2026`);
};

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

  if (!bgAudio.getAttribute("src") && !queueRandomTrack()) {
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

const setPreviewModalState = (openState) => {
  if (!previewModal) {
    return;
  }

  if (openState) {
    previewModal.hidden = false;
    // Wait one frame so opacity transition runs from 0 to 1.
    window.requestAnimationFrame(() => {
      previewModal.classList.add("is-open");
      previewModal.setAttribute("aria-hidden", "false");
    });
    document.body.style.overflow = "hidden";
    return;
  }

  previewModal.classList.remove("is-open");
  previewModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  window.setTimeout(() => {
    if (!previewModal.classList.contains("is-open")) {
      previewModal.hidden = true;
    }
  }, 230);
};

if (book && toggleButton) {
  setBookState(false);
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      book.classList.remove("is-initializing");
    });
  });

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

if (bgAudio && audioPlaylist.length > 0) {
  queueRandomTrack();
  bgAudio.addEventListener("ended", async () => {
    if (!queueRandomTrack()) {
      return;
    }

    try {
      await bgAudio.play();
    } catch (error) {
      console.warn("Audio playback failed:", error);
    }
  });
}

if (previewOpenButton && previewModal) {
  previewOpenButton.addEventListener("click", (event) => {
    event.stopPropagation();
    setPreviewModalState(true);
  });
}

if (previewCloseButtons.length > 0) {
  previewCloseButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setPreviewModalState(false);
    });
  });
}

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && previewModal?.classList.contains("is-open")) {
    setPreviewModalState(false);
  }
});

updateDaysSinceCounter();
