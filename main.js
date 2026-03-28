const songs = [
    {
        file: "music/wave-to-earth.mp3",
        title: "Love.",
        author: "wave to earth",
        cover: "img/cover1.jpg",
        start: "03:39"
    },
    {
        file: "music/song2.mp3",
        title: "Until I Found You",
        author: "Stephen Sanchez",
        cover: "cover2.png",
        start: "00:00"
    },
    {
        file: "music/song3.mp3",
        title: "Yellow",
        author: "Coldplay",
        cover: "cover3.png",
        start: "00:00"
    }
];

let currentSongIndex = 0;
let isPlaying = false;
let currentStartTime = 0;
let hasAppliedStartTime = false;

const audioPlayer = document.getElementById("audioPlayer");
const songTitle = document.getElementById("songTitle");
const songAuthor = document.getElementById("songAuthor");
const songCover = document.getElementById("songCover");
const playPauseBtn = document.getElementById("playPauseBtn");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const progressContainer = document.getElementById("progressContainer");
const progressBar = document.getElementById("progressBar");
const currentTimeEl = document.getElementById("currentTime");
const durationTimeEl = document.getElementById("durationTime");
const playIcon = playPauseBtn.querySelector(".play-icon");
const pauseIcon = playPauseBtn.querySelector(".pause-icon");

function timeStringToSeconds(timeString) {
    if (!timeString) return 0;

    const parts = timeString.split(":").map(Number);

    if (parts.length === 2) {
        return (parts[0] * 60) + parts[1];
    }

    if (parts.length === 3) {
        return (parts[0] * 3600) + (parts[1] * 60) + parts[2];
    }

    return 0;
}

function formatTime(time) {
    if (isNaN(time) || time < 0) return "00:00";

    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);

    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function updatePlayPauseIcon() {
    playIcon.style.display = isPlaying ? "none" : "inline-flex";
    pauseIcon.style.display = isPlaying ? "inline-flex" : "none";
}

function applySongStartTime() {
    if (hasAppliedStartTime) return;

    const song = songs[currentSongIndex];
    currentStartTime = timeStringToSeconds(song.start || "00:00");

    if (!isNaN(audioPlayer.duration) && currentStartTime > audioPlayer.duration) {
        currentStartTime = 0;
    }

    audioPlayer.currentTime = currentStartTime;
    currentTimeEl.textContent = formatTime(currentStartTime);

    if (!isNaN(audioPlayer.duration)) {
        durationTimeEl.textContent = formatTime(audioPlayer.duration);

        const initialProgressPercent = (currentStartTime / audioPlayer.duration) * 100;
        progressBar.style.width = `${Math.max(0, Math.min(initialProgressPercent, 100))}%`;
    }

    hasAppliedStartTime = true;
}

function loadSong(index) {
    const song = songs[index];

    songTitle.textContent = song.title;
    songAuthor.textContent = song.author;
    songCover.src = song.cover;
    songCover.alt = song.title;

    progressBar.style.width = "0%";
    currentTimeEl.textContent = "00:00";
    durationTimeEl.textContent = "00:00";

    currentStartTime = timeStringToSeconds(song.start || "00:00");
    hasAppliedStartTime = false;

    audioPlayer.pause();
    audioPlayer.src = song.file;
    audioPlayer.load();
    audioPlayer.volume = 0.6;
}

async function playSong() {
    try {
        audioPlayer.volume = 0.6;

        if (audioPlayer.readyState >= 1 && !hasAppliedStartTime) {
            applySongStartTime();
        }

        await audioPlayer.play();

        isPlaying = true;
        updatePlayPauseIcon();
    } catch (error) {
        isPlaying = false;
        updatePlayPauseIcon();
        console.log("Playback blocked or failed.", error);
    }
}

function pauseSong() {
    audioPlayer.pause();
    isPlaying = false;
    updatePlayPauseIcon();
}

function togglePlayPause() {
    if (isPlaying) {
        pauseSong();
    } else {
        playSong();
    }
}

function nextSong() {
    currentSongIndex = (currentSongIndex + 1) % songs.length;
    loadSong(currentSongIndex);
    playSong();
}

function prevSong() {
    currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
    loadSong(currentSongIndex);
    playSong();
}

playPauseBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    togglePlayPause();
});

prevBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    prevSong();
});

nextBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    nextSong();
});

audioPlayer.addEventListener("loadedmetadata", () => {
    audioPlayer.volume = 0.6;
    applySongStartTime();
});

audioPlayer.addEventListener("canplay", () => {
    audioPlayer.volume = 0.6;
});

audioPlayer.addEventListener("timeupdate", () => {
    const duration = audioPlayer.duration;
    const currentTime = audioPlayer.currentTime;

    currentTimeEl.textContent = formatTime(currentTime);

    if (!isNaN(duration) && duration > 0) {
        durationTimeEl.textContent = formatTime(duration);

        const progressPercent = (currentTime / duration) * 100;
        progressBar.style.width = `${Math.max(0, Math.min(progressPercent, 100))}%`;
    }
});

audioPlayer.addEventListener("ended", () => {
    nextSong();
});

progressContainer.addEventListener("click", (e) => {
    const duration = audioPlayer.duration;
    if (isNaN(duration) || duration <= 0) return;

    const rect = progressContainer.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const percent = clickX / width;

    audioPlayer.currentTime = percent * duration;
});

loadSong(currentSongIndex);
updatePlayPauseIcon();