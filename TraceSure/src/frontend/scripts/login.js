const login_btn = document.getElementById("register-button-page");
login_btn.addEventListener("click", () => {
    window.location.href = "../navigation/register.html"
});

const register_btn = document.getElementById("login-button");
register_btn.addEventListener("click", async () => {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    if (!username || !password) {
        alert("Please enter both username and password");
        return;
    }

    // Call FastAPI
    const response = await fetch("http://localhost:8000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (response.ok) {
        // Save token
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("username", data.username);
        localStorage.setItem("role", data.role)
        // Redirect
        window.location.href = "../navigation/dashboard-main.html";
    } else {
        // Show backend error
        alert(data.detail || "Login failed");
    }
});
