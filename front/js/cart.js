document.addEventListener('DOMContentLoaded', function() {
    if (window.location.href.includes('carrinho.html')) {
        const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
        if (!isLoggedIn) {
            alert("Você precisa estar logado para acessar o carrinho.");
            window.location.href = "login.html";
            return;
        }

        loadCart();
        setupCartEventListeners();
    }
});

function loadCart() {
    const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
    const cartContainer = document.querySelector('.cart-items');
    
    if (!cartContainer) return;
    
    cartContainer.innerHTML = '';
    
    if (cartItems.length === 0) {
        cartContainer.innerHTML = '<div class="empty-cart"><p>Seu carrinho está vazio</p><a href="exibirProduto.html" class="btn btn-primary">Continuar Comprando</a></div>';
        document.querySelector('.summary').style.visibility = 'hidden';
        return;
    }

    cartItems.forEach(item => {
        const cartItemElement = document.createElement('div');
        cartItemElement.className = 'cart-item';
        cartItemElement.setAttribute('data-id', item.id);
        cartItemElement.setAttribute('data-price', item.preco);
        
        // Incluir a imagem do produto se disponível
        const imageSrc = item.imagem || 'https://via.placeholder.com/90x90?text=Produto';
        
        cartItemElement.innerHTML = `
            <img src="${imageSrc}" alt="${item.nome}" style="width: 90px; height: 90px; object-fit: cover; border-radius: 10px; border: 3px solid #4677E0;">
            <div class="item-details">
                <h4>${item.nome}</h4>
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

    updateCartTotals();
}

function setupCartEventListeners() {
    const cartContainer = document.querySelector('.cart-items');
    if (!cartContainer) return;

    cartContainer.addEventListener('click', function(event) {
        const target = event.target;
        const cartItem = target.closest('.cart-item');
        
        if (!cartItem) return;
        
        const itemId = cartItem.getAttribute('data-id');
        const quantityInput = cartItem.querySelector('input');
        let quantity = parseInt(quantityInput.value);

        if (target.classList.contains('decrease-quantity')) {
            if (quantity > 1) {
                quantityInput.value = --quantity;
                updateCartItemQuantity(itemId, quantity);
            }
        }

        if (target.classList.contains('increase-quantity')) {
            quantityInput.value = ++quantity;
            updateCartItemQuantity(itemId, quantity);
        }

        if (target.classList.contains('remove-item') || target.closest('.remove-item')) {
            removeCartItem(itemId);
            cartItem.remove();

            if (document.querySelectorAll('.cart-item').length === 0) {
                cartContainer.innerHTML = '<div class="empty-cart"><p>Seu carrinho está vazio</p><a href="exibirProduto.html" class="btn btn-primary">Continuar Comprando</a></div>';
                document.querySelector('.summary').style.visibility = 'hidden';
            }
        }

        updateCartTotals();
    });

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

    const calculateButton = document.querySelector('.summary button');
    if (calculateButton) {
        calculateButton.addEventListener('click', function() {
            calcularFrete();
        });
    }

    const checkoutButton = document.querySelector('.finalizar');
    if (checkoutButton) {
        checkoutButton.addEventListener('click', function() {
            processCheckout();
        });
    }
}

function updateCartItemQuantity(itemId, quantity) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const itemIndex = cart.findIndex(item => item.id == itemId);
    
    if (itemIndex !== -1) {
        cart[itemIndex].quantity = quantity;
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartTotals();
    }
}

function removeCartItem(itemId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart = cart.filter(item => item.id != itemId);
    localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCartTotals() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    const subtotal = cart.reduce((total, item) => {
        return total + (item.preco * item.quantity);
    }, 0);

    const discount = subtotal * 0.1;

    const shippingElement = document.getElementById('frete');
    const shipping = shippingElement ? 
        parseFloat(shippingElement.textContent.replace('R$', '').replace(',', '.')) || 0 : 0;

    const total = subtotal - discount + shipping;

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

function calcularFrete() {
    const cepInput = document.getElementById('cep');
    const freteElement = document.getElementById('frete');
    
    if (!cepInput || !freteElement) return;
    
    const cep = cepInput.value.replace(/\D/g, '');
    
    if (cep.length !== 8) {
        alert('Por favor, digite um CEP válido');
        return;
    }

    freteElement.textContent = 'Calculando...';

    setTimeout(() => {
        const frete = Math.floor(Math.random() * (50 - 15 + 1)) + 15;
        freteElement.textContent = `R$${frete.toFixed(2).replace('.', ',')}`;

        updateCartTotals();
    }, 1000);
}

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

    const orderData = {
        clienteId: parseInt(userId),
        itens: cart.map(item => ({
            produtoId: parseInt(item.id),
            quantidade: parseInt(item.quantity),
            precoUnitario: typeof item.preco === 'object' ? item.preco : Number(item.preco)
        })),
        cepEntrega: cepInput ? cepInput.value : '',
        enderecoEntrega: ''
    };
    
    console.log("Enviando dados:", JSON.stringify(orderData));
    
    const checkoutButton = document.querySelector('.finalizar');
    if (checkoutButton) {
        checkoutButton.disabled = true;
        checkoutButton.textContent = 'Processando...';
    }

    fetch('http://localhost:8081/pedidos', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
    })
    .then(response => {
        if (!response.ok) {
            return response.text().then(text => {
                console.error("Resposta de erro:", text);
                throw new Error(text || 'Erro ao processar pedido');
            });
        }
        return response.json();
    })
    .then(data => {
        alert('Compra finalizada com sucesso! Obrigado por sua compra.');
        
        localStorage.removeItem('cart');

        window.location.href = 'exibirProduto.html';
    })
    .catch(error => {
        console.error('Erro ao processar pedido:', error);
        alert(`Erro ao finalizar compra: ${error.message}`);

        if (checkoutButton) {
            checkoutButton.disabled = false;
            checkoutButton.textContent = 'Finalizar Compra';
        }

        if (confirm('Deseja continuar com a compra em modo de demonstração?')) {
            saveToOrderHistory(orderData);

            localStorage.removeItem('cart');

            window.location.href = 'exibirProduto.html';
        }
    });
}

function saveToOrderHistory(orderData) {
    let orderHistory = JSON.parse(localStorage.getItem('orderHistory')) || [];
    const newOrder = {
        id: Date.now(),
        date: new Date().toISOString(),
        clienteId: orderData.clienteId,
        itens: orderData.itens,
        total: orderData.itens.reduce((total, item) => total + (item.precoUnitario * item.quantidade), 0),
        status: 'Processando'
    };

    orderHistory.push(newOrder);

    localStorage.setItem('orderHistory', JSON.stringify(orderHistory));
}