document.addEventListener("DOMContentLoaded", () => {

    const toggle = document.getElementById("toggleButton");
    const github = document.getElementById("githubButton");
    const settings = document.getElementById("settingsButton");

    let enabled = true;

    toggle.addEventListener("click", () => {
        enabled = !enabled;

        toggle.src = enabled
            ? "assets/icons/toggled.svg"
            : "assets/icons/toggle_off.svg";
    });

    github.addEventListener("click", () => {
        window.open(
            "https://github.com/blueskychan-dev/fossasia-hackathon2026/",
            "_blank",
            "noopener,noreferrer"
        );
    });

    settings.addEventListener("click", () => {
        window.location.href = "settings.html";
    });

});