async function register() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const res = await apiPost("/auth", {
        type: "register",
        email,
        password
    });

    if (res.success) {
        alert("Registered!");
    } else {
        alert(res.error);
    }
}

async function login() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const res = await apiPost("/auth", {
        type: "login",
        email,
        password
    });

    if (res.token) {
        localStorage.setItem("token", res.token);
        window.location.href = "/profile.html";
    } else {
        alert(res.error);
    }
}