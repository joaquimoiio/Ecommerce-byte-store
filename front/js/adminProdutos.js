document.addEventListener('DOMContentLoaded', function() {
    // Verificar se está logado como admin
    const isAdminLoggedIn = localStorage.getItem('isAdminLoggedIn') === 'true';
    if (!isAdminLoggedIn) {
        window.location.href = 'adminLogin.html';
        return;
    }

    // Configurar logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            localStorage.removeItem('isAdminLoggedIn');
            window.location.href = 'adminLogin.html';
        });
    }

    // Carregar lista de produtos
    loadProductsList();

    // Configurar formulário
    const productForm = document.getElementById('productForm');
    if (productForm) {
        productForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveProduct();
        });
    }

    // Configurar botão cancelar
    const cancelBtn = document.getElementById('cancelBtn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', resetForm);
    }
});

function loadProductsList() {
    const productsList = document.getElementById('productsList');
    if (!productsList) return;

    productsList.innerHTML = '<tr><td colspan="7" class="text-center">Carregando produtos...</td></tr>';

    fetch('http://localhost:8081/produtos')
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao carregar produtos');
            }
            return response.json();
        })
        .then(products => {
            displayProducts(products);
        })
        .catch(error => {
            console.error('Erro ao carregar produtos:', error);
            showNotification('Erro ao carregar produtos. Verifique a conexão com o servidor.', 'error');
            
            // Em caso de falha, mostrar produtos de exemplo
            productsList.innerHTML = '<tr><td colspan="7" class="text-center">Não foi possível carregar os produtos do servidor.</td></tr>';
        });
}

function displayProducts(products) {
    const productsList = document.getElementById('productsList');
    if (!productsList) return;

    if (!products || products.length === 0) {
        productsList.innerHTML = '<tr><td colspan="7" class="text-center">Nenhum produto cadastrado.</td></tr>';
        return;
    }

    productsList.innerHTML = '';

    products.forEach(product => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${product.id}</td>
            <td>${product.nome}</td>
            <td>${product.categoria}</td>
            <td>R$ ${formatPrice(product.precoAtual)}</td>
            <td>${product.estoque}</td>
            <td>${product.destaque ? '<i class="bi bi-star-fill text-warning"></i>' : '-'}</td>
            <td>
                <button class="btn btn-sm btn-primary edit-btn" data-id="${product.id}">
                    <i class="bi bi-pencil"></i>
                </button>
            </td>
        `;
        
        productsList.appendChild(row);
    });

    // Adicionar event listeners para os botões de edição
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            editProduct(productId);
        });
    });
}

function editProduct(productId) {
    fetch(`http://localhost:8081/produtos/${productId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Produto não encontrado');
            }
            return response.json();
        })
        .then(product => {
            // Preencher o formulário com os dados do produto
            document.getElementById('productId').value = product.id;
            document.getElementById('productName').value = product.nome;
            document.getElementById('productDescription').value = product.descricao;
            document.getElementById('productCategory').value = product.categoria;
            document.getElementById('productOldPrice').value = product.precoAntigo;
            document.getElementById('productPrice').value = product.precoAtual;
            document.getElementById('productStock').value = product.estoque;
            document.getElementById('productImage').value = product.imagemPrincipal;
            document.getElementById('productFeatured').checked = product.destaque;

            // Atualizar o título do formulário e mostrar o botão cancelar
            document.getElementById('formTitle').innerHTML = '<i class="bi bi-pencil-square"></i> Editar Produto';
            document.getElementById('saveBtn').textContent = 'Atualizar Produto';
            document.getElementById('cancelBtn').style.display = 'block';
            
            // Rolar até o formulário
            document.getElementById('productForm').scrollIntoView({ behavior: 'smooth' });
        })
        .catch(error => {
            console.error('Erro ao carregar produto:', error);
            showNotification('Erro ao carregar dados do produto.', 'error');
        });
}

function saveProduct() {
    const productId = document.getElementById('productId').value;
    const isNewProduct = !productId;

    const productData = {
        nome: document.getElementById('productName').value,
        descricao: document.getElementById('productDescription').value,
        precoAntigo: parseFloat(document.getElementById('productOldPrice').value),
        precoAtual: parseFloat(document.getElementById('productPrice').value),
        estoque: parseInt(document.getElementById('productStock').value),
        categoria: document.getElementById('productCategory').value,
        imagemPrincipal: document.getElementById('productImage').value,
        imagensGaleria: [], // Campo vazio para novas imagens
        destaque: document.getElementById('productFeatured').checked
    };

    const url = isNewProduct 
        ? 'http://localhost:8081/produtos' 
        : `http://localhost:8081/produtos/${productId}`;

    const method = isNewProduct ? 'POST' : 'PUT';

    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(productData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Erro ao salvar produto');
        }
        return response.json();
    })
    .then(data => {
        const message = isNewProduct 
            ? 'Produto adicionado com sucesso!' 
            : 'Produto atualizado com sucesso!';
        
        showNotification(message, 'success');
        resetForm();
        loadProductsList();
    })
    .catch(error => {
        console.error('Erro ao salvar produto:', error);
        showNotification('Erro ao salvar produto. Verifique os dados e tente novamente.', 'error');
    });
}

function resetForm() {
    document.getElementById('productForm').reset();
    document.getElementById('productId').value = '';
    document.getElementById('formTitle').innerHTML = '<i class="bi bi-plus-circle"></i> Adicionar Produto';
    document.getElementById('saveBtn').textContent = 'Salvar Produto';
    document.getElementById('cancelBtn').style.display = 'none';
}

function showNotification(message, type) {
    const notification = document.getElementById('notification');
    if (!notification) return;

    notification.textContent = message;
    notification.className = 'notification';
    notification.classList.add(`notification-${type}`);
    notification.style.display = 'block';

    // Esconder a notificação após 5 segundos
    setTimeout(() => {
        notification.style.display = 'none';
    }, 5000);
}

function formatPrice(price) {
    if (typeof price === 'number') {
        return price.toFixed(2).replace('.', ',');
    } else if (typeof price === 'string') {
        return parseFloat(price).toFixed(2).replace('.', ',');
    }
    return '0,00';
}