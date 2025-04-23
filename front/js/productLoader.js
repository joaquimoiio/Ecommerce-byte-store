document.addEventListener('DOMContentLoaded', function() {
    const isProductPage = window.location.href.includes('produto.html');
    const isProductListPage = window.location.href.includes('exibirProduto.html');
    
    if (isProductPage) {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');
        
        if (productId) {
            loadProductDetails(productId);
        } else {
            console.error('Product ID not found in URL');
            alert('Produto não encontrado. Redirecionando para a página principal.');
            window.location.href = 'exibirProduto.html';
        }
    } else if (isProductListPage) {
        loadFeaturedProducts();
    }
});

function loadProductDetails(productId) {
    const productDetails = document.querySelector('.produto-detalhes');
    if (productDetails) {
        productDetails.innerHTML = '<p>Carregando informações do produto...</p>';
    }
    
    fetch(`http://localhost:8081/produtos/${productId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Product not found');
            }
            return response.json();
        })
        .then(product => {
            displayProductDetails(product);
        })
        .catch(error => {
            console.error('Error loading product:', error);
            
            const mockProduct = getMockProduct(productId);
            displayProductDetails(mockProduct);

            const warningDiv = document.createElement('div');
            warningDiv.style.backgroundColor = '#fff3cd';
            warningDiv.style.color = '#856404';
            warningDiv.style.padding = '10px';
            warningDiv.style.borderRadius = '5px';
            warningDiv.style.margin = '10px 0';
            warningDiv.style.textAlign = 'center';
            warningDiv.textContent = 'Dados de demonstração: O produto real não foi encontrado.';
            
            const productContainer = document.querySelector('.produto-container');
            if (productContainer) {
                productContainer.appendChild(warningDiv);
            }
        });
}

function displayProductDetails(product) {
    const productName = document.querySelector('.produto-nome');
    if (productName) {
        productName.textContent = product.nome;
    }

    const productDescription = document.querySelector('.produto-descricao');
    if (productDescription && product.descricao) {
        productDescription.textContent = product.descricao;
    }

    const oldPrice = document.querySelector('.preco-antigo');
    if (oldPrice) {
        oldPrice.textContent = `R$${formatPrice(product.precoAntigo)}`;
    }
    
    const promoPrice = document.querySelector('.preco-promocao');
    if (promoPrice) {
        promoPrice.textContent = `R$${formatPrice(product.precoAtual)}`;
    }

    const parceladoPrices = document.querySelectorAll('.preco-parcelado p');
    if (parceladoPrices.length > 0) {
        parceladoPrices[0].textContent = `R$${formatPrice(product.precoAtual)}`;
    }

    const addToCartBtn = document.querySelector('.btn-carrinho');
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', function() {
            const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
            if (!isLoggedIn) {
                alert('Você precisa estar logado para adicionar produtos ao carrinho.');
                localStorage.setItem('redirectAfterLogin', 'produto.html?id=' + product.id);
                window.location.href = 'login.html';
                return;
            }
            
            const quantity = parseInt(document.getElementById('quantidade').value) || 1;
            addToCart(product, quantity);
        });
    }

    const buyNowBtn = document.querySelector('.btn-comprar');
    if (buyNowBtn) {
        buyNowBtn.addEventListener('click', function() {
            const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
            if (!isLoggedIn) {
                alert('Você precisa estar logado para comprar produtos.');
                localStorage.setItem('redirectAfterLogin', 'produto.html?id=' + product.id);
                window.location.href = 'login.html';
                return;
            }
            
            const quantity = parseInt(document.getElementById('quantidade').value) || 1;
            addToCart(product, quantity);
            window.location.href = 'carrinho.html';
        });
    }
}

function loadFeaturedProducts() {
    fetch('http://localhost:8081/produtos/destaque')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load featured products');
            }
            return response.json();
        })
        .then(products => {
            displayFeaturedProducts(products);
        })
        .catch(error => {
            console.error('Error loading featured products:', error);
            displayFeaturedProducts(getMockFeaturedProducts());

            const warningDiv = document.createElement('div');
            warningDiv.style.backgroundColor = '#fff3cd';
            warningDiv.style.color = '#856404';
            warningDiv.style.padding = '10px';
            warningDiv.style.borderRadius = '5px';
            warningDiv.style.margin = '20px auto';
            warningDiv.style.maxWidth = '80%';
            warningDiv.style.textAlign = 'center';
            warningDiv.textContent = 'Dados de demonstração: Os produtos reais não foram encontrados.';
            
            const carousel = document.querySelector('.carousel-container');
            if (carousel) {
                carousel.parentNode.insertBefore(warningDiv, carousel.nextSibling);
            }
        });
}

function displayFeaturedProducts(products) {
    const carousel = document.querySelector('.carousel-container');
    if (!carousel) return;

    let productsSection = document.querySelector('.products-section');
    if (!productsSection) {
        productsSection = document.createElement('section');
        productsSection.className = 'products-section';
        productsSection.innerHTML = '<h2 style="text-align: center; margin: 20px 0; color: #4088f4;">Produtos em Destaque</h2><div class="products-grid"></div>';
        carousel.parentNode.insertBefore(productsSection, carousel.nextSibling);
    }
    
    const productsGrid = document.querySelector('.products-grid');
    if (!productsGrid) return;

    productsGrid.innerHTML = '';

    productsGrid.style.display = 'flex';
    productsGrid.style.flexWrap = 'wrap';
    productsGrid.style.justifyContent = 'center';
    productsGrid.style.gap = '20px';
    productsGrid.style.padding = '20px';

    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.style.border = '2px solid #4088f4';
        productCard.style.borderRadius = '10px';
        productCard.style.padding = '15px';
        productCard.style.width = '250px';
        productCard.style.textAlign = 'center';
        productCard.style.backgroundColor = 'white';
        
        productCard.innerHTML = `
            <div style="height: 150px; display: flex; align-items: center; justify-content: center; margin-bottom: 10px;">
                <h4 style="color: #4088f4;">${product.nome}</h4>
            </div>
            <h3 style="font-size: 18px; color: #4088f4; margin-bottom: 10px;">${product.nome}</h3>
            <p style="text-decoration: line-through; color: #888; margin: 5px 0;">R$${formatPrice(product.precoAntigo)}</p>
            <p style="font-size: 20px; color: #e60000; margin: 5px 0;">R$${formatPrice(product.precoAtual)}</p>
            <button class="btn btn-primary view-product" data-id="${product.id}" style="background-color: #4088f4; border-color: #4088f4; width: 100%; margin-top: 10px;">Ver Produto</button>
        `;
        
        productsGrid.appendChild(productCard);
    });

    document.querySelectorAll('.view-product').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            if (productId) {
                window.location.href = `produto.html?id=${productId}`;
            }
        });
    });
}

function addToCart(product, quantity) {

    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
        alert('Você precisa estar logado para adicionar produtos ao carrinho.');
        localStorage.setItem('redirectAfterLogin', 'produto.html?id=' + product.id);
        window.location.href = 'login.html';
        return;
    }
    
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    const existingProductIndex = cart.findIndex(item => item.id === product.id);
    
    if (existingProductIndex >= 0) {
        cart[existingProductIndex].quantity += quantity;
    } else {
        cart.push({
            id: product.id,
            nome: product.nome,
            preco: product.precoAtual,
            quantity: quantity
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    
    alert('Produto adicionado ao carrinho!');
}

function formatPrice(price) {
    if (typeof price === 'number') {
        return price.toFixed(2).replace('.', ',');
    } else if (typeof price === 'string') {
        return parseFloat(price).toFixed(2).replace('.', ',');
    } else if (price && typeof price === 'object') {
        return parseFloat(price).toFixed(2).replace('.', ',');
    }
    return '0,00';
}

function getMockProduct(id) {
    return {
        id: id,
        nome: 'Notebook Gamer XYZ',
        precoAntigo: 4439.90,
        precoAtual: 3995.91,
        descricao: 'Notebook Gamer de última geração com processador de alta performance.',
        categoria: 'Notebooks',
        estoque: 10,
        destaque: true
    };
}

function getMockFeaturedProducts() {
    return [
        {
            id: 1,
            nome: 'Notebook Gamer XYZ',
            precoAntigo: 4439.90,
            precoAtual: 3995.91,
            categoria: 'Notebooks',
            estoque: 10,
            destaque: true
        },
        {
            id: 2,
            nome: 'Mouse Gamer RGB',
            precoAntigo: 249.90,
            precoAtual: 199.90,
            categoria: 'Periféricos',
            estoque: 25,
            destaque: true
        },
        {
            id: 3,
            nome: 'Teclado Mecânico LED',
            precoAntigo: 349.90,
            precoAtual: 299.90,
            categoria: 'Periféricos',
            estoque: 15,
            destaque: true
        },
        {
            id: 4,
            nome: 'Headset 7.1 Surround',
            precoAntigo: 299.90,
            precoAtual: 249.90,
            categoria: 'Periféricos',
            estoque: 20,
            destaque: true
        }
    ];
}