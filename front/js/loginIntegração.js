document.addEventListener('DOMContentLoaded', async () => {
    try {
        await carregarUsuarios();
        const botaoLogin = document.querySelector('.primary');
        botaoLogin.addEventListener('click', verificar);
    } catch (error) {
        console.error("Erro no carregamento inicial:", error.message);
    }
});

let usuarios = [];

async function carregarUsuarios() {
    try {
        const response = await fetch(`http://localhost:3306/cliente`);
        if (!response.ok) {
            throw new Error(`Erro ao buscar usuários: ${response.status}`);
        }

        const data = await response.json();
        usuarios = data;
        console.log("Usuários carregados:", usuarios);
    } catch (error) {
        console.error('Erro ao carregar usuários:', error.message);
    }
}

function verificar(event) {
    event.preventDefault();
    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;

    const usuarioEncontrado = usuarios.find(u => email === u.dsEmail && senha === u.dsSenha);

    if (usuarioEncontrado) {
        alert("Logado com sucesso!");
        localStorage.setItem('usuario', usuarioEncontrado.id);
        window.location.href = "../html/login.html";
    } else {
        alert("Seu email ou senha estão incorretos");
    }
}