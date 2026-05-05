async function register() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const res = await post("auth", {
        email,
        password,
        mode: "register"
    });

    if (res.token) {
        localStorage.setItem("token", res.token);
        localStorage.setItem("user_id", res.user_id);

        window.location.href = "profile.html";
    } else {
        document.getElementById("msg").innerText = res.error;
    }
}

async function login() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const res = await post("auth", {
        email,
        password,
        mode: "login"
    });

    if (res.token) {
        localStorage.setItem("token", res.token);
        localStorage.setItem("user_id", res.user_id);

        window.location.href = "profile.html";
    } else {
        document.getElementById("msg").innerText = res.error;
    }
}