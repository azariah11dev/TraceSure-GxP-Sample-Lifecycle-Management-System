document.addEventListener("DOMContentLoaded", () => {
    const name = localStorage.getItem("username");
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

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
        localStorage.removeItem("role");
        window.location.href = "../index.html";
    });

    // Role based dashboard display
    const permissions = {Admin: ["create", "perform", "review", "approve", "deviation", "release"],
                         Technician: ["create", "perform", "review"],
                         Manager: ["create", "approve", "deviation"],
                         Supervisor: ["create", "perform", "review", "deviation"],
                         QA: ["deviation", "release"]
                        };
    const allItems = ["create", "perform", "review", "approve", "deviation", "release"];

    allItems.forEach(item => {
        if (!permissions[role].includes(item)) {
        document.getElementById(item).style.display = "none";
        }
    });

    const popup = document.getElementById("container-1-role-popup");
    const icon = document.getElementById("container-1-name-logo");
    if (popup && icon) {
        popup.textContent = `Role: ${role}`;

        icon.addEventListener("click", () => {
            popup.classList.toggle("container-1-role-popup-hidden");
        });
    } else {
        console.error("Popup or icon element not found");
    }
});