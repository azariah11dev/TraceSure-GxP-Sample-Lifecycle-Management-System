async function loadActiveSamples() {
  try {
    const res = await fetch("http://localhost:8000/display_tests/deviations", {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    });

    if (!res.ok) {
      console.error("API error", res.status, await res.text());
      renderEmpty();
      return;
    }

    const tests = await res.json();
    console.log("tests:", tests);
    console.log("isArray:", Array.isArray(tests))
    renderTests(tests);
  } catch (err) {
    console.error("Fetch error", err);
    renderEmpty();
  }
}

function renderTests(tests = []) {
  const tbody = document.querySelector('#samples-deviation-table tbody');
  if (!tbody) return;

  tbody.innerHTML = '';

  if (!tests.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align:center">No deviations found</td>
      </tr>`;
    return;
  }

  tests.forEach(t => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${escapeHtml(t.sample_name)}</td>
      <td>${escapeHtml(t.test_name)}</td>
      <td>${t.result}</td>
      <td>${t.spec_upper ?? ""}</td>
      <td>${t.spec_lower ?? ""}</td>
      <td>${escapeHtml(t.unit ?? "")}</td>
      <td>${escapeHtml(t.deviation_status ?? "")}</td>
      <td class="view-deviation-container">
        <button 
          data-sample="${escapeHtml(t.sample_name)}" 
          data-test="${escapeHtml(t.test_name)}"
          class="view-tests-deviations"
        >
          View Deviation
        </button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

function renderEmpty() {
  const tbody = document.querySelector('#samples-deviation-table tbody');
  if (!tbody) return;
  tbody.innerHTML = `
    <tr>
      <td colspan="8" style="text-align:center">Unable to load samples</td>
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

waitForElement('#samples-deviation-table tbody').then(() => {
  loadActiveSamples();
});

// ==========================View Deviation Details Panel Logic==========================

if (!window.__sampleDeviationInitialized) {
  window.__sampleDeviationInitialized = true;

  // wait deviation component HTML to exist
  waitForElement("#sample-deviation-component-deviation-details").then(() => {
    document.addEventListener("click", async (e) => {
      const btn = e.target.closest(".view-tests-deviations");
      if (!btn) return;

      const sampleValue = btn.dataset.sample;
      const testValue = btn.dataset.test;
      console.log("sampleValue:", sampleValue);
      console.log("testValue:", testValue);

      const panel = document.getElementById("sample-deviation-component-deviation-details");
      panel.classList.remove("hidden");

      //Load the form into the container
      await loadDeviationForm();

      //Automatically load the sample names
      Promise.all([
        waitForElement("#sample_name"),
        waitForElement("#test_name")
      ]).then(([sampleEl, testEl]) => {
        sampleEl.value = sampleValue;
        testEl.value = testValue;
      });

      // Fetch existing deviation (if any)
      try {
        const res = await fetch(
          `http://localhost:8000/deviation?sample_name=${encodeURIComponent(sampleValue)}&test_name=${encodeURIComponent(testValue)}`
        );

        if (res.ok) {
          const deviation = await res.json();
          
          // Auto-fill deviation fields
          await waitForElement("#PR-number");
          await waitForElement("#deviation-date");
          await waitForElement("#deviation-report-date");
          await waitForElement("#deviation-department");
          await waitForElement("#deviation-reported-at");
          await waitForElement("#deviation-type");
          await waitForElement("#deviation-severity");
          await waitForElement("#deviation-short-description");
          await waitForElement("#deviation-long-description");
          await waitForElement("#deviation-location");
          await waitForElement("#deviation-sop-number");
          await waitForElement("#deviation-instrument-id");
          await waitForElement("#test_name");
          await waitForElement("#deviation-sample-type");
          await waitForElement("#deviation-quantity-impacted");
          await waitForElement("#deviation-batch-released");
          await waitForElement("#potential-impact-to-product-quality");
          await waitForElement("#immediate-action-taken");
          await waitForElement("#date-action-taken");
          await waitForElement("#deviation-test-performed-by");
          await waitForElement("#was-testing-repeated");
          await waitForElement("#reference-to-retest");
          await waitForElement("#investigation-required");
          await waitForElement("#investigation-assigned-to");
          await waitForElement("#investigation-start-date");
          await waitForElement("#investigation-end-date");
          await waitForElement("#root-cause-category");
          await waitForElement("#root-cause-description");
          await waitForElement("#capa-required");
          await waitForElement("#correction-action");
          await waitForElement("#preventative-action");
          await waitForElement("#responsible-person");
          await waitForElement("#target-completion-date");
          await waitForElement("#effectiveness-check-required");
          await waitForElement("#batch-disposition");

          document.querySelector("#PR-number").value = deviation.deviation_code || "";
          document.querySelector("#deviation-date").value = deviation.deviation_date || "";
          document.querySelector("#deviation-report-date").value = deviation.deviation_report_date || "";
          document.querySelector("#deviation-department").value = deviation.deviation_department || "";
          document.querySelector("#deviation-reported-at").value = deviation.deviation_reported_at || "";
          document.querySelector("#deviation-type").value = deviation.deviation_type || "";
          document.querySelector("#deviation-severity").value = deviation.deviation_severity || "";
          document.querySelector("#deviation-short-description").value = deviation.deviation_short_description || "";
          document.querySelector("#deviation-long-description").value = deviation.deviation_long_description || "";
          document.querySelector("#deviation-location").value = deviation.deviation_location || "";
          document.querySelector("#deviation-sop-number").value = deviation.deviation_sop_number || "";
          document.querySelector("#deviation-instrument-id").value = deviation.deviation_instrument_id || "";
          document.querySelector("#test_name").value = deviation.test_name || "";
          document.querySelector("#deviation-sample-type").value = deviation.deviation_sample_type || "";
          document.querySelector("#deviation-quantity-impacted").value = deviation.deviation_quantity_impacted || "";
          document.querySelector("#deviation-batch-released").value = deviation.deviation_batch_released || "";
          document.querySelector("#potential-impact-to-product-quality").value = deviation.deviation_potential_impact_to_product_quality || "";
          document.querySelector("#immediate-action-taken").value = deviation.deviation_immediate_action_taken || "";
          document.querySelector("#date-action-taken").value = deviation.deviation_date_action_taken || "";
          document.querySelector("#deviation-test-performed-by").value = deviation.deviation_test_performed_by || "";
          document.querySelector("#was-testing-repeated").value = deviation.deviation_was_testing_repeated || "";
          document.querySelector("#reference-to-retest").value = deviation.deviation_reference_to_retest || "";
          document.querySelector("#investigation-required").value = deviation.deviation_investigation_required || "";
          document.querySelector("#investigation-assigned-to").value = deviation.deviation_investigation_assigned_to || "";
          document.querySelector("#investigation-start-date").value = deviation.deviation_investigation_start_date || "";
          document.querySelector("#investigation-end-date").value = deviation.deviation_investigation_end_date || "";
          document.querySelector("#root-cause-category").value = deviation.deviation_root_cause_category || "";
          document.querySelector("#root-cause-description").value = deviation.deviation_root_cause_description || "";
          document.querySelector("#capa-required").value = deviation.deviation_capa_required || "";
          document.querySelector("#correction-action").value = deviation.deviation_correction_action || "";
          document.querySelector("#preventative-action").value = deviation.deviation_preventative_action || "";
          document.querySelector("#responsible-person").value = deviation.deviation_responsible_person || "";
          document.querySelector("#target-completion-date").value = deviation.deviation_target_completion_date || "";
          document.querySelector("#effectiveness-check-required").value = deviation.deviation_effectiveness_check_required || "";
          document.querySelector("#batch-disposition").value = deviation.deviation_batch_disposition || "";

          console.log("Loaded deviation:", deviation);
        } else {
          console.log("No existing deviation found — new form");
        }
      } catch (err) {
        console.error("Error loading deviation:", err);
      }
      
      //Attach close btn listener
      waitForElement("#deviation-form-close-button").then(closeBtn => {
        closeBtn.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();

          panel.classList.add("hidden");
        });

        //Attach submit btn listener
        waitForElement("#deviation-form-submit-button").then(submitBtn => {
          submitBtn.addEventListener("click", async (e) => {
            e.preventDefault();
            e.stopPropagation();

            const form = document.getElementById("deviation-form");
            const data = Object.fromEntries(new FormData(form).entries());

            const response = await fetch("http://localhost:8000/deviation", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(data)
            });

            if (response.ok) {
              alert("Deviation Form was Successfully submited")
            } else {
              let message = "An error occurred.";
              try {
                const errorData = await response.json();
                message = errorData.detail || message;
              } catch { }
                  alert(message);
            }
          })
        });
      });
    });
  });
}