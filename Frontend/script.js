async function send() {
    const raw = document.getElementById("input").value;
    const data = raw.split(",").map(item => item.trim());

    const res = await fetch("http://localhost:3000/bfhl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data })
    });

    const result = await res.json();

    document.getElementById("output").innerText =
        JSON.stringify(result, null, 2);
}