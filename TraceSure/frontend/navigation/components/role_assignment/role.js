
if (document.querySelector(".user-role-component") && !document.body.dataset.roleAssignmentInit) {
    document.body.dataset.roleAssignmentInit = "true";
    roleAssignment();
    availableUsers();
}

async function roleAssignment () {
    const usernameInput = document.getElementById("role-username");
    const roleSelect = document.getElementById("role-select");
    const assignBtn = document.getElementById("assign-role-btn");
    const messageBox = document.getElementById("role-message");

    assignBtn.addEventListener("click", async () => {
        const username = usernameInput.value.trim();
        const role = roleSelect.value;

        messageBox.textContent = "";
        messageBox.style.color = "#ffffff";

        if (!username || !role) {
            messageBox.textContent = "Please enter a username and select a role.";
            messageBox.style.color = "#ff6b6b";
            return;
        }

        try {
            const res = await fetch(
                `http://localhost:8000/role_assign/assign_role?username=${encodeURIComponent(username)}&role=${encodeURIComponent(role)}`,
                {
                    method: "PUT",
                    headers: { 
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${localStorage.getItem("token")}`
                    },
                }
            );

            const data = await res.json();

            if (!res.ok) {
                messageBox.textContent = data.detail || "Error assigning role.";
                messageBox.style.color = "#ff6b6b";
                return;
            }

            messageBox.textContent = data.message;
            messageBox.style.color = "#66fcf1";
            setTimeout(() => {
            window.location.reload();
            }, 5000);

        } catch (err) {
            console.error("Role assignment error:", err);
            messageBox.textContent = "Server error.";
            messageBox.style.color = "#ff6b6b";
        }
    });
}

async function availableUsers() {
    try {
        const response = await fetch(
            "http://localhost:8000/current_users/", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            }
        });

        const users = await response.json();
        console.log("Fetched samples:", users);
        renderAvailableUsers(users);

    } catch (err) {
        console.error("API error", err);
        renderEmpty();
    }
}

function renderAvailableUsers(users = []) {
    const tbody = document.querySelector('#users-table tbody');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (!users.length) {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td colspan="4" style="text-align:center">No active users</td>`;
        tbody.appendChild(tr);
        return;
    }

    users.forEach(u => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${escapeHtml(u.username)}</td>
            <td>${escapeHtml(u.email)}</td>
            <td>${escapeHtml(u.role)}</td>
            <td>${u.is_active ? "Active" : "Inactive"}</td>
        `;
        tbody.appendChild(row);
    });
}

function renderEmpty() {
    const tbody = document.querySelector('#users-table tbody');
    if (!tbody) return;
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center">Unable to load samples</td></tr>`;
}

function escapeHtml(str = '') {
    return String(str).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}