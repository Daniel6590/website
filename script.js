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
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age >= 0 ? age : "...";
    } catch (e) {
        console.error("Error calculating age:", e);
        return "...";
    }
}

// --- Slideshow Functionaliteit ---
let slideshows = {}; // Houdt staat per slideshow bij

function initializeSlideshows() {
    const containers = document.querySelectorAll('.slideshow-container');
    containers.forEach((container, index) => {
        const slideshowId = `slideshow-${index}`;
        container.dataset.slideshowId = slideshowId;
        const slides = Array.from(container.querySelectorAll('img.project-slide'));
        const placeholder = container.querySelector('.slideshow-placeholder');
        const prevButton = container.querySelector('.prev');
        const nextButton = container.querySelector('.next');

        slideshows[slideshowId] = {
            slides: slides,
            currentIndex: 0,
            container: container,
            placeholder: placeholder,
            prevButton: prevButton,
            nextButton: nextButton,
            initialCheckDone: false
        };

        if (slides.length === 0) {
            checkSlideshowState(slideshowId); // Toon placeholder
            return;
        }

        let imagesToCheck = slides.length;
        const onImageLoadOrError = () => {
            imagesToCheck--;
            // Wacht tot alle afbeeldingen status hebben voor de eerste check
            if (imagesToCheck === 0 && !slideshows[slideshowId].initialCheckDone) {
                 checkSlideshowState(slideshowId);
                 slideshows[slideshowId].initialCheckDone = true;
            }
        };

        // Altijd listeners toevoegen (nu 'loading=lazy' weg is)
        slides.forEach(slide => {
            slide.addEventListener('load', onImageLoadOrError, { once: true });
            slide.addEventListener('error', onImageLoadOrError, { once: true });
            // Backup check voor reeds complete (gecachete) afbeeldingen
            if (slide.complete) {
                 // Roep direct aan, maar iets vertraagd om race condities te minimaliseren
                 setTimeout(() => onImageLoadOrError({ type: 'manual_complete_check', target: slide }), 0);
            }
        });

        container.addEventListener('mousemove', handleMouseMove);
        container.addEventListener('mouseleave', handleMouseLeave);
    });
}

function checkSlideshowState(slideshowId) {
    const slideshow = slideshows[slideshowId];
    if (!slideshow) return;

    const { slides, placeholder, prevButton, nextButton } = slideshow;

    // Filter op basis van de display style gezet door HTML onerror
    const validSlides = slides.filter(s => s.style.display !== 'none');

    if (validSlides.length > 0) {
        if (placeholder) placeholder.style.display = 'none';
        if (prevButton) prevButton.style.display = 'block';
        if (nextButton) nextButton.style.display = 'block';

        let potentialCurrentSlide = slides[slideshow.currentIndex];
        let currentSlideIsValid = potentialCurrentSlide && potentialCurrentSlide.style.display !== 'none';

        if (!currentSlideIsValid) {
            slideshow.currentIndex = slides.findIndex(s => s.style.display !== 'none');
             if (slideshow.currentIndex === -1) { // Geen geldige slides over
                 showPlaceholder(slideshow);
                 return;
             }
             potentialCurrentSlide = slides[slideshow.currentIndex];
        }

        slides.forEach(s => s.classList.remove('active-slide')); // Reset alle
        potentialCurrentSlide.classList.add('active-slide'); // Activeer de juiste
        potentialCurrentSlide.style.objectPosition = 'center center';

    } else {
        showPlaceholder(slideshow);
    }
}

function showPlaceholder(slideshow) {
     if (slideshow.placeholder) slideshow.placeholder.style.display = 'flex';
     if (slideshow.prevButton) slideshow.prevButton.style.display = 'none';
     if (slideshow.nextButton) slideshow.nextButton.style.display = 'none';
     slideshow.slides.forEach(s => s.classList.remove('active-slide'));
}

function changeSlide(delta, buttonElement) {
    const container = buttonElement?.closest('.slideshow-container');
    if (!container) return;
    const slideshowId = container.dataset.slideshowId;
    const slideshow = slideshows[slideshowId];

    const validSlides = slideshow.slides.filter(s => s.style.display !== 'none');
    if (!slideshow || validSlides.length <= 1) return;

    const currentSlide = slideshow.slides[slideshow.currentIndex];
    let currentValidIndex = validSlides.findIndex(s => s === currentSlide);

    if (currentValidIndex === -1) {
        currentValidIndex = 0;
        slideshow.currentIndex = slideshow.slides.indexOf(validSlides[0]);
        if(currentSlide) currentSlide.classList.remove('active-slide');
    }

    let nextValidIndex = currentValidIndex + delta;
    if (nextValidIndex >= validSlides.length) nextValidIndex = 0;
    else if (nextValidIndex < 0) nextValidIndex = validSlides.length - 1;

    const nextSlide = validSlides[nextValidIndex];
    slideshow.currentIndex = slideshow.slides.indexOf(nextSlide);

     if (currentSlide && currentSlide !== nextSlide) {
        currentSlide.classList.remove('active-slide');
        currentSlide.style.objectPosition = 'center center';
    }

    if (nextSlide) {
        nextSlide.classList.add('active-slide');
    } else {
         checkSlideshowState(slideshowId); // Probeer te herstellen
    }
}

function handleMouseMove(event) {
    const container = event.currentTarget;
    const slideshowId = container.dataset.slideshowId;
    const slideshow = slideshows[slideshowId];
    if (!slideshow || slideshow.slides.length === 0) return;
    const activeSlide = slideshow.container.querySelector('.project-slide.active-slide');
    if (!activeSlide || activeSlide.style.display === 'none') return;

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
    const activeSlide = slideshow.container.querySelector('.project-slide.active-slide');
    if (!activeSlide || activeSlide.style.display === 'none') return;
    activeSlide.style.objectPosition = 'center center';
}


// --- Theme Toggle Functionality ---
const themeToggleButton = document.getElementById('theme-toggle');
const themeToggleIcon = document.getElementById('theme-toggle-icon');
const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
const htmlElement = document.documentElement;

function applyTheme(theme, source = 'manual') {
    htmlElement.removeAttribute('data-theme');
    htmlElement.classList.remove('dark-mode-preferred');

    if (theme === 'dark') {
        if (source === 'manual') {
            htmlElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        } else {
            htmlElement.classList.add('dark-mode-preferred');
            localStorage.removeItem('theme');
        }
        if (themeToggleIcon) themeToggleIcon.setAttribute('xlink:href', '#icon-sun');
        if (themeToggleButton) themeToggleButton.setAttribute('aria-label', 'Switch to light mode');

    } else { // theme === 'light'
        if (source === 'manual') {
            htmlElement.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
        } else {
             localStorage.removeItem('theme');
        }
        if (themeToggleIcon) themeToggleIcon.setAttribute('xlink:href', '#icon-moon');
        if (themeToggleButton) themeToggleButton.setAttribute('aria-label', 'Switch to dark mode');
    }
}

// --- Initial Theme Application ---
(function() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        applyTheme(savedTheme, 'manual');
    } else if (prefersDarkScheme.matches) {
        applyTheme('dark', 'system');
    } else {
        applyTheme('light', 'system');
    }
})();

// --- Event Listener Functions ---
function handleThemeButtonClick() {
    const isCurrentlyDark = htmlElement.matches("[data-theme='dark']") || htmlElement.classList.contains('dark-mode-preferred');
    const newTheme = isCurrentlyDark ? 'light' : 'dark';
    applyTheme(newTheme, 'manual');
}

function handleSystemThemeChange(e) {
    if (!localStorage.getItem('theme')) {
        applyTheme(e.matches ? 'dark' : 'light', 'system');
    }
}

// --- Voer functies uit na laden DOM ---
document.addEventListener('DOMContentLoaded', () => {
    // Initial Setup Functions
    setFooterYear();

    const dob = "25/08/2001";
    const ageElement = document.getElementById('age-display');
    if (ageElement) {
        const calculatedAge = calculateAge(dob);
        ageElement.textContent = calculatedAge + (calculatedAge === 1 ? " jaar" : " jaar");
    }

    initializeSlideshows();

    // Default Tab Logic
    const defaultOpenButton = document.getElementById('defaultOpen');
    const tabContents = document.querySelectorAll('.tab-content');
    let isAnyTabVisible = false;
    tabContents.forEach(tab => {
        if (tab.style.display === 'block') {
            isAnyTabVisible = true;
            const tabId = tab.id;
            const activeButton = document.querySelector(`.tab-button[onclick*="'${tabId}'"]`);
            const allTabButtons = document.querySelectorAll(".tab-button");
            allTabButtons.forEach(btn => btn.classList.remove("active"));
            if (activeButton) {
                activeButton.classList.add("active");
            } else if(defaultOpenButton) {
                 defaultOpenButton.classList.add("active");
            }
        }
    });

    if (!isAnyTabVisible && defaultOpenButton) {
         openTab(null, 'OverMij');
         document.querySelectorAll(".tab-button").forEach(btn => btn.classList.remove("active"));
         defaultOpenButton.classList.add("active");
    }

    // --- Add Theme Event Listeners ---
    if (themeToggleButton) {
        themeToggleButton.addEventListener('click', handleThemeButtonClick);
    }
    if (prefersDarkScheme.addEventListener) {
         prefersDarkScheme.addEventListener('change', handleSystemThemeChange);
    } else if (prefersDarkScheme.addListener) { // Deprecated
         prefersDarkScheme.addListener(handleSystemThemeChange);
    }

    // Final check/sync for button icon/label
    const finalEffectiveTheme = htmlElement.matches("[data-theme='dark']") || htmlElement.classList.contains('dark-mode-preferred') ? 'dark' : 'light';
     if (finalEffectiveTheme === 'dark') {
         if (themeToggleIcon) themeToggleIcon.setAttribute('xlink:href', '#icon-sun');
         if (themeToggleButton) themeToggleButton.setAttribute('aria-label', 'Switch to light mode');
     } else {
         if (themeToggleIcon) themeToggleIcon.setAttribute('xlink:href', '#icon-moon');
         if (themeToggleButton) themeToggleButton.setAttribute('aria-label', 'Switch to dark mode');
     }

}); // End of DOMContentLoaded