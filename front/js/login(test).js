function verificarLogin() {
    const usuarioLogado = localStorage.getItem('usuarioLogado');

    if (usuarioLogado) {
        document.getElementById('opcoes-logado').style.display = 'flex';
        document.getElementById('opcoes-deslogado').style.display = 'none';
    } else {
        document.getElementById('opcoes-logado').style.display = 'none';
        document.getElementById('opcoes-deslogado').style.display = 'flex';
    }
}

function loginUsuario() {
    localStorage.setItem('usuarioLogado', 'true');
    verificarLogin();
}

function logoutUsuario() {
    localStorage.removeItem('usuarioLogado');
    verificarLogin();
}

window.onload = verificarLogin; 