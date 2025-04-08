const apiUrl = "http://localhost:8081/cliente"; // URL do seu backend

// Função para salvar um novo cliente
function saveClient(clientData) {
  fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(clientData),
  })
  .then(response => response.json())
  .then(data => {
    console.log('Cliente salvo:', data);
  })
  .catch(error => console.error('Erro ao salvar cliente:', error));
}

// Função para buscar todos os clientes
function getAllClients() {
  fetch(apiUrl, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  .then(response => response.json())
  .then(data => {
    console.log('Todos os clientes:', data);
  })
  .catch(error => console.error('Erro ao buscar clientes:', error));
}

// Função para atualizar um cliente
function updateClient(clientData) {
  fetch(apiUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(clientData),
  })
  .then(response => response.json())
  .then(data => {
    console.log('Cliente atualizado:', data);
  })
  .catch(error => console.error('Erro ao atualizar cliente:', error));
}

// Função para deletar um cliente
function deleteClient(clientData) {
  fetch(apiUrl, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(clientData),
  })
  .then(response => response.json())
  .then(data => {
    console.log('Cliente deletado:', data);
  })
  .catch(error => console.error('Erro ao deletar cliente:', error));
}

function loginClient(email, password) {
  // Criando o objeto de login com email e senha
  const loginData = {
    email: email,
    password: password,
  };

  // Enviando a requisição POST para o backend
  fetch(apiUrlLogin, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(loginData),
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Falha no login');
    }
    return response.json(); // Supondo que o backend retorne um token em caso de sucesso
  })
  .then(data => {
    // Armazenar o token no localStorage ou sessionStorage para futuras requisições
    localStorage.setItem('authToken', data.token);
    console.log('Login bem-sucedido!', data);

    // Aqui você pode redirecionar o cliente para uma página protegida
    window.location.href = "/dashboard"; // Exemplo de redirecionamento
  })
  .catch(error => {
    console.error('Erro no login:', error);
    alert('Falha no login. Verifique seu e-mail e senha!');
  });
}

function loginClient(email, password) {
    const loginData = {
      email: email,
      password: password
    };
  
    // Envia uma requisição POST para o backend
    fetch(`${apiUrl}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData),
    })
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error('Credenciais inválidas');
      }
    })
    .then(data => {
      // Sucesso - Aqui você pode salvar o token ou dados do cliente, por exemplo
      console.log('Login bem-sucedido:', data);
      // Salve os dados do cliente ou um token JWT em localStorage ou sessionStorage, se necessário
      localStorage.setItem('client', JSON.stringify(data)); // Exemplo de salvar os dados no localStorage
    })
    .catch(error => {
      console.error('Erro ao fazer login:', error);
      alert('Erro ao fazer login: ' + error.message);
    });
  }