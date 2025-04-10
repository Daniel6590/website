// --- Tab Functionaliteit ---
function openTab(evt, tabName) {
    let i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tab-content");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tab-button");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    const targetTab = document.getElementById(tabName);
    if (targetTab) {
        targetTab.style.display = "block";
    }
    // Make button active
    if (evt && evt.currentTarget) {
        evt.currentTarget.className += " active";
    } else {
        const activeButton = document.querySelector(`.tab-button[onclick*="'${tabName}'"]`);
        if (activeButton) activeButton.className += " active";
    }
}

// --- Dynamisch Jaar in Footer ---
function setFooterYear() {
    const yearElement = document.getElementById("year");
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
}

// --- Bereken Leeftijd ---
function calculateAge(birthDateString) {
    try {
        const parts = birthDateString.split('/');
        if (parts.length !== 3) return "...";
        const birthDay = parseInt(parts[0], 10);
        const birthMonth = parseInt(parts[1], 10) - 1;
        const birthYear = parseInt(parts[2], 10);
        if (isNaN(birthDay) || isNaN(birthMonth) || isNaN(birthYear)) return "...";
        const today = new Date();
        const birthDate = new Date(birthYear, birthMonth, birthDay);
        if (isNaN(birthDate.getTime())) return "...";
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) { age--; }
        return age >= 0 ? age : "...";
    } catch (e) { console.error("Error calculating age:", e); return "..."; }
}

// --- Slideshow Functionaliteit ---
let slideshows = {}; // Houdt staat per slideshow bij

function initializeSlideshows() {
    const containers = document.querySelectorAll('.slideshow-container');
    containers.forEach((container, index) => {
        const slideshowId = `slideshow-${index}`;
        container.dataset.slideshowId = slideshowId;
        const slides = container.querySelectorAll('.project-slide');
        const placeholder = container.querySelector('.slideshow-placeholder');
        const prevButton = container.querySelector('.prev');
        const nextButton = container.querySelector('.next');

        if (slides.length > 0) {
            // Controleer of afbeeldingen daadwerkelijk laden
            let loadedImages = 0;
            let failedImages = 0;
            slides.forEach(slide => {
                // Trick om te checken of image geladen is (kan onbetrouwbaar zijn)
                if (slide.complete && slide.naturalHeight !== 0) {
                    loadedImages++;
                } else {
                    // Luister naar load/error events als ze nog niet compleet zijn
                    slide.onload = () => { loadedImages++; checkSlideshowState(slideshowId, placeholder, prevButton, nextButton); };
                    slide.onerror = () => { failedImages++; slide.style.display = 'none'; checkSlideshowState(slideshowId, placeholder, prevButton, nextButton); };
                }
            });

            // Initialiseer slideshow staat
             slideshows[slideshowId] = {
                 slides: Array.from(slides).filter(s => s.style.display !== 'none'), // Filter out failed images initially
                 currentIndex: 0,
                 container: container
             };
             checkSlideshowState(slideshowId, placeholder, prevButton, nextButton); // Check state after initial setup

             // Voeg hover listeners toe
             container.addEventListener('mousemove', handleMouseMove);
             container.addEventListener('mouseleave', handleMouseLeave);

        } else {
            // Geen img tags gevonden
             if (placeholder) placeholder.style.display = 'flex';
             if (prevButton) prevButton.style.display = 'none';
             if (nextButton) nextButton.style.display = 'none';
        }
    });
}

function checkSlideshowState(slideshowId, placeholder, prevButton, nextButton) {
    const slideshow = slideshows[slideshowId];
    // Update de lijst met bruikbare slides
    slideshow.slides = Array.from(slideshow.container.querySelectorAll('.project-slide')).filter(s => s.style.display !== 'none');

    if (slideshow.slides.length > 0) {
        if (placeholder) placeholder.style.display = 'none';
        if (prevButton) prevButton.style.display = 'block';
        if (nextButton) nextButton.style.display = 'block';
         // Zorg dat de eerste *geldige* slide getoond wordt
         slideshow.currentIndex = Math.min(slideshow.currentIndex, slideshow.slides.length - 1); // Clamp index
         if (slideshow.currentIndex < 0) slideshow.currentIndex = 0; // Minstens 0
         slideshow.slides.forEach((slide, i) => { // Verberg alle slides
             slide.classList.remove('active-slide');
             slide.style.objectPosition = 'center center'; // Reset pan
         });
         if(slideshow.slides[slideshow.currentIndex]) { // Toon de (nieuwe) huidige slide
            slideshow.slides[slideshow.currentIndex].classList.add('active-slide');
         }

    } else {
         // Geen geldige slides meer
         if (placeholder) placeholder.style.display = 'flex';
         if (prevButton) prevButton.style.display = 'none';
         if (nextButton) nextButton.style.display = 'none';
    }
}


function changeSlide(delta, buttonElement) {
    const container = buttonElement?.closest('.slideshow-container');
    if (!container) return;
    const slideshowId = container.dataset.slideshowId;
    const slideshow = slideshows[slideshowId];
    if (!slideshow || slideshow.slides.length === 0) return;

    slideshow.slides[slideshow.currentIndex].style.objectPosition = 'center center'; // Reset pan
    slideshow.slides[slideshow.currentIndex].classList.remove('active-slide');

    let newIndex = slideshow.currentIndex + delta;
    if (newIndex >= slideshow.slides.length) newIndex = 0;
    else if (newIndex < 0) newIndex = slideshow.slides.length - 1;

    slideshow.slides[newIndex].classList.add('active-slide');
    slideshow.currentIndex = newIndex;
}

function handleMouseMove(event) {
    const container = event.currentTarget;
    const slideshowId = container.dataset.slideshowId;
    const slideshow = slideshows[slideshowId];
    if (!slideshow || slideshow.slides.length === 0) return;
    const activeSlide = slideshow.slides[slideshow.currentIndex];
    if (!activeSlide) return;

    const rect = container.getBoundingClientRect();
    const mouseY = event.clientY - rect.top;
    const containerHeight = container.offsetHeight;
    const yPercentage = Math.max(0, Math.min(100, (mouseY / containerHeight) * 100));
    activeSlide.style.objectPosition = `50% ${yPercentage}%`;
}

function handleMouseLeave(event) {
    const container = event.currentTarget;
    const slideshowId = container.dataset.slideshowId;
    const slideshow = slideshows[slideshowId];
    if (!slideshow || slideshow.slides.length === 0) return;
    const activeSlide = slideshow.slides[slideshow.currentIndex];
    if (!activeSlide) return;
    activeSlide.style.objectPosition = 'center center';
}

// --- Voer functies uit na laden DOM ---
document.addEventListener('DOMContentLoaded', () => {
    setFooterYear();

    const dob = "25/08/2001";
    const ageElement = document.getElementById('age-display');
    if (ageElement) {
        const calculatedAge = calculateAge(dob);
        ageElement.textContent = calculatedAge + (calculatedAge === 1 ? " jaar" : " jaar");
    }

    initializeSlideshows(); // Initialiseer slideshows

    // Default tab logica
    const defaultOpenButton = document.getElementById('defaultOpen');
    const isAnyTabVisible = document.querySelector('.tab-content[style*="display: block"]') !== null;
    if (defaultOpenButton && !isAnyTabVisible) { openTab(null, 'OverMij'); if(!defaultOpenButton.classList.contains('active')){ defaultOpenButton.className += " active"; } }
    else if(defaultOpenButton && isAnyTabVisible) { const visibleTabId = document.querySelector('.tab-content[style*="display: block"]').id; const activeButton = document.querySelector(`.tab-button[onclick*="'${visibleTabId}'"]`); const tablinks = document.getElementsByClassName("tab-button"); for (let i = 0; i < tablinks.length; i++) { tablinks[i].className = tablinks[i].className.replace(" active", ""); } if (activeButton) activeButton.className += " active"; else if(!defaultOpenButton.classList.contains('active')) { defaultOpenButton.className += " active"; } }
    else if (defaultOpenButton && !defaultOpenButton.classList.contains('active')){ defaultOpenButton.className += " active";}
});