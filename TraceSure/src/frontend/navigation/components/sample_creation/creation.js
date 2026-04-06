waitForElement("#sample-creation-component-create-samples").then(createBtn => {
    const form = document.getElementById("sample-creation-form");

    createBtn.addEventListener("click", () => {
        form.classList.toggle("sample-creation-form-hidden");
    });
});

waitForElement("#sample-creation-component-create-samples").then(createBtn => {
    // Get static elements AFTER HTML loads
    const sample_creation_btn = document.getElementById("sample-creation-component-create-samples");
    const add_test_btn = document.getElementById("sample-creation-component-add-test");
    const sample_creation_form = document.getElementById("sample-creation-form");
    const add_test_form = document.getElementById("container-2-add-test-form");
    const additional_tests_form = document.getElementById("add-test-form-display-additional-tests");
    const create_sample_btn = document.getElementById("sample-creation-complete");
    const add_test_search_btn = document.getElementById("add-test-search");
    const submit_additional_tests_btn = document.getElementById("add-test-form-submission");
    const name = localStorage.getItem("username");

    // Utility
    function toTitleCase(str) {
        return str
            .toLowerCase()
            .split(" ")
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    }

    // Toggle Create Sample form
    sample_creation_btn.addEventListener("click", () => {
        sample_creation_form.classList.toggle("sample-creation-form-hidden");
        sample_creation_form.classList.toggle("sample-creation-form-visible");

        add_test_form.classList.add("container-2-add-test-form-hidden");
        add_test_form.classList.remove("container-2-add-test-form-visible");
    });

    // Toggle Add Test form
    add_test_btn.addEventListener("click", () => {
        add_test_form.classList.toggle("container-2-add-test-form-hidden");
        add_test_form.classList.toggle("container-2-add-test-form-visible");

        sample_creation_form.classList.add("sample-creation-form-hidden");
        sample_creation_form.classList.remove("sample-creation-form-visible");
    });

    // Create Sample
    create_sample_btn.addEventListener("click", async () => {
        const sample_name = document.getElementById("sample-name-input").value;
        const selected_tests = [...document.querySelectorAll(".test-selection input:checked")]
            .map(cb => cb.value);

        if (!sample_name.trim()) {
            alert("Sample name cannot be blank");
            return;
        }
        if (!selected_tests.length) {
            alert("You need to select at least one test");
            return;
        }

        const response = await fetch("http://localhost:8000/sample/create_sample", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                sample_name,
                tests: selected_tests.map(t => t.trim()),
                created_by: name
            })
        });

        alert(response.ok ? "Sample created successfully!" : "Failed to create sample.");
    });

    // SEARCH SAMPLE → SHOW ADDITIONAL TESTS FORM
    add_test_search_btn.addEventListener("click", async () => {
        const sample_name = document.getElementById("add-test-sample-name").value.trim();
        const results = document.getElementById("add-test-form-display");

        if (!sample_name) {
            alert("Please enter a sample name to search.");
            return;
        }

        const response = await fetch(`http://localhost:8000/add_test/${sample_name}`);

        if (response.ok) {
            const data = await response.json();

            // Show additional tests form
            additional_tests_form.classList.remove("add-test-form-display-additional-tests-hidden");
            additional_tests_form.classList.add("add-test-form-display-additional-tests-visible");

            // Render existing tests
            results.innerHTML = `
                <p style="font-weight:bold; font-size:25px; margin-bottom:5px;">Sample: ${data.sample_name}</p>
                <p style="font-size:20px; margin-bottom:5px;">Existing tests:</p>
                <ul style="display:flex; flex-direction:column; gap:5px; font-size:16px;">
                    ${data.tests.map(t => `<li>${toTitleCase(t)}</li>`).join("")}
                </ul>
            `;
        } else {
            results.innerHTML = `<p style="color:red;">Sample not found.</p>`;
        }
    });

    // Submit Additional Tests
    submit_additional_tests_btn.addEventListener("click", async () => {
        console.log("SUBMIT CLICKED");
        const new_selected_tests = [...document.querySelectorAll(".test-addition input:checked")].map(cb => cb.value);
        const sample_name = document.getElementById("add-test-sample-name").value.trim();

        if (new_selected_tests.length === 0) {
            alert("You must select at least one new test");
            return;
        }

        const response = await fetch("http://localhost:8000/sample/add_tests", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sample_name, tests: new_selected_tests.map(t => t.trim()), created_by: name })
        });

        if (response.ok) {
            alert("Additional tests added successfully!");
        } else {
            let message = "An error occurred.";
            try {
                const errorData = await response.json();
                message = errorData.detail || message;
            } catch (_) { }
            alert(message);
        }
    });
});