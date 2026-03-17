// Global helper available to all component scripts
function waitForElement(selector) {
    return new Promise(resolve => {
        const el = document.querySelector(selector);
        if (el) return resolve(el);

        const observer = new MutationObserver(() => {
            const el = document.querySelector(selector);
            if (el) {
                observer.disconnect();
                resolve(el);
            }
        });

        observer.observe(document.getElementById("container-2-main-page"), {
            childList: true,
            subtree: true
        });
    });
}

let activeScript = null;

function loadComponent(htmlPath, jsPath) {
    fetch(htmlPath)
        .then(res => res.text())
        .then(html => {
            const container = document.getElementById("container-2-main-page");
            container.innerHTML = html;

            // Remove previous component script
            if (activeScript) {
                activeScript.remove();
                activeScript = null;
            }

            // Load new component script
            if (jsPath) {
                requestAnimationFrame(() => {
                const script = document.createElement("script");
                script.src = jsPath + "?v=" + Date.now();
                document.body.appendChild(script);
                activeScript = script;
                });
            }
        })
        .catch(err => console.error("Component load error:", err));
}

document.addEventListener("DOMContentLoaded", () => {
    // Default dashboard
    loadComponent(
        "/navigation/components/dashboard-component.html",
        "/scripts/dashboard/dashboard-main.js"
    );

    document.getElementById("create").addEventListener("click", () => {
        loadComponent(
            "/navigation/components/sample-creation-component.html",
            "/scripts/dashboard/components/sample-creation-component.js"
        );
    });

    document.getElementById("perform").addEventListener("click", () => {
        loadComponent(
            "/navigation/components/sample-testing-component.html",
            "/scripts/dashboard/components/sample-testing-component.js"
        );
    });

    document.getElementById("review").addEventListener("click", () => {
        loadComponent(
            "/navigation/components/sample-review-component.html",
            "/scripts/dashboard/components/sample-review-component.js"
        );
    });

    document.getElementById("approve").addEventListener("click", () => {
        loadComponent(
            "/navigation/components/sample-approval-component.html",
            "/scripts/dashboard/components/sample-approval-component.js"
        );
    });

    document.getElementById("deviation").addEventListener("click", () => {
        loadComponent(
            "/navigation/components/sample-deviation-component.html",
            "/scripts/dashboard/components/sample-deviation-component.js"
        );
    });

    document.getElementById("release").addEventListener("click", () => {
        loadComponent(
            "/navigation/components/samples-released-component.html",
            "/scripts/dashboard/components/samples-released-component.js"
        );
    });

    document.getElementById("historical-samples").addEventListener("click", () => {
        loadComponent(
            "/navigation/components/sample-history-component.html",
            "/scripts/dashboard/components/sample-history-component.js"
        );
    });
});