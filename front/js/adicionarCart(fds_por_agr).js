let frete = 0;
let desconto = 0;

function changeQuantity(button, delta) {
    let input = button.parentNode.querySelector('input');
    let newValue = Math.max(1, parseInt(input.value) + delta);
    input.value = newValue;
    updateTotal();
}

function calcularFrete() {
    let cep = document.getElementById('cep').value.replace(/\D/g, '');
    if (cep.length === 8) {
        frete = 19.90;
    } else {
        frete = 0;
    }
    document.getElementById('frete').innerText = 'R$' + frete.toFixed(2).replace('.', ',');
    updateTotal();
}

function updateTotal() {
    let items = document.querySelectorAll('.cart-item');
    let subtotal = 0;
    items.forEach(item => {
        let price = parseFloat(item.getAttribute('data-price'));
        let quantity = parseInt(item.querySelector('.quantity input').value);
        subtotal += price * quantity;
    });

    let total = subtotal - desconto + frete;

    document.getElementById('subtotal').innerText = 'R$' + subtotal.toFixed(2).replace('.', ',');
    document.getElementById('total').innerText = 'R$' + total.toFixed(2).replace('.', ',');
}

updateTotal();