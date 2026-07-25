async function getDeviationDocument() {
    try {
        const response = await fetch(`http://localhost:8000/deviation_form/modification`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });

        const data = await response.json();
        DeviationList(data);

    } catch (error) {
        console.error("Error fetching deviations:", error);
        renderEmpty();
    }
}

function DeviationList(deviations = []) {
    const tbody = document.querySelector("#deviation-document-table tbody");
    if (!tbody) {
        console.error("Table body element not found");
        return;
    }

    tbody.innerHTML = "";

    if (!deviations.length) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align:center">No deviations found</td>
            </tr>`;
        return;
    }

    deviations.forEach((dev) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${escapeHtml(dev.sample_name)}</td>
            <td>${escapeHtml(dev.test_name)}</td>
            <td>${escapeHtml(dev.deviation_code)}</td>
            <td>${escapeHtml(dev.deviation_date)}</td>
            <td style="display:flex; justify-content:center; align-items:center;">
                <button
                    data-sample-name="${escapeHtml(dev.sample_name)}"
                    data-test-name="${escapeHtml(dev.test_name)}"
                    class="view-deviation-form-btn"
                >
                    View
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function renderEmpty() {
    const tbody = document.querySelector('#deviation-document-table tbody');
    if (!tbody) return;
    tbody.innerHTML = `
        <tr>
            <td colspan="5" style="text-align:center">Unable to load deviation Form</td>
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

waitForElement('#deviation-document-table tbody').then(() => {
    getDeviationDocument();
});



// ==========================Delegated handler for deviation form==========================

if (!document.body.dataset.deviationDocumentListenerInit) {
    document.body.dataset.deviationDocumentListenerInit = "true";

    document.addEventListener("click", async (e) => {
        // view deviation form
        const deviationDocumentDisplayBtn = e.target.closest(".view-deviation-form-btn");
        if (deviationDocumentDisplayBtn) {
            deviationDocumentDisplay(deviationDocumentDisplayBtn);
            return;
        }
        // submit deviation form
        const deviationDocumentSubmitBtn = e.target.closest("#deviation-form-submit-button");
        // save deviation form
        const deviationDocumentSaveBtn = e.target.closest("#deviation-form-save-button");
        if (deviationDocumentSubmitBtn || deviationDocumentSaveBtn) {
            deviationDocumentProcess(deviationDocumentSubmitBtn, deviationDocumentSaveBtn, e);
            return;
        }
        // close deviation form
        const deviationDocumentCloseBtn = await e.target.closest("#deviation-form-close-button");
        if (deviationDocumentCloseBtn) {
            deviationDocumentClose();
            return;
        }
    });
}

async function deviationDocumentClose() {
    document.getElementById("deviation-form-display").classList.add("hidden");
}

async function deviationDocumentDisplay (deviationDocumentDisplayBtn) {

    const sampleName = deviationDocumentDisplayBtn.dataset.sampleName
    const testName = deviationDocumentDisplayBtn.dataset.testName

    const panel = document.getElementById("deviation-form-display");
    if (!panel) return;   // prevents navigation crash
    panel.classList.remove("hidden");

    try {
        // sampleName and testName were interpolated raw into the
        // query string. Any value containing spaces, ampersands, slashes, or
        // other reserved characters would silently corrupt the URL, causing the
        // server to return no matching record even though one exists.
        // Wrap both values in encodeURIComponent so the URL is always valid.
        const res = await fetch(
            `http://localhost:8000/deviation_form/?sample_name=${encodeURIComponent(sampleName)}&test_name=${encodeURIComponent(testName)}`,
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
            const deviationDocument = document.querySelector("#deviation-form-display")
            deviationDocument.innerHTML = `
                <h1 style="text-align: center; font-size: 32px;">
                    No deviation form available
                </h1>
            `;
            return;
        } else {
            await loadDeviationForm("#deviation-form-display");
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

async function deviationDocumentProcess(deviationDocumentSubmitBtn, deviationDocumentSaveBtn, e) {

    const submitBtn = deviationDocumentSubmitBtn;
    const saveBtn = deviationDocumentSaveBtn;

    console.log(submitBtn, saveBtn)

    if (submitBtn || saveBtn) {
        e.preventDefault();
        e.stopPropagation();

        const formStatus = saveBtn ? "draft" : "submitted";
        const sampleValue = document.getElementById("sample_name").value;
        const testValue = document.getElementById("test_name").value;
        const deviationCode = document.getElementById("PR-number").value;

        const form = document.getElementById("deviation-form");
        const data = Object.fromEntries(new FormData(form).entries());

        const submittedBy = localStorage.getItem("username");
        const role = localStorage.getItem("role");

        const toBool = (v) => {
          if (!v) return false;
          v = v.toString().toLowerCase();
          return v === "yes" || v === "true" || v === "1";
        };

        const response = await fetch("http://localhost:8000/deviation/modification", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...data,
            deviation_code: deviationCode,
            form_status: formStatus,
            submitted_by: submittedBy,
            submitted_by_role: role,
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
          alert(`submission of ${formStatus} deviation form was made`);
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
}