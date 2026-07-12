// run when the component HTML is present
async function loadCompletedSamples() {
    try {
        const response = await fetch(
            "http://localhost:8000/display_tests/test_for_release", {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });

        const sample = await response.json();
        console.log("Fetched samples:", sample.samples);
        renderApproveSamples(sample.samples);

    } catch (error) {
        console.error("API error", error);
        renderEmpty();
    }
}

function renderApproveSamples(samples = []) {
    const tbody = document.querySelector('#sample-release-table tbody');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (!samples.length) {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td colspan="8" style="text-align:center">No active samples</td>`;
        tbody.appendChild(tr);
        return;
    }

    samples.forEach(s => {
        const row = document.createElement('tr');
        row.innerHTML = `
      <td>${escapeHtml(s.sample_name)}</td>
      <td>${escapeHtml(s.status)}</td>
      <td>${escapeHtml(s.approved_by)}</td>
      <td>${Number(s.total_tests) || 0}</td>
      <td>${escapeHtml(s.creation_date || '')}</td>
      <td>${escapeHtml(s.completed_date || '')}</td>
      <td>${escapeHtml(s.total_days || '')}</td>
      <td style="display:flex; justify-content:center; align-items:center;">
        <button
         data-sample-name="${escapeHtml(s.sample_name)}"
         data-test-name="${escapeHtml(s.test_name)}" 
         class="view-released-tests"
         >
            View Tests
        </button>
      </td>
    `;
        tbody.appendChild(row);
    });
}


function renderEmpty() {
    const tbody = document.querySelector('#sample-release-table tbody');
    if (!tbody) return;
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center">Unable to load samples</td></tr>`;
}

function escapeHtml(str = '') {
    return String(str).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// Attach a single delegated click handler to the table body (attach once)
function attachDelegatedHandlers() {
    const tbody = document.querySelector('#sample-release-table tbody');
    if (!tbody) return;

    // Remove previous handler if any (idempotent)
    tbody.removeEventListener('click', delegatedClick);
    tbody.addEventListener('click', delegatedClick);
}

function delegatedClick(e) {
    const btn = e.target.closest('button.view-released-tests');
    if (!btn) return;
    const sampleName = btn.dataset.sampleName;
    if (!sampleName) return;
}

// Ensure the table exists, then initialize
waitForElement('#sample-release-table tbody').then(() => {
    attachDelegatedHandlers();
    loadCompletedSamples();
});

// ==========================View Tests Details Panel Logic==========================

if (document.querySelector(".sample-release-component") && !document.body.dataset.sampleApprovalInit) {
    document.body.dataset.sampleApprovalInit = "true";
    sampleReleaseInitialized();
}

async function sampleReleaseInitialized() {

    document.addEventListener("click", async (e) => {
        // display test details
        const viewSampleReleaseTestBtn = e.target.closest(".view-released-tests");
        if (viewSampleReleaseTestBtn) {
            sampleReleasedTest(viewSampleReleaseTestBtn);
            return;
        }

        // submit verdit
        const releseTestDetailsBtn = e.target.closest(".submit-released-test");
        if (releseTestDetailsBtn) {
            releseTestDetails(releseTestDetailsBtn);
            return;
        }

        // close document
        const closeTestDocumentBtn = e.target.closest("#close-test-release-details")
        if (closeTestDocumentBtn) {
            closeTestDocument();
            return;
        }
    });
    
}

async function sampleReleasedTest(viewSampleReleaseTestBtn) {

    const sampleName = viewSampleReleaseTest.dataset.sampleName;
    const testName = viewSampleReleaseTest.dataset.testName;

    const panel = document.getElementById("sample-release-component-test-details");
    if (!panel) return;

    const title = document.getElementById("sample-release-component-test-details-title");
    const tbody = document.querySelector("#sample-review tbody");
    if (!title || !tbody) return;

    // Show panel
    panel.classList.remove("hidden");
    // Set title
    title.textContent = `Tests for: ${sampleName}`;
    // Clear old rows
    tbody.innerHTML = "";

    try {
        const res = await fetch(
            `http://localhost:8000/review_test/qa_approval`, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });

        const data = await res.json();
        const tests = data.tests || [];
        console.log("Fetched tests for review:", tests);

        // Render rows
        tests.forEach(t => {
            const row = document.createElement("tr");

            row.innerHTML = `
              <td>${t.test_name}</td>
              <td>${t.approved_by ?? ""}</td>
              <td>${t.test_result}</td>
              <td>${t.upper_spec ?? ""}</td>
              <td>${t.lower_spec ?? ""}</td>
              <td>${t.unit ?? ""}</td>
              <td>${t.status ?? ""}</td>
              <td>${t.approval_status ?? ""}</td>
              <td>
                <select class="release-test" name="release-test" required>
                    <option value=""></option>
                    <option value="True">Approved</option>
                    <option value="False">Rejected</option>
                </select>
              </td>
              <td style="display:flex; justify-content:center; align-items:center;">
                <button 
                class="submit-released-test" 
                data-test-name="${testName}" 
                data-sample-name="${sampleName}"
                >
                  Submit
                </button>
              </td>
          `;
            tbody.appendChild(row);
        });

    } catch (err) {
        console.error("API error", err);
    }
}


async function closeTestDocument() {
    document.getElementById("sample-release-component-test-details").classList.add("hidden");
}


async function releseTestDetails (releseTestDetailsBtn) {
    const testName = releseTestDetailsBtn.dataset.testName;
    const sampleName = releseTestDetailsBtn.dataset.sampleName;

    const statusSelect = btn.closest("tr").querySelector(".release-test");
    const approvedStatus = statusSelect.value === "True";

    try {
        const response = await fetch (
            `http://localhost:8000/review_test/qa_approval`,
            {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sample_name: sampleName,
                    test_name: testName,
                    released_by: localStorage.getItem("username"),
                    release_status: approvedStatus
                })

            }
        )

        if (response.ok) {
            alert("Test Released!");
            //remove row or reload panel
            btn.closest("tr").remove();
        } else {
            const errText = await response.text();
            console.error("Server error:", errText);
            alert(errText);
        }

    } catch (error) {
        console.log("Server error:", error);
    }
}