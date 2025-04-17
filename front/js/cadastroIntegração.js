const apiUrl = 'http://localhost:8081/cliente'

document.getElementById('sendDataBtn').addEventListener('click', function (e) {
    const nmCliente = document.getElementById('nmCliente').value;
    const nuCpf = document.getElementById('nuCpf').value;
    const dsEmail = document.getElementById('dsEmail').value;
    const dsNascimento = document.getElementById('dsNascimento').value;
    const nuTelefone = document.getElementById('nuTelefone').value;
    const dsSenha = document.getElementById('dsSenha').value;



    const payload = {
        nmCliente: nmCliente,
        nuCpf: nuCpf,
        dsEmail: dsEmail,
        dsNascimento: dsNascimento,
        nuTelefone: nuTelefone,
        dsSenha: dsSenha
    };

    fetch('http://localhost:8080/cliente', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => {
                    alert('Erro: ' + err.message);
                });
            }
            alert('Conta criada com sucesso!');
            window.location.href = '../html/exibirProduto.html'; // Redireciona para a página de login após sucesso
        })
        .catch(error => {
            console.error('Erro ao criar conta:', error);
            alert('Erro ao criar conta');
        });
});