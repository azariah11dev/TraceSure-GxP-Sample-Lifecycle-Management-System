// run when the component HTML is present
async function loadActiveSamples() {
  try {
    const res = await fetch("http://localhost:8000/display_tests", {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    });

    if (!res.ok) {
      console.error("API error", res.status, await res.text());
      renderEmpty();
      return;
    }

    const samples = await res.json();
    renderSamples(samples);
  } catch (err) {
    console.error("Fetch error", err);
    renderEmpty();
  }
}

function renderSamples(samples = []) {
  const tbody = document.querySelector('#samples-table tbody');
  if (!tbody) return;

  tbody.innerHTML = '';

  if (!samples.length) {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td colspan="6" style="text-align:center">No active samples</td>`;
    tbody.appendChild(tr);
    return;
  }

  samples.forEach(s => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${escapeHtml(s.sample_name)}</td>
      <td>${escapeHtml(s.status || 'Not Started')}</td>
      <td>${Number(s.pending_tests) || 0}</td>
      <td>${Number(s.completed_tests) || 0}</td>
      <td>${Number(s.open_deviations) || 0}</td>
      <td>${escapeHtml(s.creation_date || '')}</td>
      <td class="view-tests-container"><button data-sample="${escapeHtml(s.sample_name)}" class="view-tests">View Tests</button></td>
    `;
    tbody.appendChild(row);
  });
}

function renderEmpty() {
  const tbody = document.querySelector('#samples-table tbody');
  if (!tbody) return;
  tbody.innerHTML = `<tr><td colspan="6" style="text-align:center">Unable to load samples</td></tr>`;
}

function escapeHtml(str = '') {
  return String(str).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// Attach a single delegated click handler to the table body (attach once)
function attachDelegatedHandlers() {
  const tbody = document.querySelector('#samples-table tbody');
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
waitForElement('#samples-table tbody').then(() => {
  attachDelegatedHandlers();
  loadActiveSamples();
});

// ==========================View Tests Details Panel Logic==========================

if (!window.__sampleTestingInitialized) {
  window.__sampleTestingInitialized = true;

  let currentSampleName = null;

    document.addEventListener("click", async (e) => {
      if (!e.target.classList.contains("view-tests")) return;

      const sampleName = e.target.dataset.sample;
      currentSampleName = sampleName;

      await loadTestsForSample(sampleName);
    });

    // Close button (attach ONCE)
    document.getElementById("close-test-details").addEventListener("click", () => {
      document.getElementById("sample-testing-component-test-details").classList.add("hidden");
    });

    // Modify button (delegated)
    document.addEventListener("click", (e) => {
      if (!e.target.classList.contains("modify-test-result")) return;

      const row = e.target.closest("tr");
      const input = row.querySelector(".test-result-input");
      const submitBtn = row.querySelector(".submit-test-result");

      input.disabled = false;
      submitBtn.disabled = false;

      e.target.hidden = true;
    });

    async function loadTestsForSample(sampleName) {
      const panel = document.getElementById("sample-testing-component-test-details");
      const title = document.getElementById("sample-testing-component-test-details-title");
      const tbody = document.querySelector("#samples-tests tbody");

      // Show panel
      panel.classList.remove("hidden");
      // Set title
      title.textContent = `Tests for: ${sampleName}`;
      // Clear old rows
      tbody.innerHTML = "";

      // Fetch tests
      const response = await fetch(`http://localhost:8000/display_tests/${sampleName}`);
      const tests = await response.json();

      // Render rows
      tests.forEach(t => {
        const row = document.createElement("tr");
        const isCompleted = t.result !== null && t.result !== undefined && t.result !== "";

        // Optional: color-code status
        let statusClass = "";
        if (t.status === "pass") statusClass = "status-pass";
        if (t.status === "out_of_trend") statusClass = "status-oot";
        if (t.status === "out_of_specification") statusClass = "status-oos";

        row.innerHTML = `
              <td>${t.test_name}</td>
              <td>
                  <input type="number"
                  class="test-result-input"
                  placeholder="Enter result"
                  value="${t.result ?? ""}" 
                  data-original="${t.result ?? ""}"
                  ${isCompleted ? "disabled" : ""}/>
              </td>
              <td>${t.spec_upper ?? ""}</td>
              <td>${t.spec_lower ?? ""}</td>
              <td>${t.unit ?? ""}</td>
              <td>${t.status ?? ""}</td>
              <td>${t.open_deviation ? "Yes" : "No"}</td>
              <td>
                  <button class="submit-test-result"
                  data-test="${t.test_name}"
                  ${isCompleted ? "disabled" : ""}>
                    Submit Result
                  </button>
                  <button class="modify-test-result"
                  data-test="${t.test_name}"
                  ${isCompleted ? "" : "hidden"}>
                    Modify Result
                  </button>
              </td>
          `;
        tbody.appendChild(row);
      });
    }

    document.addEventListener("click", async (e) => {
      if (!e.target.classList.contains("submit-test-result")) return;

      const row = e.target.closest("tr");
      const input = row.querySelector(".test-result-input");
      const original = input.dataset.original ?? "";
      const updated = input.value.trim();

      // Value cannot be empty
      if (updated === "") {
        alert("Result value cannot be empty.");
        return;
      }

      // If unchanged, do nothing
      if (updated === original) {
        alert("No changes detected.");
        return;
      }

      // If this was a modification, require justification
      let explanation = null;
      if (original !== "" && updated !== original) {
        explanation = prompt("Provide justification for modifying this result:");
        if (!explanation) {
          alert("Modification cancelled — justification required.");
          input.value = original;
          input.disabled = true;
          return;
        }
      }

      const response = await fetch("http://localhost:8000/update_test_result/log_results", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          test_name: e.target.dataset.test,
          performed_by: localStorage.getItem("username"),
          result_value: updated,
          sample_name: currentSampleName,
          explanation: explanation
        })
      });

      if (response.ok) {
        alert("Result submitted!");
        input.dataset.original = updated;
        // Automatically refresh the table so status updates
        await loadTestsForSample(currentSampleName);

      } else {
        let message = "An error occurred.";
        try {
          const errorData = await response.json();
          message = errorData.detail || message;
        } catch { }
        alert(message);
      }
    });
}