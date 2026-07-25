(function () {
  // HARD GUARD: Prevent script from running twice
  if (window.__dashboardScriptLoaded) {
    console.warn("Dashboard script already loaded — skipping.");
    return;
  }
  window.__dashboardScriptLoaded = true;

  async function initUserShell() {
    const name = localStorage.getItem("username");
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!name || !token) {
      window.location.href = "../index.html";
      return;
    }

    await waitForElement('#container-1-top-bar-user-name');
    const el = document.getElementById("container-1-top-bar-user-name");
    if (el) el.textContent = name;

    const logout = document.getElementById("container-1-top-bar-logout");
    if (logout) {
      logout.addEventListener("click", () => {
        localStorage.removeItem("username");
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        window.location.href = "../index.html";
      });
    }

    const permissions = {
      Admin: [
        "create", "perform", "review",
        "approve", "deviation", "release",
        "historical", "pending-deviations",
        "role-assignment", "deviation-document"
      ],
      Technician: ["create", "perform", "review", "historical"],
      Manager: ["create", "approve", "deviation", "historical", "pending-deviations", "deviation-document"],
      Supervisor: ["create", "perform", "review", "deviation", "historical", "deviation-document"],
      QA: ["deviation", "release", "historical"]
    };
    const allItems = [
      "create", "perform", "review", "approve", "deviation",
      "release", "historical", "pending-deviations", "role-assignment",
      "deviation-document"
    ];

    if (role && permissions[role]) {
      allItems.forEach(item => {
        const elItem = document.getElementById(item);
        if (elItem && !permissions[role].includes(item)) {
          elItem.style.display = "none";
        }
      });
    } else {
      allItems.forEach(item => {
        const elItem = document.getElementById(item);
        if (elItem) elItem.style.display = "none";
      });
      console.warn("Unknown or missing role:", role);
    }

    await waitForElement('#container-1-name-logo');
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

    const home_dashboard_link = document.getElementById("home-logo-dashboard");
    if (home_dashboard_link) {
      home_dashboard_link.addEventListener("click", () => {
        loadComponent(
          "/navigation/components/dashboard/dashboard.html",
          "/scripts/dashboard/dashboard-main.js"
        );
      });
    }
  }

  // Run once when this component script is injected
  initUserShell();

  async function fetchSamples() {
    try {
      const res = await fetch("http://localhost:8000/display_tests/dashboard");
      return await res.json();
    } catch (err) {
      console.error("Failed to fetch samples:", err);
      return [];
    }
  }

  function updateCards(samples) {
    const total = samples.length;
    const released = samples.filter(s => s.QA_approval === true).length;
    const oos = samples.filter(s => s.status === "out_of_specification").length;
    const pendingManager = samples.filter(s => s.reviewed_status === true && s.manager_approval === false).length;
    const pendingQA = samples.filter(s => s.manager_approval === true && s.QA_approval === false).length;

    document.getElementById("total-samples").textContent = total;
    document.getElementById("released-samples").textContent = released;
    document.getElementById("oos-samples").textContent = oos;
    document.getElementById("pending-manager").textContent = pendingManager;
    document.getElementById("pending-qa").textContent = pendingQA;
  }

  window.statusChartInstance = window.statusChartInstance || null;
  window.approvalChartInstance = window.approvalChartInstance || null;
  if (window.statusChartInstance) window.statusChartInstance.destroy();


  function renderStatusChart(samples) {
    const ctx = document.getElementById("statusChart");
    if (!ctx) {
      console.error("renderStatusChart: #statusChart canvas not found in DOM");
      return;
    }

    if (statusChartInstance) statusChartInstance.destroy();

    const statuses = ["out_of_trend", "out_of_specification", "pass"];
    const counts = statuses.map(status => samples.filter(s => s.status === status).length);

    statusChartInstance = new Chart(ctx, {
      type: "bar",
      data: {
        labels: ["Pass", "Out of Spec", "Out of Trend"],
        datasets: [{
          label: "Count",
          data: counts,
          backgroundColor: ["#22c55e", "#ef4444", "#f97316"]
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } }
      }
    });
  }

  function renderApprovalChart(samples) {
    if (approvalChartInstance) approvalChartInstance.destroy();
    const ctx = document.getElementById("approvalChart");

    const managerApproved = samples.filter(s => s.manager_approval === true).length;
    const managerPending = samples.filter(s => s.manager_approval === false).length;
    const qaApproved = samples.filter(s => s.QA_approval === true).length;
    const qaPending = samples.filter(s => s.QA_approval === false).length;

    approvalChartInstance = new Chart(ctx, {
      type: "pie",
      data: {
        labels: ["Manager Approved", "Manager Pending", "QA Approved", "QA Pending"],
        datasets: [{
          data: [managerApproved, managerPending, qaApproved, qaPending],
          backgroundColor: ["#22c55e", "#ef4444", "#3b82f6", "#f97316"]
        }]
      }
    });
  }

  function loadChartJs() {
    return new Promise(resolve => {
      if (window.Chart) return resolve(); // already loaded

      const script = document.createElement("script");
      script.src = "/scripts/dashboard/chart.umd.min.js";
      script.onload = resolve;
      document.body.appendChild(script);
    });
  }


  async function initDashboard() {
    await loadChartJs();
    await waitForElement('#statusChart');
    await waitForElement('#approvalChart');

    const samples = await fetchSamples();
    updateCards(samples);
    renderStatusChart(samples);
    renderApprovalChart(samples);
  }

  // Run once when this component script is injected
  if (document.querySelector(".dashboard") && !document.body.dataset.dashboardInit) {
    document.body.dataset.dashboardInit = "true";
    initDashboard();
  }
})();