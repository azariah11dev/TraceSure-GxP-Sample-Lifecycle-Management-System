function loadComponent(path) {
    fetch(path)
        .then(res => res.text())
        .then(html => {
            document.getElementById("container-2-main-page").innerHTML = html;
        })
        .catch(err => console.error("Component load error:", err));
}

document.addEventListener("DOMContentLoaded", () => {
    // Default component
    loadComponent("../navigation/components/dashboard-component.html");

    // Sidebar links
    document.getElementById("create").addEventListener("click", () => {
        loadComponent("../navigation/components/sample-creation-component.html");
    });

    document.getElementById("perform").addEventListener("click", () => {
        loadComponent("../navigation/components/sample-testing-component.html");
    });

    document.getElementById("review").addEventListener("click", () => {
        loadComponent("../navigation/components/sample-review-component.html");
    });

    document.getElementById("approve").addEventListener("click", () => {
        loadComponent("../navigation/components/sample-approval-component.html");
    });

    document.getElementById("deviation").addEventListener("click", () => {
        loadComponent("../navigation/components/sample-deviation-component.html");
    });

    document.getElementById("release").addEventListener("click", () => {
        loadComponent("../navigation/components/samples-released-component.html");
    });

    document.getElementById("historical-samples").addEventListener("click", () => {
        loadComponent("../navigation/components/sample-history-component.html");
    });
});