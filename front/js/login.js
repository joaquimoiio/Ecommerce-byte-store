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
        const response = await fetch(`http://localhost:8080/cliente`);
        if (!response.ok) {
            throw new Error(`Erro ao buscar usuários: ${response.status}`);
        }

        const data = await response.json();
        usuarios = data;
        //console.log("Usuários carregados:", usuarios);
    } 
    catch (error) {
        console.error('Erro ao carregar usuários:', error.message);
    }
    
}

function verificar(event) {
    event.preventDefault();
    const dsEmail = document.getElementById("dsEmail").value;
    const dsSenha = document.getElementById("dsSenha").value;

    const usuarioEncontrado = usuarios.find(u => dsEmail === u.dsEmail && dsSenha === u.dsSenha);

    if (usuarioEncontrado) {
        alert("Logado com sucesso!");
        localStorage.setItem('usuario', usuarioEncontrado.id);
        window.location.href = "../html/login.html";
    } 
    else {
        alert("Seu email ou senha estão incorretos");
    }
}