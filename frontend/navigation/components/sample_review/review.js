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

if (document.querySelector(".sample-review-component") && !document.body.dataset.sampleReviewInit) {
    document.body.dataset.sampleReviewInit= "true";
    sampleReviewInitialized();
}

async function sampleReviewInitialized() {
    document.addEventListener("click", async (e) => {
        //load samples for review
        const viewTestBtn = e.target.closest(".view-tests");
        if (viewTestBtn) {
            const sampleName = viewTestBtn.dataset.sample;
            await loadReviewForSample(sampleName);
            return;
        }

        // SUBMIT REVIEW
        const submitBtn = e.target.closest(".submit-review-test");
        if (submitBtn) {
            await handleSubmitReview(submitBtn);
            return;
        }

        //close button
        const closeReviewFormBtn = e.target.closest("#close-test-review-details");
        if (closeReviewFormBtn) {
            await closeSampleReview();
            return;
        }
    });

}

async function closeSampleReview() {
    document.querySelector(".sample-review-component-test-details").classList.add("hidden");
}

async function loadReviewForSample(sampleName) {
    const panel = document.querySelector(".sample-review-component-test-details");
    if (!panel) return;

    const title = document.getElementById("sample-review-component-test-details-title");
    const tbody = document.querySelector("#sample-review tbody");
    if (!title || !tbody) return; 

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
                    <option></option>
                    <option value="False">Rejected</option>
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

async function handleSubmitReview(btn) {

    const testName = btn.dataset.testName;
    const sampleName = btn.dataset.sampleName;

    const statusSelect = btn.closest("tr").querySelector(".review-test");
    const reviewedStatus = statusSelect.value === "True";

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
                    reviewed_status: reviewedStatus
                })
            }
        );

        if (res.ok) {
            alert("Review submitted!");
            //remove row or reload panel
            btn.closest("tr").remove();
        } else {
            const errText = await res.text();
            console.error("Server error:", errText);
            alert(errText);
        }

    } catch (error) {
        console.log("Server error:", error);
    }
}
