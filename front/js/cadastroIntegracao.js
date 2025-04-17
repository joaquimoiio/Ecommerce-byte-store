const apiUrl = 'http://localhost:8080/cliente';

document.getElementById('sendDataBtn').addEventListener('click', function (e) {
    const nmCliente = document.getElementById('nmCliente').value;
    const nuCpf = document.getElementById('nuCpf').value;
    const dsEmail = document.getElementById('dsEmail').value;
    const dtNasc = document.getElementById('dsNascimento').value;  // Changed variable name to match the DTO field
    const nuTelefone = document.getElementById('nuTelefone').value;
    const dsSenha = document.getElementById('dsSenha').value;

    const payload = {
        nmCliente: nmCliente,
        nuCpf: nuCpf,
        dsEmail: dsEmail,
        dtNasc: dtNasc,  // Changed from dsNascimento to dtNasc to match backend DTO
        nuTelefone: nuTelefone,
        dsSenha: dsSenha
    };

    fetch(apiUrl, {  // Use the consistent apiUrl variable instead of hardcoded URL
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => {
                    throw err;  // Improved error handling
                });
            }
            return response.json();  // Return the response JSON for the next .then block
        })
        .then(data => {
            alert('Conta criada com sucesso!');
            window.location.href = '../html/exibirProduto.html';
        })
        .catch(error => {
            console.error('Erro ao criar conta:', error);
            alert('Erro ao criar conta: ' + (error.message || 'Verifique os dados inseridos'));
        });
});