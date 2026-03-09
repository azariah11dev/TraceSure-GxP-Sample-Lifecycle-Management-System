document.addEventListener("DOMContentLoaded", () => {
    fetch("../navigation/components/sample-creation-component.html")
    .then(res => res.text())
    .then(html => {
        const container = document.getElementById("container-2-main-page");
         container.innerHTML = html;

        const sample_creation_btn = document.getElementById("sample-creation-component-create-samples");
        const form = document.getElementById("sample-creation-form");
        const create_sample_btn = document.getElementById("sample-creation-complete");
        const name = localStorage.getItem("username");

        if (!sample_creation_btn || !form || !create_sample_btn) {
            console.error("Sample creation component failed to load correctly.");
            console.log("sample_creation_btn:", sample_creation_btn);
            console.log("form:", form);
            console.log("create_sample_btn:", create_sample_btn);
            return;
        }

        // Only this toggle is needed
        sample_creation_btn.addEventListener("click", () => {
            form.classList.toggle("sample-creation-form-hidden");
            form.classList.toggle("sample-creation-form-visible");
        });

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
                body: JSON.stringify({ sample_name, tests: selected_tests, created_by: name })
            });

            if (response.ok) {
                alert("Sample created successfully!");
            } else {
                alert("Failed to create sample.");
            }
        });
    });
});