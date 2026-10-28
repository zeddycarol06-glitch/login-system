// ADMIN CREDENTIALS
const ADMIN_EMAIL = "admin@zedtech.com";
const ADMIN_PASSWORD = "admin123";

// SELECTORS
const navbarMenu = document.querySelector(".navbar .links");
const hamburgerBtn = document.querySelector(".hamburger-btn");
const hideMenuBtn = navbarMenu.querySelector(".close-btn");
const showPopupBtn = document.querySelector(".login-btn");
const formPopup = document.querySelector(".form-popup");
const blurBg = document.querySelector(".blur-bg-overlay");

const signupLink = document.querySelector("#signup-link");
const loginLink = document.querySelector("#login-link");

// SHOW SECURITY LINK ONLY FOR ADMIN
function updateSecurityLinkVisibility() {
    const securityLink = document.getElementById("security-nav-link");
    if (!securityLink) return;
    const currentUser = localStorage.getItem("zedtech_current_user");
    if (currentUser) {
        const user = JSON.parse(currentUser);
        securityLink.parentElement.style.display = user.email === ADMIN_EMAIL ? "list-item" : "none";
    } else {
        securityLink.parentElement.style.display = "none";
    }
}
updateSecurityLinkVisibility();

// STORE LOGIN ATTEMPT
function recordLogin(email, success) {
    const logs = JSON.parse(localStorage.getItem("zedtech_login_logs") || "[]");
    const now = new Date();
    logs.unshift({
        email: email,
        timestamp: now.toISOString(),
        displayTime: now.toLocaleString(),
        success: success,
        ip: `${Math.floor(Math.random() * 255) + 1}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        browser: navigator.userAgent.includes("Chrome") ? "Chrome" : navigator.userAgent.includes("Firefox") ? "Firefox" : navigator.userAgent.includes("Safari") ? "Safari" : "Other",
        os: navigator.platform
    });
    if (logs.length > 100) logs.pop();
    localStorage.setItem("zedtech_login_logs", JSON.stringify(logs));
}

// MOBILE MENU TOGGLE
hamburgerBtn.addEventListener("click", () => {
    navbarMenu.classList.toggle("show-menu");
});

hideMenuBtn.addEventListener("click", () => {
    navbarMenu.classList.remove("show-menu");
});

// OPEN POPUP
showPopupBtn.addEventListener("click", () => {
    document.body.classList.add("show-popup");
    formPopup.classList.remove("show-signup");
});

// CLOSE POPUP
blurBg.addEventListener("click", () => {
    document.body.classList.remove("show-popup");
    formPopup.classList.remove("show-signup");
});

formPopup.querySelectorAll(".close-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        document.body.classList.remove("show-popup");
        formPopup.classList.remove("show-signup");
    });
});

// SWITCH LOGIN/SIGNUP
signupLink.addEventListener("click", e => {
    e.preventDefault();
    formPopup.classList.add("show-signup");
});

loginLink.addEventListener("click", e => {
    e.preventDefault();
    formPopup.classList.remove("show-signup");
});

// LOGIN FORM REDIRECT
document.getElementById("login-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const emailField = document.querySelector("#login-form input[type='email']");
    const passField = document.querySelector("#login-form input[type='password']");
    const email = emailField ? emailField.value : "";
    const password = passField ? passField.value : "";

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        recordLogin(email, true);
        localStorage.setItem("zedtech_current_user", JSON.stringify({ email: email, role: "admin", loginTime: new Date().toISOString() }));
        window.location.href = "security-dashboard.html";
    } else {
        recordLogin(email || "unknown", true);
        localStorage.setItem("zedtech_current_user", JSON.stringify({ email: email || "guest", role: "user", loginTime: new Date().toISOString() }));
        window.location.href = "dashboard.html";
    }
});

// CONTACT FORM SUBMISSION
const contactForm = document.querySelector(".contact-form");
const formStatus = document.querySelector(".form-status");

contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = contactForm.querySelector("button");
    const originalText = btn.textContent;
    btn.textContent = "Sending...";
    btn.disabled = true;

    try {
        const response = await fetch(contactForm.action, {
            method: "POST",
            body: new FormData(contactForm),
        });

        if (response.ok) {
            formStatus.textContent = "Message sent successfully!";
            formStatus.style.color = "#22c55e";
            contactForm.reset();
        } else {
            throw new Error();
        }
    } catch {
        formStatus.textContent = "Something went wrong. Try again.";
        formStatus.style.color = "#ef4444";
    }

    btn.textContent = originalText;
    btn.disabled = false;
    setTimeout(() => { formStatus.textContent = ""; }, 5000);
});

// COURSE SLIDER
const courseTrack = document.querySelector(".course-track");
const courseItems = document.querySelectorAll(".course-slider .course-item");
const courseDots = document.querySelectorAll(".course-dot");
let currentCourse = 0;
let courseInterval;

function goToCourse(index) {
    courseItems.forEach(item => item.classList.remove("active"));
    courseDots.forEach(dot => dot.classList.remove("active"));

    courseItems[index].classList.add("active");
    courseDots[index].classList.add("active");
    courseTrack.style.transform = `translateX(-${index * 100}%)`;
    currentCourse = index;
}

function nextCourse() {
    goToCourse((currentCourse + 1) % courseItems.length);
}

function startCourseSlider() {
    courseInterval = setInterval(nextCourse, 3000);
}

function resetCourseSlider() {
    clearInterval(courseInterval);
    startCourseSlider();
}

courseDots.forEach(dot => {
    dot.addEventListener("click", () => {
        goToCourse(parseInt(dot.dataset.index));
        resetCourseSlider();
    });
});

startCourseSlider();
