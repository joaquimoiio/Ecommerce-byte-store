document.addEventListener("DOMContentLoaded", () => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true"; // Check login status
    const headerFile = isLoggedIn ? "cabecalho.html" : "cabecalhoDeslogado.html"; // Determine which header to load

    fetch(headerFile)
        .then(res => res.text())
        .then(html => {
            document.getElementById("meu-header").innerHTML = html;
        });
});
