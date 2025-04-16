
$(document).ready(function () {

    $('#cpf').mask('000.000.000-00');
    $('#telefone').mask('(00) 00000-0000');
    $('#date').mask('00/00/0000');

    $('.botao.primary').click(function (e) {
        const senha = $('#senha').val();
        const confirma = $('#senhaconfirma').val();

        if (senha !== confirma) {
            e.preventDefault();
            alert('As senhas não coincidem!');
        }
    });
});



const btnCriarConta = document.querySelector('.botao.primary');
btnCriarConta.addEventListener('click', (e) => {
    const senha1 = document.querySelector('input[placeholder="Senha"]').value;
    const senha2 = document.querySelector('input[placeholder="Digite novamente sua senha"]').value;
    if (senha1 !== senha2) {
        e.preventDefault();
        alert('As senhas não coincidem!');
    }
});