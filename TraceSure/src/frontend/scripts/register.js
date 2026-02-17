document.addEventListener("DOMContentLoaded", () => {
    const login_btn = document.getElementById("login-button-page");
    login_btn.addEventListener("click", () => {
        window.location.href = "../navigation/login.html"
    });

    const register_btn = document.getElementById("register-button");
    register_btn.addEventListener("click", async () => {
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;
        const email = document.getElementById("email").value;

      // Call FastAPI
        const response = await fetch("http://localhost:8000/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password, email })
        });

        const data = await response.json();
        console.log(data);

        if (data.status === "ok") {
            window.location.href = "../navigation/login.html";
        }
    });
});