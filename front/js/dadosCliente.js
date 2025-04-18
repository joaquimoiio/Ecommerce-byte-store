document.addEventListener('DOMContentLoaded', function() {
    // Recuperar ID do cliente do localStorage (presumindo que você o armazena após login)
    const clienteId = localStorage.getItem('clienteId');
    
    if (!clienteId) {
        // Redirecionar para login se não estiver autenticado
        window.location.href = 'login.html';
        return;
    }

    const form = document.querySelector('.form');
    
    // Carregar dados atuais do cliente
    carregarDadosCliente(clienteId);
    
    // Adicionar evento para envio do formulário
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        atualizarDadosCliente(clienteId);
    });
});

// Função para carregar os dados atuais do cliente
function carregarDadosCliente(id) {
    fetch(`http://localhost:8080/cliente/${id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Cliente não encontrado');
        }
        return response.json();
    })
    .then(cliente => {
        // Preencher o formulário com os dados do cliente
        document.getElementById('nome').value = cliente.nmCliente || '';
        document.getElementById('nascimento').value = cliente.dtNasc || '';
        document.getElementById('cpf').value = cliente.nuCpf || '';
        document.getElementById('telefone').value = cliente.nuTelefone || '';
        document.getElementById('email').value = cliente.dsEmail || '';
    })
    .catch(error => {
        console.error('Erro ao carregar dados do cliente:', error);
        exibirMensagem('Erro ao carregar dados. Por favor, tente novamente.', 'error');
    });
}

// Função para atualizar os dados do cliente
function atualizarDadosCliente(id) {
    const nome = document.getElementById('nome').value;
    const dataNascimento = document.getElementById('nascimento').value;
    const cpf = document.getElementById('cpf').value;
    const telefone = document.getElementById('telefone').value;
    const email = document.getElementById('email').value;
    
    // Validação básica
    if (!nome || !dataNascimento || !cpf || !telefone || !email) {
        exibirMensagem('Por favor, preencha todos os campos obrigatórios.', 'error');
        return;
    }
    
    // Recuperar a senha atual para preservá-la na atualização
    fetch(`http://localhost:8080/cliente/${id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Cliente não encontrado');
        }
        return response.json();
    })
    .then(cliente => {
        const dadosAtualizados = {
            nmCliente: nome,
            dtNasc: dataNascimento,
            nuCpf: cpf,
            nuTelefone: telefone,
            dsEmail: email,
            dsSenha: cliente.dsSenha // Preservar a senha atual
        };
        
        return fetch(`http://localhost:8080/cliente/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dadosAtualizados)
        });
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Erro ao atualizar dados');
        }
        return response.json();
    })
    .then(data => {
        exibirMensagem('Dados atualizados com sucesso!', 'success');
    })
    .catch(error => {
        console.error('Erro ao atualizar dados:', error);
        exibirMensagem('Erro ao atualizar dados. Por favor, tente novamente.', 'error');
    });
}

// Função para exibir mensagens ao usuário
function exibirMensagem(texto, tipo) {
    // Verificar se já existe uma mensagem
    let mensagemExistente = document.querySelector('.mensagem-feedback');
    if (mensagemExistente) {
        mensagemExistente.remove();
    }
    
    // Criar elemento de mensagem
    const mensagem = document.createElement('div');
    mensagem.classList.add('mensagem-feedback', tipo);
    mensagem.textContent = texto;
    
    // Adicionar ao DOM
    const form = document.querySelector('.form');
    form.parentNode.insertBefore(mensagem, form);
    
    // Remover após alguns segundos
    setTimeout(() => {
        mensagem.remove();
    }, 3000);
}