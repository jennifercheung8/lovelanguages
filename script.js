let slideIndex = 0;
let slideIndex2 = 0;

const jenTitle = document.getElementById("jen-title");
const momTitle = document.getElementById("mom-title");

showSlides();
showSlides2();

function showSlides() {
  let i;
  let jenSlides = document.getElementsByClassName("jen-slider");
  for (i = 0; i < jenSlides.length; i++) {
    jenSlides[i].style.display = "none";
  }
  slideIndex++;
  if (slideIndex > jenSlides.length) {slideIndex = 1}
  jenSlides[slideIndex-1].style.display = "block";
}

function showSlides2() {
  let i;
  let momSlides = document.getElementsByClassName("mom-slider");
  for (i = 0; i < momSlides.length; i++) {
    momSlides[i].style.display = "none";
  }
  slideIndex2++;
  if (slideIndex2 > momSlides.length) {slideIndex2 = 1}
  momSlides[slideIndex2-1].style.display = "block";
}

jenTitle.addEventListener("mouseenter", showSlides);
momTitle.addEventListener("mouseenter", showSlides2);
