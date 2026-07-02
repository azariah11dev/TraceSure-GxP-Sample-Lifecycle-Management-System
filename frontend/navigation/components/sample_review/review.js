// run when the component HTML is present
async function loadActiveSamples() {
    try {
        const res = await fetch(
            "http://localhost:8000/add_test/review_tests", {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });

        const samples = await res.json();
        console.log("Fetched samples:", samples);
        renderReviewSamples(samples);

    } catch (err) {
        console.error("API error", err);
        renderEmpty();
    }
}

function renderReviewSamples(samples = []) {
    const tbody = document.querySelector('#sample-review-table tbody');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (!samples.length) {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td colspan="7" style="text-align:center">No active samples</td>`;
        tbody.appendChild(tr);
        return;
    }

    samples.forEach(s => {
        const row = document.createElement('tr');
        row.innerHTML = `
      <td>${escapeHtml(s.sample_name)}</td>
      <td>${escapeHtml(s.status)}</td>
      <td>${escapeHtml(s.performed_by)}</td>
      <td>${Number(s.total_tests) || 0}</td>
      <td>${Boolean(s.open_deviation)}</td>
      <td>${escapeHtml(s.created_date || '')}</td>
      <td style="display:flex; justify-content:center; align-items:center;">
        <button data-sample="${escapeHtml(s.sample_name)}" class="view-tests">
            View Tests
        </button>
      </td>
    `;
        tbody.appendChild(row);
    });
}


function renderEmpty() {
    const tbody = document.querySelector('#sample-review-table tbody');
    if (!tbody) return;
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center">Unable to load samples</td></tr>`;
}

function escapeHtml(str = '') {
    return String(str).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// Attach a single delegated click handler to the table body (attach once)
function attachDelegatedHandlers() {
    const tbody = document.querySelector('#sample-review-table tbody');
    if (!tbody) return;

    // Remove previous handler if any (idempotent)
    tbody.removeEventListener('click', delegatedClick);
    tbody.addEventListener('click', delegatedClick);
}

function delegatedClick(e) {
    const btn = e.target.closest('button.view-tests');
    if (!btn) return;
    const sampleName = btn.dataset.sample;
    if (!sampleName) return;
}

// Ensure the table exists, then initialize
waitForElement('#sample-review-table tbody').then(() => {
    attachDelegatedHandlers();
    loadActiveSamples();
});


// ==========================View Tests Details Panel Logic==========================

if (!window.__sampleReviewInitialized) {
    window.__sampleReviewInitialized = true;

    let currentSampleName = null;

    document.addEventListener("click", async (e) => {
        if (!e.target.closest(".view-tests")) return;

        const sampleName = e.target.dataset.sample;
        await loadReviewForSample(sampleName);
    });

    // Close button (attach ONCE)
    document.getElementById("close-test-review-details").addEventListener("click", () => {
        document.getElementById("sample-review-component-test-details").classList.add("hidden");
    });
}

async function loadReviewForSample(sampleName) {
    const panel = document.getElementById("sample-review-component-test-details");
    const title = document.getElementById("sample-review-component-test-details-title");
    const tbody = document.querySelector("#sample-review tbody");

    // Show panel
    panel.classList.remove("hidden");
    // Set title
    title.textContent = `Tests for: ${sampleName}`;
    // Clear old rows
    tbody.innerHTML = "";

    // Fetch tests
    const response = await fetch(
        `http://localhost:8000/add_test/technician_review_tests?sample_name=${encodeURIComponent(sampleName)}`,
        {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        }
    );
    const tests = await response.json();
    console.log("Fetched tests for review:", tests);

    // Render rows
    tests.forEach(t => {
        const row = document.createElement("tr");

        row.innerHTML = `
              <td>${t.test_name}</td>
              <td>${t.performed_by ?? ""}</td>
              <td>${t.test_result}</td>
              <td>${t.upper_spec ?? ""}</td>
              <td>${t.lower_spec ?? ""}</td>
              <td>${t.unit ?? ""}</td>
              <td>${t.status ?? ""}</td>
              <td>
                <select class="review-test" name="review-test" required>
                    <option value=""></option>
                    <option value="True">Approved</option>
                </select>
              </td>
              <td style="display:flex; justify-content:center; align-items:center;">
                <button 
                class="submit-review-test" 
                data-test-name="${t.test_name}" 
                data-sample-name="${sampleName}"
                >
                  Submit
                </button>
              </td>
          `;
        tbody.appendChild(row);
    });
}

// ==========================Review Tests Details Panel Logic==========================

document.addEventListener("click", async (e) => {
    const btn = e.target.closest(".submit-review-test");
    if (!btn) return;

    const testName = btn.dataset.testName;
    const sampleName = btn.dataset.sampleName;

    const statusSelect = btn.closest("tr").querySelector(".review-test");
    const reviewed_status = statusSelect.value === "True";

    if (!statusSelect.value) {
        alert("Please select a review status.");
        return;
    }

    try {
        const res = await fetch(
            `http://localhost:8000/review_test/technician_review_tests`,
            {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sample_name: sampleName,
                    test_name: testName,
                    reviewed_by: localStorage.getItem("username"),
                    reviewed_status
                })
            }
        );

        if (res.ok) {
            alert("Review submitted!");
            // Optional: remove row or reload panel
            btn.closest("tr").remove();
        } else {
            const errText = await res.text();
            console.error("Server error:", errText);
            alert(errText);
        }

    } catch (error) {
        const errText = await res.text();
            console.error("Server error:", errText);
    }
});
