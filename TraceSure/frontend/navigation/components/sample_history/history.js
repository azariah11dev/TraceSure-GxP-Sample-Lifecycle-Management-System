// run when the component HTML is present
async function loadHistoricalSamples() {
    try {
        const res = await fetch(
            "http://localhost:8000/display_tests/historical", {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });

        const samples = await res.json();
        console.log("Fetched samples:", samples.samples);
        renderHistoricalSamples(samples.samples);

    } catch (err) {
        console.error("API error", err);
        renderEmpty();
    }
}

function renderHistoricalSamples(samples = []) {
    const tbody = document.querySelector('#sample-history-table tbody');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (!samples.length) {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td colspan="7" style="text-align:center">No acompleted samples</td>`;
        tbody.appendChild(tr);
        return;
    }

    samples.forEach(s => {
        const row = document.createElement('tr');
        row.innerHTML = `
      <td>${escapeHtml(s.sample_name)}</td>
      <td>${Number(s.total_tests) || 0}</td>
      <td>${escapeHtml(s.creation_date || '')}</td>
      <td>${escapeHtml(s.completed_date || '')}</td>
      <td>${escapeHtml(s.total_days || '')}</td>
      <td style="display:flex; justify-content:center; align-items:center;">
        <button
        data-sample-name="${escapeHtml(s.sample_name)}"
         class="view-completed-tests"
         >
            View Tests
        </button>
      </td>
    `;
        tbody.appendChild(row);
    });
}

function renderEmpty() {
    const tbody = document.querySelector('#sample-history-table tbody');
    if (!tbody) return;
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center">Unable to load samples</td></tr>`;
}

function escapeHtml(str = '') {
    return String(str).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// Attach a single delegated click handler to the table body (attach once)
function attachDelegatedHandlers() {
    const tbody = document.querySelector('#sample-history-table tbody');
    if (!tbody) return;

    // Remove previous handler if any (idempotent)
    tbody.removeEventListener('click', delegatedClick);
    tbody.addEventListener('click', delegatedClick);
}

function delegatedClick(e) {
    const btn = e.target.closest('button.view-completed-tests');
    if (!btn) return;
}

// Ensure the table exists, then initialize
waitForElement('#sample-history-table tbody').then(() => {
    attachDelegatedHandlers();
    loadHistoricalSamples();
});

// ==========================View Tests Details Panel Logic==========================

if (document.querySelector(".sample-history-component") && !document.body.dataset.historicalSampleInit) {
    document.body.dataset.historicalSampleInit = "true";
    historicalSampleInitialized();
}

async function historicalSampleInitialized() {

    document.addEventListener("click", async (e) => {
        //view historical tests
        const viewDeviationFormBtn = e.target.closest(".view-completed-tests");
        if (viewDeviationFormBtn) {
            await loadDataForHistoricalSample(viewDeviationFormBtn);
            return;
        }
        //open deviation form btn
        const openDeviationFormBtn = e.target.closest(".view-deviation-form")
        if (openDeviationFormBtn) {
            deviationFormHistorical(openDeviationFormBtn);
            return;
        }
        // Close button deviation form
        const closeDeviationFormBtn = e.target.closest("#deviation-form-close-button")
        if (closeDeviationFormBtn) {
            closeDeviationForm();
            return;
        }
        // Close form
        const closeHistoricalTestDetailsBtn = e.target.closest("#close-historical-review-details")
        if (closeHistoricalTestDetailsBtn) {
            closeHistoricalTestDetails();
            return;
        }
    });
}

async function closeHistoricalTestDetails() {
    document.getElementById("sample-history-component-test-details").classList.add("hidden");
}

async function loadDataForHistoricalSample(viewDeviationFormBtn) {

    const sampleName = viewDeviationFormBtn.dataset.sampleName
    const panel = document.getElementById("sample-history-component-test-details");
    if (!panel) return;

    const title = document.getElementById("sample-history-component-test-details-title");
    const tbody = document.querySelector("#sample-history-test-table tbody");
    if (!title || !tbody) return;

    // Show panel
    panel.classList.remove("hidden");
    // Set title
    title.textContent = `Tests for: ${sampleName}`;
    // Clear old rows
    tbody.innerHTML = "";

    try {
        const res = await fetch(
            `http://localhost:8000/display_tests/historical`, {
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
              <td>${t.performed_by ?? ""}</td>
              <td>${t.test_result}</td>
              <td>${t.upper_spec ?? ""}</td>
              <td>${t.lower_spec ?? ""}</td>
              <td>${t.unit ?? ""}</td>
              <td>${t.status ?? ""}</td>
              <td>${t.reviewed_by ?? ""}</td>
              <td>${t.deviation ?? ""}</td>
              <td style="display:flex; justify-content:center; align-items:center;">
                <button
                 class="view-deviation-form"
                 data-sample-name="${sampleName}"
                 data-test-name="${t.test_name}"
                 >
                  Form
                </button>
              </td>
              <td>${t.approved_by ?? ""}</td>
              <td>${t.released_by ?? ""}</td>
          `;
            tbody.appendChild(row);
        });

    } catch (err) {
        console.error("API error", err);
    }
}

async function deviationFormHistorical (openDeviationFormBtn) {

    const sampleName = openDeviationFormBtn.dataset.sampleName;
    const testName = openDeviationFormBtn.dataset.testName;

    const panel = document.getElementById("sample-historical-deviations-component-details");
    if (!panel) return;   // prevents navigation crash
    panel.classList.remove("hidden");

    try {
        // sampleName and testName were interpolated raw into the
        // query string. Any value containing spaces, ampersands, slashes, or
        // other reserved characters would silently corrupt the URL, causing the
        // server to return no matching record even though one exists.
        // Wrap both values in encodeURIComponent so the URL is always valid.
        const res = await fetch(
            `http://localhost:8000/deviation_form/review?sample_name=${encodeURIComponent(sampleName)}&test_name=${encodeURIComponent(testName)}`,
            {
                method: "GET",
                headers: { "Content-Type": "application/json" }
            }
        );

        if (!res.ok) {
            const errText = await res.text();
            console.error("Server error:", errText);
            alert(errText);
            return;
        }

        const deviation = await res.json();

        // the autofill whenever any field inside the object was falsy.
        // The backend returns a JSON null when no record exists, so the guard
        // only needs to catch that specific case — not all falsy field values.
        if (deviation === null) {
            const deviationDocument = document.querySelector("#sample-deviations-component-details")
            deviationDocument.innerHTML = `
                <h1 style="text-align: center; font-size: 32px;">
                    No deviation form available
                </h1>
            `;
            return;
        } else {
            await loadDeviationForm("#sample-historical-deviations-component-details");

            const submitBtn = document.getElementById("deviation-form-submit-button");
            if (submitBtn) submitBtn.style.display = "none";

            const saveBtn = document.getElementById("deviation-form-save-button");
            if (saveBtn) saveBtn.style.display = "none"
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

        // ── Text / textarea fields ────────────────────────────────────
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

        // ── Date fields ───────────────────────────────────────────────
        document.querySelector("#date-action-taken").value = toDate(deviation.date_action_taken);
        document.querySelector("#investigation-start-date").value = toDate(deviation.investigation_start_date);
        document.querySelector("#investigation-end-date").value = toDate(deviation.investigation_end_date);
        document.querySelector("#target-completion-date").value = toDate(deviation.target_completion_date);

        // ── Datetime-local fields ─────────────────────────────────────
        document.querySelector("#deviation-date").value = toDateTimeLocal(deviation.deviation_date);
        document.querySelector("#deviation-report-date").value = toDateTimeLocal(deviation.deviation_report_date);

        // ── Plain select fields ───────────────────────────────────────
        document.querySelector("#deviation-department").value = deviation.deviation_department || "";
        document.querySelector("#deviation-type").value = deviation.deviation_type || "";
        document.querySelector("#deviation-severity").value = deviation.deviation_severity || "";
        document.querySelector("#deviation-location").value = deviation.deviation_location || "";
        document.querySelector("#deviation-sample-type").value = deviation.deviation_sample_type || "";
        document.querySelector("#root-cause-category").value = deviation.root_cause_category || "";
        document.querySelector("#batch-disposition").value = deviation.batch_disposition || "";

        // ── Boolean select fields ─────────────────────────────────────
        document.querySelector("#deviation-batch-released").value = toSelectBool(deviation.deviation_batch_released);
        document.querySelector("#was-testing-repeated").value = toSelectBool(deviation.was_testing_repeated);
        document.querySelector("#investigation-required").value = toSelectBool(deviation.investigation_required);
        document.querySelector("#capa-required").value = toSelectBool(deviation.capa_required);
        document.querySelector("#effectiveness-check-required").value = toSelectBool(deviation.effectiveness_check_required);

        console.log("Loaded deviation:", deviation);

    } catch (err) {
        console.error("Error loading deviation:", err);
    }
}

async function closeDeviationForm () {
    document.getElementById("sample-historical-deviations-component-details").classList.add("hidden");
}