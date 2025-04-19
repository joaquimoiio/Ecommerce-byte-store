// orderHistory.js - Purchase history functionality
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the history page
    if (window.location.href.includes('historico.html')) {
        // Check login status
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        const userId = localStorage.getItem('usuario');
        
        if (!isLoggedIn || !userId) {
            alert('Por favor, faça login para acessar seu histórico de compras.');
            window.location.href = 'login.html';
            return;
        }
        
        loadOrderHistory(userId);
    }
});

// Function to load order history
function loadOrderHistory(userId) {
    // Attempt to fetch order history from backend
    fetch(`http://localhost:8080/pedidos/cliente/${userId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao buscar histórico de pedidos');
            }
            return response.json();
        })
        .then(pedidos => {
            displayOrderHistory(pedidos);
        })
        .catch(error => {
            console.error('Erro:', error);
            // Fallback to localStorage for demo if backend fails
            let orderHistory = JSON.parse(localStorage.getItem('orderHistory')) || [];
            orderHistory = orderHistory.filter(order => order.clienteId == userId);
            displayOrderHistory(orderHistory);
        });
}

// Function to display order history
function displayOrderHistory(pedidos) {
    const historyContainer = document.querySelector('.historico-compras');
    if (!historyContainer) return;
    
    // Clear existing content except the heading
    const heading = historyContainer.querySelector('h2');
    historyContainer.innerHTML = '';
    historyContainer.appendChild(heading);
    
    if (!pedidos || pedidos.length === 0) {
        const emptyMessage = document.createElement('p');
        emptyMessage.textContent = 'Você ainda não realizou nenhuma compra.';
        emptyMessage.style.textAlign = 'center';
        emptyMessage.style.margin = '20px 0';
        historyContainer.appendChild(emptyMessage);
        return;
    }
    
    // Sort orders by date (newest first) if we're using the localStorage fallback
    if (pedidos[0].date) {
        pedidos.sort((a, b) => new Date(b.date) - new Date(a.date));
    }
    
    // Add each order to the history container
    pedidos.forEach(order => {
        const orderElement = document.createElement('div');
        orderElement.className = 'compra';
        
        // Handle both backend format and localStorage format
        const orderId = order.id || order.id;
        const orderDate = order.dataHora ? new Date(order.dataHora) : new Date(order.date);
        const orderTotal = order.valorTotal || order.total;
        const orderStatus = order.status || order.status;
        
        orderElement.setAttribute('data-order-id', orderId);
        
        // Format date
        const formattedDate = `${orderDate.getDate().toString().padStart(2, '0')}/${(orderDate.getMonth() + 1).toString().padStart(2, '0')}/${orderDate.getFullYear()}`;
        
        // Get day of week in Portuguese
        const daysOfWeek = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
        const dayOfWeek = daysOfWeek[orderDate.getDay()];
        
        orderElement.innerHTML = `
            <span>Compra #${orderId.toString().slice(-4)} - ${dayOfWeek} - ${formattedDate} - R$${typeof orderTotal === 'number' ? orderTotal.toFixed(2).replace('.', ',') : orderTotal} - ${orderStatus}</span>
            <button>Detalhes do Pedido</button>
        `;
        
        historyContainer.appendChild(orderElement);
        
        // Add click event for order details
        const detailsButton = orderElement.querySelector('button');
        detailsButton.addEventListener('click', function() {
            showOrderDetails(order);
        });
    });
}

// Function to show order details
function showOrderDetails(order) {
    // Create a modal element
    const modal = document.createElement('div');
    modal.className = 'order-details-modal';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = '1000';
    
    // Handle both backend format and localStorage format
    const orderId = order.id || order.id;
    const orderDate = order.dataHora ? new Date(order.dataHora) : new Date(order.date);
    const orderTotal = order.valorTotal || order.total;
    const orderStatus = order.status || order.status;
    const orderItems = order.itens || order.itens;
    
    // Format date
    const formattedDate = `${orderDate.getDate().toString().padStart(2, '0')}/${(orderDate.getMonth() + 1).toString().padStart(2, '0')}/${orderDate.getFullYear()}`;
    
    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.style.backgroundColor = 'white';
    modalContent.style.padding = '20px';
    modalContent.style.borderRadius = '10px';
    modalContent.style.width = '80%';
    modalContent.style.maxWidth = '600px';
    modalContent.style.maxHeight = '80%';
    modalContent.style.overflowY = 'auto';
    modalContent.style.border = '5px solid #4088f4';
    
    // Modal header
    modalContent.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h3 style="margin: 0; color: #4088f4;">Detalhes do Pedido #${orderId.toString().slice(-4)}</h3>
            <button class="close-modal" style="background: none; border: none; font-size: 24px; cursor: pointer;">&times;</button>
        </div>
        <div style="margin-bottom: 20px;">
            <p><strong>Data:</strong> ${formattedDate}</p>
            <p><strong>Status:</strong> ${orderStatus}</p>
            <p><strong>Total:</strong> R$${typeof orderTotal === 'number' ? orderTotal.toFixed(2).replace('.', ',') : orderTotal}</p>
        </div>
        <h4 style="color: #4088f4; margin-bottom: 10px;">Itens do Pedido</h4>
        <div class="order-items"></div>
    `;
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // Close button functionality
    const closeButton = modal.querySelector('.close-modal');
    closeButton.addEventListener('click', function() {
        document.body.removeChild(modal);
    });
    
    // Close modal when clicking outside
    modal.addEventListener('click', function(event) {
        if (event.target === modal) {
            document.body.removeChild(modal);
        }
    });
    
    // Load and display order items
    const orderItemsContainer = modal.querySelector('.order-items');
    
    // Check if we have real items or need to fetch them
    if (orderItems && orderItems.length > 0) {
        displayOrderItems(orderItems, orderItemsContainer);
    } else {
        // Fetch order details from backend
        fetch(`http://localhost:8080/pedidos/${orderId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Não foi possível carregar os detalhes do pedido');
                }
                return response.json();
            })
            .then(orderDetails => {
                displayOrderItems(orderDetails.itens, orderItemsContainer);
            })
            .catch(error => {
                console.error('Erro ao carregar detalhes do pedido:', error);
                orderItemsContainer.innerHTML = '<p>Não foi possível carregar os detalhes deste pedido.</p>';
            });
    }
}

// Function to display order items
function displayOrderItems(items, container) {
    if (!items || items.length === 0) {
        container.innerHTML = '<p>Não há itens neste pedido.</p>';
        return;
    }
    
    // Determine if we're using backend format or localStorage format
    const isBackendFormat = items[0].produto !== undefined;
    
    items.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.style.display = 'flex';
        itemElement.style.alignItems = 'center';
        itemElement.style.padding = '10px';
        itemElement.style.marginBottom = '10px';
        itemElement.style.border = '1px solid #ddd';
        itemElement.style.borderRadius = '5px';
        
        let productId, productName, productImage, quantity, price;
        
        if (isBackendFormat) {
            // Backend format
            productId = item.produto.id;
            productName = item.produto.nome;
            productImage = item.produto.imagemPrincipal;
            quantity = item.quantidade;
            price = item.precoUnitario;
        } else {
            // localStorage format
            productId = item.produtoId;
            quantity = item.quantidade;
            price = item.precoUnitario;
            
            // For localStorage format, we might need to fetch product details
            // or use mock data for demo purposes
            const mockProducts = [
                { id: 1, nome: 'Notebook Gamer XYZ', imagem: 'https://via.placeholder.com/50x50?text=Notebook' },
                { id: 2, nome: 'Mouse Gamer RGB', imagem: 'https://via.placeholder.com/50x50?text=Mouse' },
                { id: 3, nome: 'Teclado Mecânico LED', imagem: 'https://via.placeholder.com/50x50?text=Teclado' },
                { id: 4, nome: 'Headset 7.1 Surround', imagem: 'https://via.placeholder.com/50x50?text=Headset' }
            ];
            
            const matchedProduct = mockProducts.find(p => p.id == productId);
            if (matchedProduct) {
                productName = matchedProduct.nome;
                productImage = matchedProduct.imagem;
            } else {
                productName = `Produto ${productId}`;
                productImage = 'https://via.placeholder.com/50x50';
            }
        }
        
        // Create the item element content
        itemElement.innerHTML = `
            <img src="${productImage || 'https://via.placeholder.com/50x50'}" alt="${productName}" style="width: 50px; height: 50px; border-radius: 5px; margin-right: 15px;">
            <div style="flex-grow: 1;">
                <p style="margin: 0 0 5px 0; font-weight: bold;">${productName}</p>
                <p style="margin: 0; color: #666;">Quantidade: ${quantity}</p>
            </div>
            <div style="min-width: 80px; text-align: right;">
                <p style="margin: 0; font-weight: bold;">R$${typeof price === 'number' ? price.toFixed(2).replace('.', ',') : price}</p>
            </div>
        `;
        
        container.appendChild(itemElement);
    });
    
    // Add total section
    const totalElement = document.createElement('div');
    totalElement.style.display = 'flex';
    totalElement.style.justifyContent = 'space-between';
    totalElement.style.borderTop = '2px solid #4088f4';
    totalElement.style.marginTop = '15px';
    totalElement.style.paddingTop = '15px';
    totalElement.style.fontWeight = 'bold';
    
    // Calculate total from items
    let total = 0;
    items.forEach(item => {
        const price = isBackendFormat ? item.precoUnitario : item.precoUnitario;
        const quantity = isBackendFormat ? item.quantidade : item.quantidade;
        total += price * quantity;
    });
    
    totalElement.innerHTML = `
        <span>Total:</span>
        <span>R$${typeof total === 'number' ? total.toFixed(2).replace('.', ',') : total}</span>
    `;
    
    container.appendChild(totalElement);
}