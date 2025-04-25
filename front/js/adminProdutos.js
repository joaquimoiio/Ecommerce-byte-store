document.addEventListener('DOMContentLoaded', function() {
    const isAdminLoggedIn = localStorage.getItem('isAdminLoggedIn') === 'true';
    if (!isAdminLoggedIn) {
        window.location.href = 'adminProdutos.html';
        return;
    }

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            localStorage.removeItem('isAdminLoggedIn');
            window.location.href = 'adminProdutos.html';
        });
    }

    loadProductsList();

    const productForm = document.getElementById('productForm');
    if (productForm) {
        productForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveProduct();
        });
    }

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

        const imageThumbnail = product.imagemPrincipal ? 
            `<img src="${product.imagemPrincipal}" alt="${product.nmProduto}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px;">` : 
            '<span class="text-muted">Sem imagem</span>';
        
        row.innerHTML = `
            <td>${product.cdProduto}</td>
            <td>
                <div style="display: flex; align-items: center; gap: 10px;">
                    ${imageThumbnail}
                    ${product.nmProduto}
                </div>
            </td>
            <td>${product.dsCategoria}</td>
            <td>R$ ${formatPrice(product.vlProduto)}</td>
            <td>${product.dsEstoque}</td>
            <td>${product.destaque ? '<i class="bi bi-star-fill text-warning"></i>' : '-'}</td>
            <td>
                <button class="btn btn-sm btn-primary edit-btn" data-id="${product.cdProduto}">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-danger delete-btn" data-id="${product.cdProduto}">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        
        productsList.appendChild(row);
    });

    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            editProduct(productId);
        });
    });

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
            document.getElementById('productId').value = product.cdProduto;
            document.getElementById('productName').value = product.nmProduto;
            document.getElementById('productDescription').value = product.dsProduto;
            document.getElementById('productCategory').value = product.dsCategoria;
            document.getElementById('productOldPrice').value = product.vlAntigo;
            document.getElementById('productPrice').value = product.vlProduto;
            document.getElementById('productStock').value = product.dsEstoque;
            document.getElementById('productImage').value = product.imagemPrincipal;
            document.getElementById('productFeatured').checked = product.destaque;

            document.getElementById('formTitle').innerHTML = '<i class="bi bi-pencil-square"></i> Editar Produto';
            document.getElementById('saveBtn').textContent = 'Atualizar Produto';
            document.getElementById('cancelBtn').style.display = 'block';

            const imagePreviewContainer = document.createElement('div');
            imagePreviewContainer.id = 'imagePreview';
            imagePreviewContainer.className = 'mt-2 mb-3';
            
            if (product.imagemPrincipal) {
                imagePreviewContainer.innerHTML = `
                    <p class="mb-1">Imagem atual:</p>
                    <img src="${product.imagemPrincipal}" alt="${product.nmProduto}" 
                         style="max-width: 100%; max-height: 150px; border: 1px solid #ddd; border-radius: 4px;">
                `;

                const imageField = document.getElementById('productImage').parentNode;
                if (!document.getElementById('imagePreview')) {
                    imageField.appendChild(imagePreviewContainer);
                } else {
                    document.getElementById('imagePreview').innerHTML = imagePreviewContainer.innerHTML;
                }
            }

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
        nmProduto: document.getElementById('productName').value,
        dsProduto: document.getElementById('productDescription').value,
        vlAntigo: parseFloat(document.getElementById('productOldPrice').value),
        vlProduto: parseFloat(document.getElementById('productPrice').value),
        dsEstoque: parseInt(document.getElementById('productStock').value),
        dsCategoria: document.getElementById('productCategory').value,
        imagemPrincipal: document.getElementById('productImage').value,
        imagensGaleria: [],
        destaque: document.getElementById('productFeatured').checked
    };

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

    return url.match(/\.(jpeg|jpg|gif|png|webp)$/) !== null || 
           url.startsWith('http') || 
           url.startsWith('https') || 
           url.startsWith('/');
}


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