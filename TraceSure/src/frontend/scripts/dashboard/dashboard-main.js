// dashboard-main.js

async function initDashboard() {
  const name = localStorage.getItem("username");
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // Redirect if not logged in
  if (!name || !token) {
    window.location.href = "../index.html";
    return;
  }

  // Wait for the top-bar username element to exist in the injected HTML
  await waitForElement('#container-1-top-bar-user-name');

  // Write username into UI
  const el = document.getElementById("container-1-top-bar-user-name");
  if (el) el.textContent = name;

  // Logout logic (guard for missing element)
  const logout = document.getElementById("container-1-top-bar-logout");
  if (logout) {
    logout.addEventListener("click", () => {
      localStorage.removeItem("username");
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      window.location.href = "../index.html";
    });
  }

  // Role based dashboard display (guard role and elements)
  const permissions = {
    Admin: ["create", "perform", "review", "approve", "deviation", "release"],
    Technician: ["create", "perform", "review"],
    Manager: ["create", "approve", "deviation"],
    Supervisor: ["create", "perform", "review", "deviation"],
    QA: ["deviation", "release"]
  };
  const allItems = ["create", "perform", "review", "approve", "deviation", "release"];

  if (role && permissions[role]) {
    allItems.forEach(item => {
      const elItem = document.getElementById(item);
      if (elItem && !permissions[role].includes(item)) {
        elItem.style.display = "none";
      }
    });
  } else {
    // If role missing or unknown, hide everything safe default
    allItems.forEach(item => {
      const elItem = document.getElementById(item);
      if (elItem) elItem.style.display = "none";
    });
    console.warn("Unknown or missing role:", role);
  }

  // Role popup and icon
  await waitForElement('#container-1-name-logo'); // ensure icon exists
  const popup = document.getElementById("container-1-role-popup");
  const icon = document.getElementById("container-1-name-logo");
  if (popup && icon) {
    popup.textContent = `Role: ${role || 'Unknown'}`;
    icon.addEventListener("click", () => {
      popup.classList.toggle("container-1-role-popup-hidden");
    });
  } else {
    console.error("Popup or icon element not found");
  }

  // Home navigation (guard element)
  const home_dashboard_link = document.getElementById("home-logo-dashboard");
  if (home_dashboard_link) {
    home_dashboard_link.addEventListener("click", () => {
      loadComponent(
        "/navigation/components/dashboard-component.html",
        "/scripts/dashboard/components/dashboard-component.js"
      );
    });
  }
}

// Run immediately when the component script is injected
initDashboard();