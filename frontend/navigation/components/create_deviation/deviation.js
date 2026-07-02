async function loadActiveSamples() {
  try {
    const res = await fetch("http://localhost:8000/display_tests/deviations", {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    });

    if (!res.ok) {
      console.error("API error", res.status);
      renderEmpty();
      return;
    }

    const tests = await res.json();
    //console.log("tests:", tests);
    //console.log("isArray:", Array.isArray(tests));
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

  // If any row is already approved, reveal the Retest column header immediately
  // so it lines up with the retest cells that will be shown in those rows.
  const anyApproved = tests.some(t => t.form_status?.toLowerCase() === "approved");

  tests.forEach(t => {
    const isApproved = t.form_status?.toLowerCase() === "approved";

    // Cell visibility is determined at render time from t.form_status — no need
    // to wait for the user to open the deviation panel and rely on the click
    // handler to do the swap. Approved rows show the Retest cell and hide the
    // View cell; non-approved rows show View and hide Retest.
    const viewClass = isApproved ? "view-deviation-container hidden" : "view-deviation-container";
    const retestClass = isApproved ? "retest-sample-container" : "retest-sample-container hidden";

    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${escapeHtml(t.sample_name)}</td>
      <td>${escapeHtml(t.test_name)}</td>
      <td>${t.result}</td>
      <td>${t.spec_upper ?? ""}</td>
      <td>${t.spec_lower ?? ""}</td>
      <td>${escapeHtml(t.unit ?? "")}</td>
      <td>${escapeHtml(t.deviation_status ?? "")}</td>
      <td class="${viewClass}">
        <button
          data-sample="${escapeHtml(t.sample_name)}"
          data-test="${escapeHtml(t.test_name)}"
          data-form-status="${escapeHtml(t.form_status ?? "")}"
          class="view-tests-deviations"
        >
          View Deviation
        </button>
      </td>
      <td class="${retestClass}">
        <button
          data-sample="${escapeHtml(t.sample_name)}"
          data-test="${escapeHtml(t.test_name)}"
          data-form-status="${escapeHtml(t.form_status ?? "")}"
          class="retest-sample-btn"
        >
          Retest Sample
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

      // Capture row reference before any await — loadDeviationForm does DOM
      // work that can detach the button node, making btn.closest("tr") return
      // null if called after the await.
      const tableRow = btn.closest("tr");

      await loadDeviationForm("#sample-deviation-component-deviation-details");

      document.getElementById("sample-deviation-component-deviation-details")
        .classList.remove("hidden");

      Promise.all([
        waitForElement("#sample_name"),
        waitForElement("#test_name")
      ]).then(([sampleEl, testEl]) => {
        sampleEl.value = sampleValue;
        testEl.value = testValue;
      });

      try {
        const res = await fetch(
          `http://localhost:8000/deviation_form?sample_name=${encodeURIComponent(sampleValue)}&test_name=${encodeURIComponent(testValue)}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" }
          }
        );

        if (!res.ok) {
          console.log("No existing deviation found — new form");
          return;
        }

        const deviation = await res.json();

        if (deviation === null || deviation === undefined) {
          console.log("No existing deviation found — new form");
          return;
        }

        const isApproved = deviation.form_status?.toLowerCase() === "approved";

        const submitBtn = await waitForElement("#deviation-form-submit-button");
        const saveBtn = await waitForElement("#deviation-form-save-button");

        if (isApproved) {
          submitBtn.style.display = "none";
          saveBtn.style.display = "none";

          // Swap the row's action cells using the pre-captured tableRow reference
          const retestHeader = document.querySelector(".retest-information");
          const viewContainer = tableRow?.querySelector(".view-deviation-container");
          const retestContainer = tableRow?.querySelector(".retest-sample-container");

          if (retestHeader) retestHeader.classList.remove("hidden");
          if (viewContainer) viewContainer.classList.add("hidden");
          if (retestContainer) retestContainer.classList.remove("hidden");
        }

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

        const toSelectBool = (v) => {
          if (v === true || v === "true" || v === "1" || v === "yes") return "True";
          if (v === false || v === "false" || v === "0" || v === "no") return "False";
          return "";
        };

        const toDate = (v) => v ? v.split("T")[0] : "";
        const toDateTimeLocal = (v) => v ? v.slice(0, 16) : "";

        // ── Text / textarea fields ────────────────────────────────────────
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

        // ── Date fields ───────────────────────────────────────────────────
        document.querySelector("#date-action-taken").value = toDate(deviation.date_action_taken);
        document.querySelector("#investigation-start-date").value = toDate(deviation.investigation_start_date);
        document.querySelector("#investigation-end-date").value = toDate(deviation.investigation_end_date);
        document.querySelector("#target-completion-date").value = toDate(deviation.target_completion_date);

        // ── Datetime-local fields ─────────────────────────────────────────
        document.querySelector("#deviation-date").value = toDateTimeLocal(deviation.deviation_date);
        document.querySelector("#deviation-report-date").value = toDateTimeLocal(deviation.deviation_report_date);

        // ── Plain select fields ───────────────────────────────────────────
        document.querySelector("#deviation-department").value = deviation.deviation_department || "";
        document.querySelector("#deviation-type").value = deviation.deviation_type || "";
        document.querySelector("#deviation-severity").value = deviation.deviation_severity || "";
        document.querySelector("#deviation-location").value = deviation.deviation_location || "";
        document.querySelector("#deviation-sample-type").value = deviation.deviation_sample_type || "";
        document.querySelector("#root-cause-category").value = deviation.root_cause_category || "";
        document.querySelector("#batch-disposition").value = deviation.batch_disposition || "";

        // ── Boolean select fields ─────────────────────────────────────────
        document.querySelector("#deviation-batch-released").value = toSelectBool(deviation.deviation_batch_released);
        document.querySelector("#was-testing-repeated").value = toSelectBool(deviation.was_testing_repeated);
        document.querySelector("#investigation-required").value = toSelectBool(deviation.investigation_required);
        document.querySelector("#capa-required").value = toSelectBool(deviation.capa_required);
        document.querySelector("#effectiveness-check-required").value = toSelectBool(deviation.effectiveness_check_required);

        console.log("Loaded deviation:", deviation);

      } catch (err) {
        console.error("Error loading deviation:", err);
      }
    });

    // CLOSE + SUBMIT HANDLER
    document.addEventListener("click", async (e) => {

      if (e.target.closest("#deviation-form-close-button")) {
        e.preventDefault();
        e.stopPropagation();
        document.getElementById("sample-deviation-component-deviation-details").classList.add("hidden");
        return;
      }

      const submitBtn = e.target.closest("#deviation-form-submit-button");
      const saveBtn = e.target.closest("#deviation-form-save-button");

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

            was_testing_repeated: toBool(data["was_testing_repeated"]),
            deviation_batch_released: toBool(data["deviation_batch_released"]),
            capa_required: toBool(data["capa_required"]),
            effectiveness_check_required: toBool(data["effectiveness_check_required"]),

            deviation_quantity_impacted: data["deviation_quantity_impacted"] === ""
              ? null
              : Number(data["deviation_quantity_impacted"]),

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
            if (Array.isArray(errorData.detail)) {
              message = errorData.detail
                .map(err => `${err.loc.join(" → ")}: ${err.msg}`)
                .join("\n");
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

// ==========================Retest Panel Logic==========================

if (!window.__retestInitialized) {
  window.__retestInitialized = true;

  document.addEventListener("click", async (e) => {
    const retestBtn = e.target.closest(".retest-sample-btn");
    if (!retestBtn) return;

    const sampleValue = retestBtn.dataset.sample;
    const testValue = retestBtn.dataset.test;

    try {
      const res = await fetch(
        `http://localhost:8000/deviation_form/tests?sample_name=${encodeURIComponent(sampleValue)}&test_name=${encodeURIComponent(testValue)}`
      );

      if (!res.ok) {
        console.error("API error", res.status);
        return;
      }

      const tests = await res.json();
      console.log("tests:", tests);
      //console.log("isArray:", Array.isArray(tests));

      renderSamples(tests);
    } catch (err) {
      console.log(err);
    }
  });
}

if (!window.__submitDeviationInitialized) {
  window.__submitDeviationInitialized = true;

  document.addEventListener("click", async (e) => {
    if (!e.target.classList.contains("submit-deviation-results")) return;

    const btn = e.target;

    const sampleName = btn.dataset.sampleName;
    const testName = btn.dataset.testName;
    const deviationCode = btn.dataset.deviationCode;
    const previousPerformer = btn.dataset.previousPerformer;
    const oldResult = Number(btn.dataset.oldResult);
    const upperLimit = Number(btn.dataset.upperLimit);
    const lowerLimit = Number(btn.dataset.lowerLimit);
    const unit = btn.dataset.unit;

    const row = btn.closest("tr");
    const input = row.querySelector(".deviation-test-result-input");
    const newResult = Number(input.value);

    btn.disabled = true;

    const response = await fetch("http://localhost:8000/update_deviation_form/final_test", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sample_name: sampleName,
        test_name: testName,
        deviation_code: deviationCode,
        test_performer: localStorage.getItem("username"),
        previous_performer: previousPerformer,
        old_result: oldResult,
        new_result: newResult,
        spec_range_upper_limit: upperLimit,
        spec_range_lower_limit: lowerLimit,
        unit: unit
      })
    });

    if (response.ok) {
      alert("Deviation result was successfully submitted");
      input.disabled = true;
      btn.disabled = true;
    } else {
      btn.disabled = false;
      let message = "An error occurred.";
      try {
        const errorData = await response.json();
        message = errorData.detail || message;
      } catch {}
      alert(message);
    }
  });

  document.addEventListener("click", (e) => {
  if (e.target.id !== "close-deviation-test-details") return;

  document.getElementById("deviation-retest-form").classList.add("hidden");
});

}

async function renderSamples(samples) {
  samples = Array.isArray(samples) ? samples : [samples];

  const panel = document.getElementById("deviation-retest-form");
  const title = document.getElementById("deviation-retest-title");
  const tbody = document.querySelector("#deviation-retest-table tbody");

  panel.classList.remove("hidden");
  title.textContent = `Tests for: ${samples[0].sample_name}`;
  tbody.innerHTML = "";

  samples.forEach(s => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${escapeHtml(s.test_name)}</td>
      <td>
        <input type="number"
          class="deviation-test-result-input"
          value="${s.result ?? ""}"
        />
      </td>
      <td>${s.spec_upper ?? ""}</td>
      <td>${s.spec_lower ?? ""}</td>
      <td>${s.unit ?? ""}</td>
      <td>${s.status ?? ""}</td>
      <td>
        <button class="submit-deviation-results"
          data-sample-name="${s.sample_name}"
          data-test-name="${s.test_name}"
          data-deviation-code="${s.deviation_code}"
          data-previous-performer="${s.previous_performer}"
          data-old-result="${s.old_result}"
          data-upper-limit="${s.spec_upper}"
          data-lower-limit="${s.spec_lower}"
          data-unit="${s.unit}"
        >
          Submit Result
        </button>
      </td>
    `;
    tbody.appendChild(row);
  });
}
