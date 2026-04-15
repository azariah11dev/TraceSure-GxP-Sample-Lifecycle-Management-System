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

  waitForElement("#sample-deviation-component-deviation-details").then(() => {

    // VIEW DEVIATION HANDLER
    document.addEventListener("click", async (e) => {
      const btn = e.target.closest(".view-tests-deviations");
      if (!btn) return;

      const sampleValue = btn.dataset.sample;
      const testValue = btn.dataset.test;

      //Load the form into the container
      await loadDeviationForm("#sample-deviation-component-deviation-details");

      // SHOW THE PANEL
      document.getElementById("sample-deviation-component-deviation-details")
        .classList.remove("hidden");

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
          `http://localhost:8000/deviation_form?sample_name=${encodeURIComponent(sampleValue)}&test_name=${encodeURIComponent(testValue)}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" }
          }
        );

        if (res.ok) {
          const deviation = await res.json();

          if (!deviation) {
            console.log("No existing deviation found — new form");
            return; // stop here, do NOT try to autofill
          }

          // wait for form fields all at once
          await Promise.all([
            waitForElement("#PR-number"),
            waitForElement("#deviation-date"),
            waitForElement("#deviation-report-date"),
            waitForElement("#deviation-department"),
            waitForElement("#deviation-reported-at"),
            waitForElement("#deviation-type"),
            waitForElement("#deviation-severity"),
            waitForElement("#deviation-short-description"),
            waitForElement("#deviation-long-description"),
            waitForElement("#deviation-location"),
            waitForElement("#deviation-sop-number"),
            waitForElement("#deviation-instrument-id"),
            waitForElement("#test_name"),
            waitForElement("#deviation-sample-type"),
            waitForElement("#deviation-quantity-impacted"),
            waitForElement("#deviation-batch-released"),
            waitForElement("#potential-impact-to-product-quality"),
            waitForElement("#immediate-action-taken"),
            waitForElement("#date-action-taken"),
            waitForElement("#deviation-test-performed-by"),
            waitForElement("#was-testing-repeated"),
            waitForElement("#reference-to-retest"),
            waitForElement("#investigation-required"),
            waitForElement("#investigation-assigned-to"),
            waitForElement("#investigation-start-date"),
            waitForElement("#investigation-end-date"),
            waitForElement("#root-cause-category"),
            waitForElement("#root-cause-description"),
            waitForElement("#capa-required"),
            waitForElement("#correction-action"),
            waitForElement("#preventative-action"),
            waitForElement("#responsible-person"),
            waitForElement("#target-completion-date"),
            waitForElement("#effectiveness-check-required"),
            waitForElement("#batch-disposition"),
          ]);

          // helper — converts bool true/false → "True"/"False" for select options
          const toSelectBool = (v) => {
            if (v === true || v === "true" || v === "1" || v === "yes") return "True";
            if (v === false || v === "false" || v === "0" || v === "no") return "False";
            return "";
          };

          // helper — strips time portion for date inputs: "2024-01-15T00:00:00" → "2024-01-15"
          const toDate = (v) => v ? v.split("T")[0] : "";

          // helper — formats for datetime-local: "2024-01-15T14:30:00" → "2024-01-15T14:30"
          const toDateTimeLocal = (v) => v ? v.slice(0, 16) : "";

          // text / textarea fields — these work fine with direct assignment
          document.querySelector("#PR-number").value = deviation.deviation_code || "";
          document.querySelector("#deviation-reported-at").value = deviation.deviation_reported_at || "";
          document.querySelector("#deviation-short-description").value = deviation.deviation_short_description || "";
          document.querySelector("#deviation-long-description").value = deviation.deviation_long_description || "";
          document.querySelector("#deviation-sop-number").value = deviation.deviation_sop_number || "";
          document.querySelector("#deviation-instrument-id").value = deviation.deviation_instrument_id || "";
          document.querySelector("#deviation-quantity-impacted").value = deviation.deviation_quantity_impacted ?? "";
          document.querySelector("#potential-impact-to-product-quality").value = deviation.potential_impact_to_product_quality || "";
          document.querySelector("#immediate-action-taken").value = deviation.immediate_action_taken || "";
          document.querySelector("#deviation-test-performed-by").value = deviation.deviation_test_performed_by || "";
          document.querySelector("#reference-to-retest").value = deviation.reference_to_retest || "";
          document.querySelector("#investigation-assigned-to").value = deviation.investigation_assigned_to || "";
          document.querySelector("#root-cause-description").value = deviation.root_cause_description || "";
          document.querySelector("#correction-action").value = deviation.correction_action || "";
          document.querySelector("#preventative-action").value = deviation.preventative_action || "";
          document.querySelector("#responsible-person").value = deviation.responsible_person || "";

          // date fields — strip the time portion
          document.querySelector("#date-action-taken").value = toDate(deviation.date_action_taken);
          document.querySelector("#investigation-start-date").value = toDate(deviation.investigation_start_date);
          document.querySelector("#investigation-end-date").value = toDate(deviation.investigation_end_date);
          document.querySelector("#target-completion-date").value = toDate(deviation.target_completion_date);

          // datetime-local fields — keep only up to minutes
          document.querySelector("#deviation-date").value = toDateTimeLocal(deviation.deviation_date);
          document.querySelector("#deviation-report-date").value = toDateTimeLocal(deviation.deviation_report_date);

          // select fields — value must exactly match an option
          document.querySelector("#deviation-department").value = deviation.deviation_department || "";
          document.querySelector("#deviation-type").value = deviation.deviation_type || "";
          document.querySelector("#deviation-severity").value = deviation.deviation_severity || "";
          document.querySelector("#deviation-location").value = deviation.deviation_location || "";
          document.querySelector("#deviation-sample-type").value = deviation.deviation_sample_type || "";
          document.querySelector("#root-cause-category").value = deviation.root_cause_category || "";
          document.querySelector("#batch-disposition").value = deviation.batch_disposition || "";

          // boolean selects — must convert to "True"/"False" string
          document.querySelector("#deviation-batch-released").value = toSelectBool(deviation.deviation_batch_released);
          document.querySelector("#was-testing-repeated").value = toSelectBool(deviation.was_testing_repeated);
          document.querySelector("#investigation-required").value = toSelectBool(deviation.investigation_required);
          document.querySelector("#capa-required").value = toSelectBool(deviation.capa_required);
          document.querySelector("#effectiveness-check-required").value = toSelectBool(deviation.effectiveness_check_required);

          console.log("Loaded deviation:", deviation);
        } else {
          console.log("No existing deviation found — new form");
        }
      } catch (err) {
        console.error("Error loading deviation:", err);
      }
    });

    // CLOSE + SUBMIT HANDLER
    document.addEventListener("click", async (e) => {

      // Close button
      if (e.target.closest("#deviation-form-close-button")) {
        e.preventDefault();
        e.stopPropagation();
        document.getElementById("sample-deviation-component-deviation-details").classList.add("hidden");
        return;
      }

      const submitBtn = e.target.closest("#deviation-form-submit-button");
      const saveBtn = e.target.closest("#deviation-form-save-button");

      // Submit or save button
      if (submitBtn || saveBtn) {
        e.preventDefault();
        e.stopPropagation();

        const formStatus = saveBtn ? "draft" : "submitted";

        const sampleValue = document.getElementById("sample_name").value;
        const testValue = document.getElementById("test_name").value;

        const form = document.getElementById("deviation-form");
        const data = Object.fromEntries(new FormData(form).entries());

        const submittedBy = localStorage.getItem("username");
        const role = localStorage.getItem("role");

        const toBool = (v) => {
          if (!v) return false;
          v = v.toString().toLowerCase();
          return v === "yes" || v === "true" || v === "1";
        };

        const response = await fetch("http://localhost:8000/deviation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...data,
            form_status: formStatus,
            submitted_by: submittedBy,
            submitted_by_role: role,
            approver_name: null,
            approver_role: null,
            approval_status: null,
            sample_name: sampleValue,
            test_name: testValue,

            // FIXED booleans
            was_testing_repeated: toBool(data["was_testing_repeated"]),
            deviation_batch_released: toBool(data["deviation_batch_released"]),
            capa_required: toBool(data["capa_required"]),
            effectiveness_check_required: toBool(data["effectiveness_check_required"]),

            // FIXED ints
            deviation_quantity_impacted: data["deviation_quantity_impacted"] === "" ? null : Number(data["deviation_quantity_impacted"]),

            // add these to your special cases in the fetch body
            investigation_start_date: data["investigation_start_date"] || null,
            investigation_end_date: data["investigation_end_date"] || null,
            target_completion_date: data["target_completion_date"] || null,
          }),
        });

        if (response.ok) {
          alert("Deviation Form was Successfully submitted");
        } else {
          let message = "An error occurred.";
          try {
            const errorData = await response.json();
            // after — Pydantic returns detail as an array of error objects
            if (Array.isArray(errorData.detail)) {
              message = errorData.detail.map(err => `${err.loc.join(" → ")}: ${err.msg}`).join("\n");
            } else {
              message = errorData.detail || message;
            }
          } catch { }
          alert(message);
        }
      }
    });
  });
}