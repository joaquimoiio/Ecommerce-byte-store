
$(document).ready(function () {

    $('#nuCpf').mask('000.000.000-00');
    $('#nuTelefone').mask('(00) 00000-0000');
    $('#dsNascimento').mask('00/00/0000');

});


/*
const btnCriarConta = document.querySelector('.botao.primary');
btnCriarConta.addEventListener('click', (event) => {
    const senha1 = document.querySelector('#dsSenha').value;
    const senha2 = document.querySelector('#senhaconfirma').value;
    
    if (senha1 !== senha2) {
        event.preventDefault();
        alert('As senhas não coincidem!');
    }
});
*/