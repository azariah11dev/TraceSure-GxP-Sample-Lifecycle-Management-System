async function getDeviations() {
    try {
        const response = await fetch("http://localhost:8080/deviation_form/all_pending", {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
            console.error("API error", response.status, await response.text());
            renderEmpty();
            return;
        }

        const data = await response.json();
        console.log("isArray:", Array.isArray(data));
        DeviationList(data);
    } catch (error) {
        console.error("Error fetching deviations:", error);
        renderEmpty();
    }
}

function DeviationList(deviations = []) {
    const tbody = document.querySelector("#pending-deviations-table tbody");
    if (!tbody) {
        console.error("Table body element not found");
        return;
    }

    tbody.innerHTML = "";

    if (!deviations.length) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align:center">No deviations found</td>
            </tr>`;
        return;
    }

    deviations.forEach((dev) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${escapeHtml(dev.deviation_code)}</td>
            <td>${escapeHtml(dev.sample_name)}</td>
            <td>${escapeHtml(dev.test_name)}</td>
            <td>${escapeHtml(dev.deviation_date)}</td>
            <td>${escapeHtml(dev.deviation_department)}</td>

            <td class="deviation-btn-cell">
                <button
                    data-sample="${escapeHtml(dev.sample_name)}"
                    data-test="${escapeHtml(dev.test_name)}"
                    class="view-deviation-btn"
                >View</button>
            </td>

            <td class="deviation-btn-cell">
                <button
                    data-sample="${escapeHtml(dev.sample_name)}"
                    data-test="${escapeHtml(dev.test_name)}"
                    class="approve-deviation-btn"
                >Approve</button>
            </td>

            <td class="deviation-btn-cell">
                <button
                    data-sample="${escapeHtml(dev.sample_name)}"
                    data-test="${escapeHtml(dev.test_name)}"
                    class="reject-deviation-btn"
                >Reject</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function renderEmpty() {
    const tbody = document.querySelector('#pending-deviations-table tbody');
    if (!tbody) return;
    tbody.innerHTML = `
        <tr>
            <td colspan="8" style="text-align:center">Unable to load deviations</td>
        </tr>`;
}

function escapeHtml(str = '') {
    return String(str).replace(/[&<>"']/g, c => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[c]));
}

waitForElement('#pending-deviations-table tbody').then(() => {
    getDeviations();
});

// ===========================View Deviation Form Modal Logic===========================

async function LoadDeviationDetails() {
    if (!window.LoadDeviationDetails) {
    window.LoadDeviationDetails = true;

        // wait deviation component HTML to exist
        waitForElement("#pending-deviations-component-details").then(() => {
            document.addEventListener("click", async (e) => {
                const viewBtn = e.target.closest(".view-deviation-btn");
                if (!viewBtn) return;
            });
        });
    }
}