//audio api
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext();

//load sound
const audioElementRight = document.getElementById("rightAudio");
const trackRight = audioCtx.createMediaElementSource(audioElementRight);
const audioElementLeft = document.getElementById("leftAudio");
const trackLeft = audioCtx.createMediaElementSource(audioElementLeft);

const video = document.getElementById("episode1");
video.width = window.innerWidth;
video.height = window.innerHeight;

const back = document.getElementById("back");

back.addEventListener('click', function(){
	window.location.href = 'index.html';
});

// panning
const pannerOptions = {pan: 0};
const panner = new StereoPannerNode(audioCtx, pannerOptions);

//CONTROLS
// play pause audio & video
const playButton = document.querySelector('.playButton');
const playbackIcons = document.querySelectorAll('.playback-icons use');

playButton.addEventListener('click', function() {
	// check if context is in suspended state (autoplay policy)
	if (audioCtx.state === 'suspended') {
		audioCtx.resume();
	}

	if (this.dataset.playing === 'false') {
		video.play();
		audioElementRight.play();
    audioElementLeft.play();
		this.dataset.playing = 'true';
		console.log("working");

	// if track is playing pause it
	} else if (this.dataset.playing === 'true') {
		video.pause();
		audioElementRight.pause();
    audioElementLeft.pause();
		this.dataset.playing = 'false';
	}

	let state = this.getAttribute('aria-checked') === "true" ? true : false;
	this.setAttribute( 'aria-checked', state ? "false" : "true" );

}, false);

// updatePlayButton updates the playback icon and tooltip depending on the playback state
function updatePlayButton() {
  playbackIcons.forEach(icon => icon.classList.toggle('hidden'));
}

video.addEventListener('play', updatePlayButton);
video.addEventListener('pause', updatePlayButton);

// if track ends
audioElementRight.addEventListener('ended', () => {
	playButton.dataset.playing = 'false';
	playButton.setAttribute( "aria-checked", "false" );
}, false);

audioElementLeft.addEventListener('ended', () => {
	playButton.dataset.playing = 'false';
	playButton.setAttribute( "aria-checked", "false" );
}, false);

const gainNode = audioCtx.createGain();

//time
const timeElapsed = document.getElementById('time-elapsed');
const duration = document.getElementById('duration');

// formatTime takes a time length in seconds and returns the time in minutes and seconds
function formatTime(timeInSeconds) {
  const result = new Date(timeInSeconds * 1000).toISOString().substr(11, 8);

  return {
    minutes: result.substr(3, 2),
    seconds: result.substr(6, 2),
  };
};

// initializeVideo sets the video duration, and maximum value of the progressBar
function initializeVideo() {
  const videoDuration = Math.round(video.duration);
  const time = formatTime(videoDuration);
  duration.innerText = `${time.minutes}:${time.seconds}`;
  duration.setAttribute('datetime', `${time.minutes}m ${time.seconds}s`)
}

video.addEventListener('loadedmetadata', initializeVideo);

// updateTimeElapsed indicates how far through the video the current playback is
function updateTimeElapsed() {
  const time = formatTime(Math.round(video.currentTime));
  timeElapsed.innerText = `${time.minutes}:${time.seconds}`;
  timeElapsed.setAttribute('datetime', `${time.minutes}m ${time.seconds}s`)
}

video.addEventListener('timeupdate', updateTimeElapsed);

//progress bar
const progressBar = document.getElementById('progress-bar');
const seek = document.getElementById('seek');

function initializeVideo() {
  const videoDuration = Math.round(video.duration);
  seek.setAttribute('max', videoDuration);
  progressBar.setAttribute('max', videoDuration);
  const time = formatTime(videoDuration);
  duration.innerText = `${time.minutes}:${time.seconds}`;
  duration.setAttribute('datetime', `${time.minutes}m ${time.seconds}s`)
}

// updateProgress indicates how far through the video the current playback is by updating the progress bar
function updateProgress() {
  seek.value = Math.floor(video.currentTime);
  progressBar.value = Math.floor(video.currentTime);
}

video.addEventListener('timeupdate', updateProgress);

const seekTooltip = document.getElementById('seek-tooltip');
// updateSeekTooltip uses the position of the mouse on the progress bar to roughly work out what point in the video the user will skip to if the progress bar is clicked at that point
function updateSeekTooltip(event) {
  const skipTo = Math.round((event.offsetX / event.target.clientWidth) * parseInt(event.target.getAttribute('max'), 10));
  seek.setAttribute('data-seek', skipTo)
  const t = formatTime(skipTo);
  seekTooltip.textContent = `${t.minutes}:${t.seconds}`;
  const rect = video.getBoundingClientRect();
  seekTooltip.style.left = `${event.pageX - rect.left}px`;
}

seek.addEventListener('mousemove', updateSeekTooltip);


// skipAhead jumps to a different point in the video when the progress bar is clicked
function skipAhead(event) {
  const skipTo = event.target.dataset.seek ? event.target.dataset.seek : event.target.value;
  video.currentTime = skipTo;
	audioElementLeft.currentTime = skipTo;
	audioElementRight.currentTime = skipTo;
  progressBar.value = skipTo;
  seek.value = skipTo;
}

seek.addEventListener('input', skipAhead);

//hide controls

const videoControls = document.getElementById('video-controls');
const videoWorks = !!document.createElement('video').canPlayType;
const leftContainer = document.getElementById('left-container');
const rightContainer = document.getElementById('right-container');

if (videoWorks) {
  video.controls = false;
  videoControls.classList.remove('hidden');
}
// hideControls hides the video controls when not in use if the video is paused, the controls must remain visible
function hideControls() {
  if (video.paused) {
    return;
  }
  videoControls.classList.add('hide');
	leftContainer.style.opacity = 0;
	rightContainer.style.opacity = 0;
}

// showControls displays the video controls
function showControls() {
  videoControls.classList.remove('hide');
	leftContainer.style.opacity = 1;
	rightContainer.style.opacity = 1;
}

videoControls.addEventListener('mouseenter', showControls);
videoControls.addEventListener('mouseleave', hideControls);

back.addEventListener('mouseenter', showControls);
back.addEventListener('mouseleave', hideControls);

//Coordinates

let width = window.innerWidth-50;

function getCoordinates(e) {
  var x = e.clientX;
  var y = e.clientY;
  var coor = "Coordinates: (" + x + "," + y + ")";
  console.log(coor);
}

const mapRange = (inputLower, inputUpper, outputLower, outputUpper) => {
  const INPUT_RANGE = inputUpper - inputLower;
  const OUTPUT_RANGE = outputUpper - outputLower;
  return value => outputLower + (((value - inputLower) / INPUT_RANGE) * OUTPUT_RANGE || 0);
}

const BOUNDS = 1;
const update = ({ x }) => {
  const POS_X = mapRange(50, width, -BOUNDS, BOUNDS)(x);
  const volumeXRight = mapRange(50, width, 0, BOUNDS)(x);
  const volumeXLeft = mapRange(50, width, BOUNDS, 0)(x);
  panCoor = "Pan X Coordinates: (" + POS_X + ")";
  volCoorRight = "Vol X Right Coordinates: (" + volumeXRight + ")";
  volCoorLeft = "Vol X Left Coordinates: (" + volumeXLeft + ")";
  // console.log(panCoor);
  // console.log(volCoorRight);
  // console.log(volCoorLeft);

  panner.pan.value = POS_X;
  audioElementRight.volume = volumeXRight;
  audioElementLeft.volume = volumeXLeft;

  // gainNode.gain.value = volumeXRight;

  trackRight.connect(gainNode).connect(panner).connect(audioCtx.destination);
  trackLeft.connect(gainNode).connect(panner).connect(audioCtx.destination);
}

document.addEventListener('mousemove', update)
