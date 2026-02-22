document.addEventListener("DOMContentLoaded", () => {
    const name = localStorage.getItem("username");
    const token = localStorage.getItem("token");

    // Redirect if not logged in
    if (!name || !token) {
        window.location.href = "../index.html";
        return;
    }

    // Write username into UI
    const el = document.getElementById("container-1-top-bar-user-name");
    if (el) {
        el.textContent = name;
    }

    // Logout logic
    const logout = document.getElementById("container-1-top-bar-logout");
    logout.addEventListener("click", () => {
        localStorage.removeItem("username");
        localStorage.removeItem("token");
        window.location.href = "../index.html";
    });
});