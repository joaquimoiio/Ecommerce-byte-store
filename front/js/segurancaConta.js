document.addEventListener('DOMContentLoaded', function() {
    // Recuperar ID do cliente do localStorage (presumindo que você o armazena após login)
    const clienteId = localStorage.getItem('clienteId');
    
    if (!clienteId) {
        // Redirecionar para login se não estiver autenticado
        window.location.href = 'login.html';
        return;
    }

    const form = document.querySelector('form');
    
    // Adicionar evento para envio do formulário
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        alterarSenha(clienteId);
    });
});

// Função para alterar a senha do cliente
function alterarSenha(id) {
    const senhaAtual = document.getElementById('senha-atual').value;
    const novaSenha = document.getElementById('nova-senha').value;
    const confirmarSenha = document.getElementById('confirmar-senha').value;
    
    // Validações básicas
    if (!senhaAtual || !novaSenha || !confirmarSenha) {
        exibirMensagem('Por favor, preencha todos os campos.', 'error');
        return;
    }
    
    if (novaSenha !== confirmarSenha) {
        exibirMensagem('A nova senha e a confirmação de senha não coincidem.', 'error');
        return;
    }
    
    // Enviar requisição para alterar a senha
    fetch(`http://localhost:8081/cliente/${id}/alterar-senha`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            senhaAtual: senhaAtual,
            novaSenha: novaSenha
        })
    })
    .then(response => {
        if (!response.ok) {
            // Se a resposta não for OK, tenta obter a mensagem de erro
            return response.text().then(text => {
                throw new Error(text || 'Erro ao alterar senha');
            });
        }
        return response.json();
    })
    .then(data => {
        exibirMensagem('Senha alterada com sucesso!', 'success');
        // Limpar formulário
        document.getElementById('senha-atual').value = '';
        document.getElementById('nova-senha').value = '';
        document.getElementById('confirmar-senha').value = '';
    })
    .catch(error => {
        console.error('Erro ao alterar senha:', error);
        
        // Tratar diferentes erros conhecidos
        if (error.message.includes('Senha atual incorreta')) {
            exibirMensagem('Senha atual incorreta.', 'error');
        } else {
            exibirMensagem('Erro ao alterar senha. Por favor, tente novamente.', 'error');
        }
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
    const form = document.querySelector('form');
    form.parentNode.insertBefore(mensagem, form);
    
    // Remover após alguns segundos
    setTimeout(() => {
        mensagem.remove();
    }, 3000);
}