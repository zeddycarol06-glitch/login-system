// TAB SWITCHER
const tabBtns = document.querySelectorAll(".tab-btn");
const tabContents = document.querySelectorAll(".tab-content");

tabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        tabBtns.forEach(b => b.classList.remove("active"));
        tabContents.forEach(c => c.classList.remove("active"));

        btn.classList.add("active");
        document.getElementById(`${btn.dataset.tab}-tab`).classList.add("active");
    });
});

// EMAIL FORM - opens default email client
document.getElementById("email-form").addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("email-name").value;
    const sender = document.getElementById("email-sender").value;
    const subject = document.getElementById("email-subject").value;
    const message = document.getElementById("email-message").value;

    const body = `Name: ${name}%0D%0AEmail: ${sender}%0D%0A%0D%0A${encodeURIComponent(message)}`;
    const mailtoUrl = `mailto:zeddycarol06@gmail.com?subject=${encodeURIComponent(subject)}&body=${body}`;

    window.location.href = mailtoUrl;
});

// WHATSAPP FORM - opens WhatsApp with pre-filled message
document.getElementById("whatsapp-form").addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("wa-name").value;
    const message = document.getElementById("wa-message").value;

    const fullMessage = `Hi, I'm ${name}. ${message}`;
    const waUrl = `https://wa.me/254796488109?text=${encodeURIComponent(fullMessage)}`;

    window.open(waUrl, "_blank");
});
