document.addEventListener("DOMContentLoaded", () => {
    fetch("../navigation/components/sample-creation-component.html")
    .then(res => res.text())
    .then(html => {
        const container = document.getElementById("container-2-main-page");
        container.innerHTML = html;

        // NOW the component exists — attach listeners here
        const sample_creation_btn = document.getElementById("sample-creation-component-create-samples");
        const form = document.getElementById("sample-creation-form");
        const create_sample_btn = document.getElementById("sample-creation-complete");

        // Validate all elements exist
        if (!sample_creation_btn || !form || !create_sample_btn) {
            console.error("Sample creation component failed to load correctly.");
            return;
        }

        sample_creation_btn.addEventListener("click", () => {
            form.classList.toggle("sample-creation-form-hidden");
        });

        create_sample_btn.addEventListener("click", async () => {
            const sample_name = document.getElementById("sample-name-input").value;
            const selected_tests = [...document.querySelectorAll(".test-selection input:checked")]
                .map(cb => cb.value);

            console.log("Sample Name:", sample_name);
            console.log("Selected Tests:", selected_tests);

            const response = await fetch("http://localhost:8000/samples/create_sample", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sample_name, selected_tests })
            });

            if (response.ok) {
                alert("Sample created successfully!");
            } else {
                alert("Failed to create sample.");
            }
        });
    });
});