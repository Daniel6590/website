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
        // Fallback for calls without event (e.g., initial load)
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
    // Expects DD/MM/YYYY format
    try {
        const parts = birthDateString.split('/');
        if (parts.length !== 3) return "...";
        const birthDay = parseInt(parts[0], 10);
        const birthMonth = parseInt(parts[1], 10) - 1; // JS months 0-11
        const birthYear = parseInt(parts[2], 10);
        if (isNaN(birthDay) || isNaN(birthMonth) || isNaN(birthYear)) return "...";

        const today = new Date();
        const birthDate = new Date(birthYear, birthMonth, birthDay);
        if (isNaN(birthDate.getTime())) return "..."; // Invalid date object check

        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age >= 0 ? age : "..."; // Ensure non-negative age
    } catch (e) {
        console.error("Error calculating age:", e);
        return "...";
    }
}

// --- Voer functies uit na laden DOM ---
document.addEventListener('DOMContentLoaded', () => {
    // Set current year in footer
    setFooterYear();

    // Calculate and display age
    const dob = "25/08/2001";
    const ageElement = document.getElementById('age-display');
    if (ageElement) {
        const calculatedAge = calculateAge(dob);
        ageElement.textContent = calculatedAge + (calculatedAge === 1 ? " jaar" : " jaar"); // Dutch pluralization
    }

    // Ensure correct default tab is active and visible
    const defaultOpenButton = document.getElementById('defaultOpen');
    const isAnyTabVisible = document.querySelector('.tab-content[style*="display: block"]') !== null;

    if (defaultOpenButton && !isAnyTabVisible) {
        // No tab is visible (initial load): open default tab
        openTab(null, 'OverMij');
    } else if (defaultOpenButton && isAnyTabVisible) {
        // A tab is visible (e.g., browser restore): sync the active button
        const visibleTabId = document.querySelector('.tab-content[style*="display: block"]').id;
        const activeButton = document.querySelector(`.tab-button[onclick*="'${visibleTabId}'"]`);
        const tablinks = document.getElementsByClassName("tab-button");
        for (let i = 0; i < tablinks.length; i++) {
            tablinks[i].className = tablinks[i].className.replace(" active", "");
        }
        if (activeButton) activeButton.className += " active";
        else if (!defaultOpenButton.classList.contains('active')) { defaultOpenButton.className += " active"; } // Fallback
    } else if (defaultOpenButton) {
         // Ensure default button is active if logic somehow missed it
         if (!defaultOpenButton.classList.contains('active')) { defaultOpenButton.className += " active";}
    }
});