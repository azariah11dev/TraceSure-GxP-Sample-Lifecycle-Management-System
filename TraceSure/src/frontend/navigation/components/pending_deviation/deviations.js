async function getDeviations() {
    try {
        const response = await fetch(`http://localhost:8000/deviation_form/all_pending`, {
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
                    data-deviation-code="${escapeHtml(dev.deviation_code)}"
                    class="view-deviation-btn"
                >View</button>
            </td>

            <td class="deviation-btn-cell">
                <button
                    data-sample="${escapeHtml(dev.sample_name)}"
                    data-test="${escapeHtml(dev.test_name)}"
                    data-deviation-code="${escapeHtml(dev.deviation_code)}"
                    class="approve-deviation-btn"
                >Approve</button>
            </td>

            <td class="deviation-btn-cell">
                <button
                    data-sample="${escapeHtml(dev.sample_name)}"
                    data-test="${escapeHtml(dev.test_name)}"
                    data-deviation-code="${escapeHtml(dev.deviation_code)}"
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

if (!window.LoadDeviationDetails) {
    window.LoadDeviationDetails = true;
    console.log("LoadDeviationDetails initialized");

    document.addEventListener("click", async (e) => {
        const btn = e.target.closest(".view-deviation-btn");
        if (!btn) return;

        // Extract sample/test from button
        const sampleName = btn.dataset.sample;
        const testName = btn.dataset.test;

        if (!sampleName || !testName) {
            console.error("Missing sample/test values on button");
            return;
        }

        // Load form HTML
        await loadDeviationForm("#pending-deviations-component-details");

        // Show panel
        document.getElementById("pending-deviations-component-details")
            .classList.remove("hidden");

        // hide submit button and save for view-only mode
        const submitBtn = document.getElementById("deviation-form-submit-button");
        if (submitBtn) submitBtn.style.display = "none";
        const saveBtn = document.getElementById("deviation-form-save-button");
        if (saveBtn) saveBtn.style.display = "none";

        // Fetch existing deviation
        try {
            const res = await fetch(
                `http://localhost:8000/deviation_form?sample_name=${sampleName}&test_name=${testName}`,
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
            if (!deviation) {
                console.log("No existing deviation found — new form");
                return;
            }

            // Wait for all fields
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

            // Autofill fields
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

            document.querySelector("#date-action-taken").value = toDate(deviation.date_action_taken);
            document.querySelector("#investigation-start-date").value = toDate(deviation.investigation_start_date);
            document.querySelector("#investigation-end-date").value = toDate(deviation.investigation_end_date);
            document.querySelector("#target-completion-date").value = toDate(deviation.target_completion_date);

            document.querySelector("#deviation-date").value = toDateTimeLocal(deviation.deviation_date);
            document.querySelector("#deviation-report-date").value = toDateTimeLocal(deviation.deviation_report_date);

            document.querySelector("#deviation-department").value = deviation.deviation_department || "";
            document.querySelector("#deviation-type").value = deviation.deviation_type || "";
            document.querySelector("#deviation-severity").value = deviation.deviation_severity || "";
            document.querySelector("#deviation-location").value = deviation.deviation_location || "";
            document.querySelector("#deviation-sample-type").value = deviation.deviation_sample_type || "";
            document.querySelector("#root-cause-category").value = deviation.root_cause_category || "";
            document.querySelector("#batch-disposition").value = deviation.batch_disposition || "";

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

    document.addEventListener("click", async (e) => {
        const approveBtn = e.target.closest(".approve-deviation-btn");
        const rejectBtn = e.target.closest(".reject-deviation-btn");

        if (!approveBtn && !rejectBtn) return;

        const isApprove = !!approveBtn;
        const isReject = !!rejectBtn;

        const approverName = localStorage.getItem("username");
        const approverRole = localStorage.getItem("role");

        // FIX: declare variables in outer scope
        let approvalStatus = null;
        let formStatus = null;

        if (isApprove) {
            approvalStatus = true;
            formStatus = "approved";
        } else if (isReject) {
            approvalStatus = false;
            formStatus = "draft";
        }

        const btn = approveBtn || rejectBtn;
        const deviation_code = btn.dataset.deviationCode;
        console.log("Deviation code:", deviation_code);

        const response = await fetch(`http://localhost:8000/update_deviation_form/validate`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                deviation_code,
                approver_name: approverName,
                approver_role: approverRole,
                approval_status: approvalStatus,
                form_status: formStatus,
            })
        });

        if (response.ok) {
            alert(isApprove ? "Deviation approved successfully" : "Deviation rejected successfully");
            setTimeout(() => location.reload(), 300);
        } else {
            try {
                const errorData = await response.json();
                if (Array.isArray(errorData.detail)) {
                    message = errorData.detail.map(err => `${err.loc.join(" → ")}: ${err.msg}`).join("\n");
                } else {
                    message = errorData.detail || message;
                }
            } catch { }
            alert(message);
        }
    });
}
