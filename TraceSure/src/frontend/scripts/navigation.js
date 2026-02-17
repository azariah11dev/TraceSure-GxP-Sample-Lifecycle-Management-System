document.addEventListener("DOMContentLoaded", () => {
    const home_link = document.getElementById("home-logo");
    home_link.addEventListener("click", () => {
        // Get the current page path
        const path = window.location.pathname;
        // If we're inside /navigation/, go up one level
        if (path.includes("/navigation/")) {
            window.location.href = "../index.html";
        } else {
        // Otherwise we're already at the root
            window.location.href = "./index.html";
        }
    });

    const register_link = document.getElementById("get-started-btn");
    register_link.addEventListener("click", () => {
        window.location.href = "./navigation/register.html";
    });

    const login_link = document.getElementById("account-login-btn");
    login_link.addEventListener("click", () => {
        window.location.href = "./navigation/login.html";
    });
});