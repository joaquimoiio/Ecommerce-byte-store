// Product loader for exibirProduto.html and produto.html
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on a product page
    const isProductPage = window.location.href.includes('produto.html');
    const isProductListPage = window.location.href.includes('exibirProduto.html');
    
    if (isProductPage) {
        // Get product ID from URL parameter
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');
        
        if (productId) {
            loadProductDetails(productId);
        } else {
            console.error('Product ID not found in URL');
            // Redirect to main page or show error
            alert('Produto não encontrado. Redirecionando para a página principal.');
            window.location.href = 'exibirProduto.html';
        }
    } else if (isProductListPage) {
        // Load featured products for the main page
        loadFeaturedProducts();
    }
});

// Function to load a single product's details
function loadProductDetails(productId) {
    // Show loading state
    const productDetails = document.querySelector('.produto-detalhes');
    if (productDetails) {
        productDetails.innerHTML = '<p>Carregando informações do produto...</p>';
    }
    
    // Fetch product details from backend
    fetch(`http://localhost:8080/produtos/${productId}`)
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
            
            // Display dummy product for demonstration
            const mockProduct = getMockProduct(productId);
            displayProductDetails(mockProduct);
            
            // Show warning about mock data
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

// Function to display product details in the UI
function displayProductDetails(product) {
    // Update product name
    const productName = document.querySelector('.produto-detalhes h3');
    if (productName) {
        productName.textContent = product.nome;
    }
    
    // Update prices
    const oldPrice = document.querySelector('.preco-antigo');
    if (oldPrice) {
        oldPrice.textContent = `R$${formatPrice(product.precoAntigo)}`;
    }
    
    const promoPrice = document.querySelector('.preco-promocao');
    if (promoPrice) {
        promoPrice.textContent = `R$${formatPrice(product.precoAtual)}`;
    }
    
    // Update main product image
    const mainImage = document.querySelector('.produto-imagem img');
    if (mainImage) {
        mainImage.src = product.imagemPrincipal || 'https://via.placeholder.com/300x300';
        mainImage.alt = product.nome;
    }
    
    // Update thumbnail gallery
    const thumbnails = document.querySelectorAll('.imagem-quadrado img');
    if (thumbnails.length > 0 && product.imagensGaleria && product.imagensGaleria.length > 0) {
        thumbnails.forEach((thumb, index) => {
            if (product.imagensGaleria[index]) {
                thumb.src = product.imagensGaleria[index];
                thumb.alt = `${product.nome} - Imagem ${index + 1}`;
                
                // Add click handler to change main image
                thumb.addEventListener('click', function() {
                    if (mainImage) {
                        mainImage.src = this.src;
                    }
                });
            }
        });
    }
    
    // Set up add to cart button handler
    const addToCartBtn = document.querySelector('.btn-outline-primary');
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', function() {
            const quantity = parseInt(document.getElementById('quantidade').value) || 1;
            addToCart(product, quantity);
        });
    }
    
    // Set up buy now button handler
    const buyNowBtn = document.querySelector('.btn-primary');
    if (buyNowBtn) {
        buyNowBtn.addEventListener('click', function() {
            const quantity = parseInt(document.getElementById('quantidade').value) || 1;
            addToCart(product, quantity);
            window.location.href = 'carrinho.html';
        });
    }
}

// Function to load featured products on main page
function loadFeaturedProducts() {
    // Try to fetch featured products from backend
    fetch('http://localhost:8080/produtos/destaque')
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
            // Display mock products
            displayFeaturedProducts(getMockFeaturedProducts());
            
            // Show warning about mock data
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

// Function to display featured products on main page
function displayFeaturedProducts(products) {
    // Create a products section after the carousel
    const carousel = document.querySelector('.carousel-container');
    if (!carousel) return;
    
    // Check if products section already exists
    let productsSection = document.querySelector('.products-section');
    if (!productsSection) {
        productsSection = document.createElement('section');
        productsSection.className = 'products-section';
        productsSection.innerHTML = '<h2 style="text-align: center; margin: 20px 0; color: #4088f4;">Produtos em Destaque</h2><div class="products-grid"></div>';
        carousel.parentNode.insertBefore(productsSection, carousel.nextSibling);
    }
    
    const productsGrid = document.querySelector('.products-grid');
    if (!productsGrid) return;
    
    // Clear existing products
    productsGrid.innerHTML = '';
    
    // Style for the products grid
    productsGrid.style.display = 'flex';
    productsGrid.style.flexWrap = 'wrap';
    productsGrid.style.justifyContent = 'center';
    productsGrid.style.gap = '20px';
    productsGrid.style.padding = '20px';
    
    // Add each product
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
            <img src="${product.imagemPrincipal || 'https://via.placeholder.com/150x150'}" alt="${product.nome}" style="max-width: 150px; height: auto; margin: 0 auto 10px; display: block;">
            <h3 style="font-size: 18px; color: #4088f4; margin-bottom: 10px;">${product.nome}</h3>
            <p style="text-decoration: line-through; color: #888; margin: 5px 0;">R$${formatPrice(product.precoAntigo)}</p>
            <p style="font-size: 20px; color: #e60000; margin: 5px 0;">R$${formatPrice(product.precoAtual)}</p>
            <button class="btn btn-primary" style="background-color: #4088f4; border-color: #4088f4; width: 100%; margin-top: 10px;">Ver Produto</button>
        `;
        
        productsGrid.appendChild(productCard);
        
        // Add click event to navigate to product page
        productCard.querySelector('button').addEventListener('click', function() {
            window.location.href = `produto.html?id=${product.id}`;
        });
    });
}

// Function to add a product to cart
function addToCart(product, quantity) {
    // Get existing cart from localStorage or initialize empty array
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Check if product already exists in cart
    const existingProductIndex = cart.findIndex(item => item.id === product.id);
    
    if (existingProductIndex >= 0) {
        // Update quantity if product already in cart
        cart[existingProductIndex].quantity += quantity;
    } else {
        // Add new product to cart
        cart.push({
            id: product.id,
            nome: product.nome,
            preco: product.precoAtual,
            imagem: product.imagemPrincipal,
            quantity: quantity
        });
    }
    
    // Save updated cart to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Show confirmation to user
    alert('Produto adicionado ao carrinho!');
}

// Helper function to format price
function formatPrice(price) {
    // Handle different price formats (string, number, BigDecimal object)
    if (typeof price === 'number') {
        return price.toFixed(2).replace('.', ',');
    } else if (typeof price === 'string') {
        return parseFloat(price).toFixed(2).replace('.', ',');
    } else if (price && typeof price === 'object') {
        // Handle BigDecimal object from Java backend
        return parseFloat(price).toFixed(2).replace('.', ',');
    }
    return '0,00';
}

// Mock data for testing
function getMockProduct(id) {
    return {
        id: id,
        nome: 'Notebook Gamer XYZ',
        precoAntigo: 4439.90,
        precoAtual: 3995.91,
        descricao: 'Notebook Gamer de última geração com processador de alta performance.',
        imagemPrincipal: 'https://via.placeholder.com/300x300',
        imagensGaleria: [
            'https://via.placeholder.com/100x100?text=1',
            'https://via.placeholder.com/100x100?text=2',
            'https://via.placeholder.com/100x100?text=3',
            'https://via.placeholder.com/100x100?text=4'
        ],
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
            imagemPrincipal: 'https://via.placeholder.com/150x150?text=Notebook',
            categoria: 'Notebooks',
            estoque: 10,
            destaque: true
        },
        {
            id: 2,
            nome: 'Mouse Gamer RGB',
            precoAntigo: 249.90,
            precoAtual: 199.90,
            imagemPrincipal: 'https://via.placeholder.com/150x150?text=Mouse',
            categoria: 'Periféricos',
            estoque: 25,
            destaque: true
        },
        {
            id: 3,
            nome: 'Teclado Mecânico LED',
            precoAntigo: 349.90,
            precoAtual: 299.90,
            imagemPrincipal: 'https://via.placeholder.com/150x150?text=Teclado',
            categoria: 'Periféricos',
            estoque: 15,
            destaque: true
        },
    ];
}