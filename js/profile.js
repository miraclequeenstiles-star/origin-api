async function loadProfile() {
    const token = localStorage.getItem("token");

    if (!token) {
        window.location.href = "auth.html";
        return;
    }

    const res = await post("profile", { token });

    if (res.error) {
        localStorage.clear();
        window.location.href = "auth.html";
        return;
    }

    document.getElementById("email").innerText = res.email;
    document.getElementById("time").innerText = res.remaining_seconds + " sec";
}

function logout() {
    localStorage.clear();
    window.location.href = "auth.html";
}

loadProfile();