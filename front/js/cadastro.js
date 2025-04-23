const apiUrl = 'http://localhost:8081/cliente';

document.getElementById('sendDataBtn').addEventListener('click', function (e) {
    const nmCliente = document.getElementById('nmCliente').value;
    const nuCpf = document.getElementById('nuCpf').value;
    const dsEmail = document.getElementById('dsEmail').value;
    const dtNasc = document.getElementById('dsNascimento').value;  
    const nuTelefone = document.getElementById('nuTelefone').value;
    const dsSenha = document.getElementById('dsSenha').value;

    const payload = {
        nmCliente: nmCliente,
        nuCpf: nuCpf,
        dsEmail: dsEmail,
        dtNasc: dtNasc,  
        nuTelefone: nuTelefone,
        dsSenha: dsSenha
    };

    fetch(apiUrl, {  
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => {
                    throw err; 
                });
            }
            return response.json(); 
        })
        .then(data => {
            alert('Conta criada com sucesso!');
            window.location.href = 'login.html';
        })
        .catch(error => {
            console.error('Erro ao criar conta:', error);
            alert('Erro ao criar conta: ' + (error.message || 'Verifique os dados inseridos'));
        });
});