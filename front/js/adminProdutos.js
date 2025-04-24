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
        
        // Miniatura da imagem para visualização na lista
        const imageThumbnail = product.imagemPrincipal ? 
            `<img src="${product.imagemPrincipal}" alt="${product.nome}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px;">` : 
            '<span class="text-muted">Sem imagem</span>';
        
        row.innerHTML = `
            <td>${product.id}</td>
            <td>
                <div style="display: flex; align-items: center; gap: 10px;">
                    ${imageThumbnail}
                    ${product.nome}
                </div>
            </td>
            <td>${product.categoria}</td>
            <td>R$ ${formatPrice(product.precoAtual)}</td>
            <td>${product.estoque}</td>
            <td>${product.destaque ? '<i class="bi bi-star-fill text-warning"></i>' : '-'}</td>
            <td>
                <button class="btn btn-sm btn-primary edit-btn" data-id="${product.id}">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-danger delete-btn" data-id="${product.id}">
                    <i class="bi bi-trash"></i>
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

    // Adicionar event listeners para os botões de exclusão
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            if (confirm('Tem certeza que deseja excluir este produto?')) {
                deleteProduct(productId);
            }
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
            
            // Adicionar preview da imagem se disponível
            const imagePreviewContainer = document.createElement('div');
            imagePreviewContainer.id = 'imagePreview';
            imagePreviewContainer.className = 'mt-2 mb-3';
            
            if (product.imagemPrincipal) {
                imagePreviewContainer.innerHTML = `
                    <p class="mb-1">Imagem atual:</p>
                    <img src="${product.imagemPrincipal}" alt="${product.nome}" 
                         style="max-width: 100%; max-height: 150px; border: 1px solid #ddd; border-radius: 4px;">
                `;
                
                // Inserir após o campo de imagem
                const imageField = document.getElementById('productImage').parentNode;
                if (!document.getElementById('imagePreview')) {
                    imageField.appendChild(imagePreviewContainer);
                } else {
                    document.getElementById('imagePreview').innerHTML = imagePreviewContainer.innerHTML;
                }
            }
            
            // Rolar até o formulário
            document.getElementById('productForm').scrollIntoView({ behavior: 'smooth' });
        })
        .catch(error => {
            console.error('Erro ao carregar produto:', error);
            showNotification('Erro ao carregar dados do produto.', 'error');
        });
}

function deleteProduct(productId) {
    fetch(`http://localhost:8081/produtos/${productId}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Erro ao excluir produto');
        }
        return response.text();
    })
    .then(() => {
        showNotification('Produto excluído com sucesso!', 'success');
        loadProductsList();
    })
    .catch(error => {
        console.error('Erro ao excluir produto:', error);
        showNotification('Erro ao excluir produto.', 'error');
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

    // Validar a URL da imagem
    if (productData.imagemPrincipal && !isValidImageUrl(productData.imagemPrincipal)) {
        if (!confirm('A URL da imagem parece inválida. Deseja continuar mesmo assim?')) {
            return;
        }
    }

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
    
    // Remover preview da imagem se existir
    const imagePreview = document.getElementById('imagePreview');
    if (imagePreview) {
        imagePreview.remove();
    }
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

function isValidImageUrl(url) {
    // Verificação básica para URLs de imagem
    return url.match(/\.(jpeg|jpg|gif|png|webp)$/) !== null || 
           url.startsWith('http') || 
           url.startsWith('https') || 
           url.startsWith('/');
}

// Adicionar listener para preview de imagem durante digitação
document.addEventListener('DOMContentLoaded', function() {
    const imageInput = document.getElementById('productImage');
    if (imageInput) {
        imageInput.addEventListener('input', function(e) {
            const imageUrl = e.target.value.trim();
            
            let imagePreview = document.getElementById('imagePreview');
            if (!imagePreview) {
                imagePreview = document.createElement('div');
                imagePreview.id = 'imagePreview';
                imagePreview.className = 'mt-2 mb-3';
                e.target.parentNode.appendChild(imagePreview);
            }
            
            if (imageUrl && isValidImageUrl(imageUrl)) {
                imagePreview.innerHTML = `
                    <p class="mb-1">Preview da imagem:</p>
                    <img src="${imageUrl}" alt="Preview" 
                         style="max-width: 100%; max-height: 150px; border: 1px solid #ddd; border-radius: 4px;">
                `;
            } else {
                imagePreview.innerHTML = '';
            }
        });
    }
});