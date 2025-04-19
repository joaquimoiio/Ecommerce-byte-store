// cart.js - Shopping cart functionality
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the cart page
    if (window.location.href.includes('carrinho.html')) {
        loadCart();
        setupCartEventListeners();
    }
});

// Function to load cart items from localStorage
function loadCart() {
    const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
    const cartContainer = document.querySelector('.cart-items');
    
    if (!cartContainer) return;
    
    // Clear existing items
    cartContainer.innerHTML = '';
    
    if (cartItems.length === 0) {
        cartContainer.innerHTML = '<div class="empty-cart"><p>Seu carrinho está vazio</p><a href="exibirProduto.html" class="btn btn-primary">Continuar Comprando</a></div>';
        document.querySelector('.summary').style.visibility = 'hidden';
        return;
    }
    
    // Add each item to the cart
    cartItems.forEach(item => {
        const cartItemElement = document.createElement('div');
        cartItemElement.className = 'cart-item';
        cartItemElement.setAttribute('data-id', item.id);
        cartItemElement.setAttribute('data-price', item.preco);
        
        cartItemElement.innerHTML = `
            <img src="${item.imagem || 'https://via.placeholder.com/90x90'}" alt="${item.nome}">
            <div class="item-details">
                ${item.nome}
                <p>R$${typeof item.preco === 'number' ? item.preco.toFixed(2).replace('.', ',') : item.preco}</p>
            </div>
            <div class="quantity">
                <button class="decrease-quantity">-</button>
                <input type="text" value="${item.quantity}" readonly>
                <button class="increase-quantity">+</button>
            </div>
            <button class="remove-item" style="background-color: #ff3333; color: white; border: none; padding: 8px 12px; border-radius: 5px; margin-left: 10px; cursor: pointer;">
                <i class="bi bi-trash"></i>
            </button>
        `;
        
        cartContainer.appendChild(cartItemElement);
    });
    
    // Update totals
    updateCartTotals();
}

// Function to set up event listeners for cart interactions
function setupCartEventListeners() {
    const cartContainer = document.querySelector('.cart-items');
    if (!cartContainer) return;
    
    // Event delegation for quantity changes and item removal
    cartContainer.addEventListener('click', function(event) {
        const target = event.target;
        const cartItem = target.closest('.cart-item');
        
        if (!cartItem) return;
        
        const itemId = cartItem.getAttribute('data-id');
        const quantityInput = cartItem.querySelector('input');
        let quantity = parseInt(quantityInput.value);
        
        // Handle decrease quantity button
        if (target.classList.contains('decrease-quantity')) {
            if (quantity > 1) {
                quantityInput.value = --quantity;
                updateCartItemQuantity(itemId, quantity);
            }
        }
        
        // Handle increase quantity button
        if (target.classList.contains('increase-quantity')) {
            quantityInput.value = ++quantity;
            updateCartItemQuantity(itemId, quantity);
        }
        
        // Handle remove item button
        if (target.classList.contains('remove-item') || target.closest('.remove-item')) {
            removeCartItem(itemId);
            cartItem.remove();
            
            // Check if cart is empty
            if (document.querySelectorAll('.cart-item').length === 0) {
                cartContainer.innerHTML = '<div class="empty-cart"><p>Seu carrinho está vazio</p><a href="exibirProduto.html" class="btn btn-primary">Continuar Comprando</a></div>';
                document.querySelector('.summary').style.visibility = 'hidden';
            }
        }
        
        // Update totals
        updateCartTotals();
    });
    
    // Setup CEP calculation
    const cepInput = document.getElementById('cep');
    if (cepInput) {
        cepInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            
            if (value.length > 5) {
                value = value.replace(/^(\d{5})(\d)/, '$1-$2');
            }
            
            e.target.value = value;
        });
    }
    
    // Setup calculate shipping button
    const calculateButton = document.querySelector('.summary button');
    if (calculateButton) {
        calculateButton.addEventListener('click', function() {
            calcularFrete();
        });
    }
    
    // Setup checkout button
    const checkoutButton = document.querySelector('.finalizar');
    if (checkoutButton) {
        checkoutButton.addEventListener('click', function() {
            processCheckout();
        });
    }
}

// Function to update item quantity in localStorage
function updateCartItemQuantity(itemId, quantity) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const itemIndex = cart.findIndex(item => item.id == itemId);
    
    if (itemIndex !== -1) {
        cart[itemIndex].quantity = quantity;
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartTotals();
    }
}

// Function to remove item from localStorage
function removeCartItem(itemId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart = cart.filter(item => item.id != itemId);
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Function to update cart totals
function updateCartTotals() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Calculate subtotal
    const subtotal = cart.reduce((total, item) => {
        return total + (item.preco * item.quantity);
    }, 0);
    
    // Calculate discount (10% for demo)
    const discount = subtotal * 0.1;
    
    // Get shipping cost from DOM
    const shippingElement = document.getElementById('frete');
    const shipping = shippingElement ? 
        parseFloat(shippingElement.textContent.replace('R$', '').replace(',', '.')) || 0 : 0;
    
    // Calculate total
    const total = subtotal - discount + shipping;
    
    // Update DOM elements
    const subtotalElement = document.getElementById('subtotal');
    const discountElement = document.getElementById('desconto');
    const totalElement = document.getElementById('total');
    
    if (subtotalElement) {
        subtotalElement.textContent = `R$${subtotal.toFixed(2).replace('.', ',')}`;
    }
    
    if (discountElement) {
        discountElement.textContent = `-R$${discount.toFixed(2).replace('.', ',')}`;
    }
    
    if (totalElement) {
        totalElement.textContent = `R$${total.toFixed(2).replace('.', ',')}`;
    }
}

// Function to calculate shipping
function calcularFrete() {
    const cepInput = document.getElementById('cep');
    const freteElement = document.getElementById('frete');
    
    if (!cepInput || !freteElement) return;
    
    const cep = cepInput.value.replace(/\D/g, '');
    
    if (cep.length !== 8) {
        alert('Por favor, digite um CEP válido');
        return;
    }
    
    // Show loading indicator
    freteElement.textContent = 'Calculando...';
    
    // Try to fetch shipping from an API (ViaCEP for validation)
    fetch(`https://viacep.com.br/ws/${cep}/json/`)
        .then(response => {
            if (!response.ok) {
                throw new Error('CEP inválido');
            }
            return response.json();
        })
        .then(data => {
            if (data.erro) {
                throw new Error('CEP não encontrado');
            }
            
            // In a real app, you would make an API call to a shipping service
            // based on the address information from ViaCEP
            // For demo, we'll use a random value between 15 and 50
            const frete = Math.floor(Math.random() * (50 - 15 + 1)) + 15;
            
            freteElement.textContent = `R$${frete.toFixed(2).replace('.', ',')}`;
            
            // Update totals
            updateCartTotals();
        })
        .catch(error => {
            console.error('Erro ao calcular frete:', error);
            alert(`Erro ao calcular frete: ${error.message}`);
            freteElement.textContent = 'R$0,00';
            updateCartTotals();
        });
}

// Function to process checkout
function processCheckout() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const userId = localStorage.getItem('usuario');
    
    if (cart.length === 0) {
        alert('Seu carrinho está vazio.');
        return;
    }
    
    if (!isLoggedIn) {
        alert('Por favor, faça login para finalizar a compra.');
        localStorage.setItem('redirectAfterLogin', 'carrinho.html');
        window.location.href = 'login.html';
        return;
    }
    
    const cepInput = document.getElementById('cep');
    if (cepInput && cepInput.value.replace(/\D/g, '').length !== 8) {
        alert('Por favor, calcule o frete antes de finalizar a compra.');
        return;
    }
    
    // Create order data
    const orderData = {
        clienteId: userId,
        itens: cart.map(item => ({
            produtoId: item.id,
            quantidade: item.quantity,
            precoUnitario: item.preco
        })),
        cepEntrega: cepInput ? cepInput.value : '',
        enderecoEntrega: '' // In a real app, you would collect more address information
    };
    
    // Show loading state
    const checkoutButton = document.querySelector('.finalizar');
    if (checkoutButton) {
        checkoutButton.disabled = true;
        checkoutButton.textContent = 'Processando...';
    }
    
    // Send to backend
    fetch('http://localhost:8080/pedidos', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => {
                throw new Error(err.message || 'Erro ao processar pedido');
            });
        }
        return response.json();
    })
    .then(data => {
        // Success!
        alert('Compra finalizada com sucesso! Obrigado por sua compra.');
        
        // Clear cart
        localStorage.removeItem('cart');
        
        // Redirect to home page
        window.location.href = 'exibirProduto.html';
    })
    .catch(error => {
        console.error('Erro ao processar pedido:', error);
        alert(`Erro ao finalizar compra: ${error.message}`);
        
        // Reset button
        if (checkoutButton) {
            checkoutButton.disabled = false;
            checkoutButton.textContent = 'Finalizar Compra';
        }
        
        // Fallback to localStorage for demo
        if (confirm('Deseja continuar com a compra em modo de demonstração?')) {
            saveToOrderHistory(orderData);
            
            // Clear cart
            localStorage.removeItem('cart');
            
            // Redirect to home page
            window.location.href = 'exibirProduto.html';
        }
    });
}

// Function to save order to history (fallback when backend fails)
function saveToOrderHistory(orderData) {
    // Get existing order history or initialize empty array
    let orderHistory = JSON.parse(localStorage.getItem('orderHistory')) || [];
    
    // Create a new order entry
    const newOrder = {
        id: Date.now(), // Use timestamp as ID
        date: new Date().toISOString(),
        clienteId: orderData.clienteId,
        itens: orderData.itens,
        total: orderData.itens.reduce((total, item) => total + (item.precoUnitario * item.quantidade), 0),
        status: 'Processando'
    };
    
    // Add to history
    orderHistory.push(newOrder);
    
    // Save updated history
    localStorage.setItem('orderHistory', JSON.stringify(orderHistory));
}