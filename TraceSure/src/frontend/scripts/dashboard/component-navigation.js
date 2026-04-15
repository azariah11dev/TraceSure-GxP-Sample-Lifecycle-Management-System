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

async function loadDeviationForm() {
  const container = document.querySelector('#sample-deviation-component-deviation-details');

  const res = await fetch('/navigation/components/create_deviation/deviation-form.html');
  const html = await res.text();

  container.innerHTML = html;
}

document.addEventListener("DOMContentLoaded", () => {
    // Default dashboard
    loadComponent(
        "/navigation/components/dashboard/dashboard.html",
        "/scripts/dashboard/dashboard-main.js"
    );

    document.getElementById("create").addEventListener("click", () => {
        loadComponent(
            "/navigation/components/sample_creation/creation.html",
            "/navigation/components/sample_creation/creation.js"
        );
    });

    document.getElementById("perform").addEventListener("click", () => {
        loadComponent(
            "/navigation/components/sample_testing/testing.html",
            "/navigation/components/sample_testing/testing.js"
        );
    });

    document.getElementById("review").addEventListener("click", () => {
        loadComponent(
            "/navigation/components/sample_review/review.html",
            "/navigation/components/sample_review/review.js"
        );
    });

    document.getElementById("approve").addEventListener("click", () => {
        loadComponent(
            "/navigation/components/sample_approval/approval.html",
            "/navigation/components/sample_approval/approval.js"
        );
    });

    document.getElementById("deviation").addEventListener("click", () => {
        loadComponent(
            "/navigation/components/create_deviation/deviation.html",
            "/navigation/components/create_deviation/deviation.js"
        );
    });

    document.getElementById("release").addEventListener("click", () => {
        loadComponent(
            "/navigation/components/sample_release/release.html",
            "/navigation/components/sample_release/release.js"
        );
    });

    document.getElementById("historical").addEventListener("click", () => {
        loadComponent(
            "/navigation/components/sample_history/history.html",
            "/navigation/components/sample_history/history.js"
        );
    });

    document.getElementById("pending-deviations").addEventListener("click", () => {
        loadComponent(
            "/navigation/components/pending_deviation/deviations.html",
            "/navigation/components/pending_deviation/deviations.js"
        );
    });

});