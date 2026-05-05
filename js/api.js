const API_BASE = "https://origin-api-gilt.vercel.app/api";

async function post(endpoint, data) {
    const res = await fetch(`${API_BASE}/${endpoint}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });

    return res.json();
}