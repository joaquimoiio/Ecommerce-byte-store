document.addEventListener('DOMContentLoaded', function() {
    console.log("Página dadosCliente carregada");
    
    const clienteId = localStorage.getItem('usuario');
    console.log("ID do usuário recuperado:", clienteId);
    
    if (!clienteId) {
        console.error("Nenhum ID de usuário encontrado no localStorage");
        alert("Você precisa estar logado para acessar esta página.");
        window.location.href = 'login.html';
        return;
    }

    const form = document.querySelector('.form');

    carregarDadosCliente(clienteId);

    form.addEventListener('submit', function(event) {
        event.preventDefault();
        atualizarDadosCliente(clienteId);
    });
});

function carregarDadosCliente(id) {
    console.log("Tentando carregar dados do cliente ID:", id);

    const url = `http://localhost:8081/cliente/${id}`;
    console.log("URL da requisição:", url);
    
    fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        console.log("Status da resposta:", response.status);
        
        if (!response.ok) {
            throw new Error(`Cliente não encontrado. Status: ${response.status}`);
        }
        return response.json();
    })
    .then(cliente => {
        console.log("Dados do cliente recebidos:", cliente);

        document.getElementById('nmCliente').value = cliente.nmCliente || '';

        if (cliente.dtNasc) {
            try {
                const data = new Date(cliente.dtNasc);
                const dataFormatada = data.toISOString().split('T')[0];
                document.getElementById('dtNasc').value = dataFormatada;
                console.log("Data formatada:", dataFormatada);
            } catch (error) {
                console.error("Erro ao formatar data:", error);
                document.getElementById('dtNasc').value = cliente.dtNasc;
            }
        }
        
        document.getElementById('nuCpf').value = cliente.nuCpf || '';
        document.getElementById('nuTelefone').value = cliente.nuTelefone || '';
        document.getElementById('dsEmail').value = cliente.dsEmail || '';
        
        console.log("Formulário preenchido com sucesso");
    })
    .catch(error => {
        console.error('Erro ao carregar dados do cliente:', error);
        alert(`Erro ao carregar dados: ${error.message}`);
    });
}

function atualizarDadosCliente(id) {
    console.log("Tentando atualizar dados do cliente ID:", id);
    
    const nmCliente = document.getElementById('nmCliente').value;
    const dtNasc = document.getElementById('dtNasc').value;
    const nuCpf = document.getElementById('nuCpf').value;
    const nuTelefone = document.getElementById('nuTelefone').value;
    const dsEmail = document.getElementById('dsEmail').value;

    if (!nmCliente || !dtNasc || !nuCpf || !nuTelefone || !dsEmail) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
    }

    fetch(`http://localhost:8081/cliente/${id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Cliente não encontrado. Status: ${response.status}`);
        }
        return response.json();
    })
    .then(cliente => {
        console.log("Dados atuais recuperados para atualização");
        
        const dadosAtualizados = {
            nmCliente: nmCliente,
            dtNasc: dtNasc,
            nuCpf: nuCpf,
            nuTelefone: nuTelefone,
            dsEmail: dsEmail,
            dsSenha: cliente.dsSenha
        };
        
        console.log("Dados a serem enviados:", dadosAtualizados);
        
        return fetch(`http://localhost:8081/cliente/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dadosAtualizados)
        });
    })
    .then(response => {
        console.log("Status da resposta de atualização:", response.status);
        
        if (!response.ok) {
            throw new Error(`Erro ao atualizar dados. Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log("Atualização bem-sucedida:", data);
        alert('Dados atualizados com sucesso!');
    })
    .catch(error => {
        console.error('Erro ao atualizar dados:', error);
        alert(`Erro ao atualizar dados: ${error.message}`);
    });
}