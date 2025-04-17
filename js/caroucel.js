let currentIndex = 0;
let isAnimating = false;

function moveSlide(step) {
    if (isAnimating) return;

    const slides = document.querySelectorAll('.carousel-slide');
    const totalSlides = slides.length;
    
    currentIndex += step;

    if (currentIndex < 0) {
        currentIndex = totalSlides - 1;
    } else if (currentIndex >= totalSlides) {
        currentIndex = 0;
    }

    const carousel = document.querySelector('.carousel');
    const offset = -currentIndex * 100;
    carousel.style.transform = `translateX(${offset}%)`;

    isAnimating = true;
}

function autoSlide() {
    setInterval(() => {
        if (!isAnimating) {
            moveSlide(1);
        }
    }, 15000);
}

document.querySelector('.carousel').addEventListener('transitionend', () => {
    isAnimating = false;
});

window.onload = autoSlide;
