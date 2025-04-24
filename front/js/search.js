document.addEventListener('DOMContentLoaded', function () {
    console.log('Script de pesquisa carregado');

    setTimeout(function () {
        const searchForm = document.querySelector('form[role="search"]');

        if (searchForm) {
            console.log('Formulário de pesquisa encontrado');

            searchForm.addEventListener('submit', function (event) {
                event.preventDefault();
                console.log('Formulário de pesquisa submetido');

                const searchInput = this.querySelector('input[type="search"]');
                const searchTerm = searchInput.value.trim();

                console.log('Termo de pesquisa:', searchTerm);

                if (searchTerm === '') {
                    console.log('Termo de pesquisa vazio, restaurando exibição normal');
                    restaurarExibicaoNormal();
                    return;
                }

                executarPesquisa(searchTerm);
            });

            const searchInput = searchForm.querySelector('input[type="search"]');
            if (searchInput) {
                searchInput.addEventListener('keypress', function (event) {
                    if (event.key === 'Enter') {
                        event.preventDefault();
                        const searchTerm = this.value.trim();

                        if (searchTerm === '') {
                            console.log('Termo de pesquisa vazio, restaurando exibição normal');
                            restaurarExibicaoNormal();
                            return;
                        }

                        executarPesquisa(searchTerm);
                    }
                });
            }
        } else {
            console.warn('Formulário de pesquisa não encontrado');
        }

        if (window.location.href.includes('exibirProduto.html')) {
            const urlParams = new URLSearchParams(window.location.search);
            const searchTerm = urlParams.get('busca');

            if (searchTerm) {
                console.log('Parâmetro de busca encontrado na URL:', searchTerm);
                carregarResultadosPesquisa(searchTerm);

                const searchInput = document.querySelector('input[type="search"]');
                if (searchInput) {
                    searchInput.value = searchTerm;
                }
            }
        }
    }, 500);
});

function restaurarExibicaoNormal() {
    console.log('Restaurando exibição normal');

    const url = new URL(window.location.href);
    url.search = '';
    window.history.pushState({}, '', url);

    const carousel = document.querySelector('.carousel-container');
    if (carousel) {
        carousel.style.display = 'block';
    }

    const searchResults = document.querySelector('.products-section');
    if (searchResults) {
        searchResults.innerHTML = '';
    }

    if (window.location.href.includes('exibirProduto.html')) {
        console.log('Recarregando a página para exibir produtos em destaque');
        window.location.reload();
    }
}

function executarPesquisa(termo) {
    console.log('Executando pesquisa para:', termo);

    localStorage.setItem('ultimaPesquisa', termo);

    if (window.location.href.includes('exibirProduto.html')) {
        carregarResultadosPesquisa(termo);
    } else {
        window.location.href = `exibirProduto.html?busca=${encodeURIComponent(termo)}`;
    }
}

function carregarResultadosPesquisa(termo) {
    console.log('Carregando resultados para:', termo);

    const carousel = document.querySelector('.carousel-container');
    if (carousel) {
        carousel.style.display = 'none';
    }

    let productsSection = document.querySelector('.products-section');

    if (!productsSection) {
        productsSection = document.createElement('section');
        productsSection.className = 'products-section';

        if (carousel) {
            carousel.parentNode.insertBefore(productsSection, carousel.nextSibling);
        } else {
            document.body.appendChild(productsSection);
        }
    }

    productsSection.innerHTML = '<h2 style="text-align: center; margin: 20px 0; color: #4088f4;">Buscando por: ' + termo + '</h2>' +
        '<div class="loading" style="text-align: center; padding: 20px;">Carregando resultados...</div>';

    fetch(`http://localhost:8081/produtos/busca?nome=${encodeURIComponent(termo)}`)
        .then(response => {
            console.log('Resposta da API:', response.status);
            if (!response.ok) {
                throw new Error('Erro ao buscar produtos');
            }
            return response.json();
        })
        .then(produtos => {
            console.log('Produtos encontrados:', produtos.length);
            exibirResultadosPesquisa(produtos, termo);

            if (produtos.length === 0 && carousel) {
                carousel.style.display = 'block';
            }
        })
        .catch(error => {
            console.error('Erro na pesquisa:', error);

            const produtosSimulados = gerarProdutosSimulados(termo);

            console.log('Usando produtos simulados:', produtosSimulados.length);
            exibirResultadosPesquisa(produtosSimulados, termo, true);

            if (produtosSimulados.length === 0 && carousel) {
                carousel.style.display = 'block';
            }
        });
}

function gerarProdutosSimulados(termo) {
    const termoBusca = termo.toLowerCase();

    const todosProdutos = [
        {
            id: 1,
            nome: "Notebook Gamer Avançado",
            descricao: "Notebook poderoso para jogos de última geração",
            precoAntigo: 4999.90,
            precoAtual: 4499.90,
            categoria: "Notebooks",
            estoque: 10,
            destaque: true,
            imagemPrincipal: "https://via.placeholder.com/300x300?text=Notebook+Gamer"
        },
        {
            id: 2,
            nome: "Notebook Ultrafino",
            descricao: "Notebook leve e portátil para produtividade",
            precoAntigo: 3599.90,
            precoAtual: 3299.90,
            categoria: "Notebooks",
            estoque: 15,
            destaque: false,
            imagemPrincipal: "https://via.placeholder.com/300x300?text=Notebook+Ultrafino"
        },
        {
            id: 3,
            nome: "Mouse Gamer RGB",
            descricao: "Mouse de alta precisão para jogos",
            precoAntigo: 249.90,
            precoAtual: 199.90,
            categoria: "Periféricos",
            estoque: 25,
            destaque: true,
            imagemPrincipal: "https://via.placeholder.com/300x300?text=Mouse+Gamer"
        },
        {
            id: 4,
            nome: "Teclado Mecânico",
            descricao: "Teclado mecânico com switches blue",
            precoAntigo: 349.90,
            precoAtual: 299.90,
            categoria: "Periféricos",
            estoque: 20,
            destaque: true,
            imagemPrincipal: "https://via.placeholder.com/300x300?text=Teclado+Mecanico"
        },
        {
            id: 5,
            nome: "Headset 7.1 Surround",
            descricao: "Headset com som surround para jogos",
            precoAntigo: 299.90,
            precoAtual: 249.90,
            categoria: "Periféricos",
            estoque: 18,
            destaque: true,
            imagemPrincipal: "https://via.placeholder.com/300x300?text=Headset"
        },
        {
            id: 6,
            nome: "Monitor Gamer 144Hz",
            descricao: "Monitor com alta taxa de atualização para jogos",
            precoAntigo: 1499.90,
            precoAtual: 1299.90,
            categoria: "Monitores",
            estoque: 8,
            destaque: false,
            imagemPrincipal: "https://via.placeholder.com/300x300?text=Monitor+Gamer"
        }
    ];

    return todosProdutos.filter(produto =>
        produto.nome.toLowerCase().includes(termoBusca) ||
        produto.descricao.toLowerCase().includes(termoBusca) ||
        produto.categoria.toLowerCase().includes(termoBusca)
    );
}

function exibirResultadosPesquisa(produtos, termo, dadosSimulados = false) {
    console.log('Exibindo resultados para:', termo);
    console.log('Número de produtos:', produtos.length);

    let productsSection = document.querySelector('.products-section');

    if (!productsSection) {
        productsSection = document.createElement('section');
        productsSection.className = 'products-section';

        const carousel = document.querySelector('.carousel-container');
        if (carousel) {
            carousel.parentNode.insertBefore(productsSection, carousel.nextSibling);
        } else {
            document.body.appendChild(productsSection);
        }
    }

    productsSection.innerHTML = '';

    const titleElement = document.createElement('h2');
    titleElement.style.textAlign = 'center';
    titleElement.style.margin = '20px 0';
    titleElement.style.color = '#4088f4';
    titleElement.textContent = `Resultados para: "${termo}"`;
    productsSection.appendChild(titleElement);

    const backButton = document.createElement('button');
    backButton.textContent = 'Voltar aos produtos em destaque';
    backButton.className = 'btn btn-secondary';
    backButton.style.display = 'block';
    backButton.style.margin = '0 auto 20px';
    backButton.style.backgroundColor = '#6c757d';
    backButton.style.borderColor = '#6c757d';
    backButton.style.color = 'white';
    backButton.style.padding = '8px 16px';
    backButton.style.borderRadius = '4px';
    backButton.onclick = restaurarExibicaoNormal;
    productsSection.appendChild(backButton);

    const productsGrid = document.createElement('div');
    productsGrid.className = 'products-grid';
    productsGrid.style.display = 'flex';
    productsGrid.style.flexWrap = 'wrap';
    productsGrid.style.justifyContent = 'center';
    productsGrid.style.gap = '20px';
    productsGrid.style.padding = '20px';
    productsSection.appendChild(productsGrid);

    if (!produtos || produtos.length === 0) {
        const noResults = document.createElement('p');
        noResults.style.textAlign = 'center';
        noResults.style.padding = '20px';
        noResults.textContent = `Nenhum produto encontrado para "${termo}". Tente outra palavra-chave.`;
        productsGrid.appendChild(noResults);

        const sugestaoTitle = document.createElement('h3');
        sugestaoTitle.style.textAlign = 'center';
        sugestaoTitle.style.margin = '20px 0';
        sugestaoTitle.style.color = '#4088f4';
        sugestaoTitle.textContent = 'Você pode gostar destes produtos:';
        productsSection.appendChild(sugestaoTitle);

        loadFeaturedProductsFallback(productsSection);

        return;
    }

    produtos.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.style.border = '2px solid #4088f4';
        productCard.style.borderRadius = '10px';
        productCard.style.padding = '15px';
        productCard.style.width = '250px';
        productCard.style.textAlign = 'center';
        productCard.style.backgroundColor = 'white';

        // Adicionar imagem do produto se disponível
        const imageHtml = product.imagemPrincipal ? 
            `<img src="${product.imagemPrincipal}" alt="${product.nome}" style="max-width: 100%; max-height: 150px; object-fit: contain;">` : 
            `<h4 style="color: #4088f4;">${product.nome}</h4>`;

        productCard.innerHTML = `
            <div style="height: 150px; display: flex; align-items: center; justify-content: center; margin-bottom: 10px;">
                ${imageHtml}
            </div>
            <h3 style="font-size: 18px; color: #4088f4; margin-bottom: 10px;">${product.nome}</h3>
            <p style="text-decoration: line-through; color: #888; margin: 5px 0;">R$${formatPrice(product.precoAntigo)}</p>
            <p style="font-size: 20px; color: #e60000; margin: 5px 0;">R$${formatPrice(product.precoAtual)}</p>
            <button class="btn btn-primary view-product" data-id="${product.id}" style="background-color: #4088f4; border-color: #4088f4; width: 100%; margin-top: 10px;">Ver Produto</button>
        `;

        productsGrid.appendChild(productCard);
    });

    document.querySelectorAll('.view-product').forEach(button => {
        button.addEventListener('click', function () {
            const productId = this.getAttribute('data-id');
            if (productId) {
                window.location.href = `produto.html?id=${productId}`;
            }
        });
    });

    if (dadosSimulados) {
        const warningDiv = document.createElement('div');
        warningDiv.style.backgroundColor = '#fff3cd';
        warningDiv.style.color = '#856404';
        warningDiv.style.padding = '10px';
        warningDiv.style.borderRadius = '5px';
        warningDiv.style.margin = '20px auto';
        warningDiv.style.maxWidth = '80%';
        warningDiv.style.textAlign = 'center';
        warningDiv.textContent = 'Dados de demonstração: Os produtos reais não foram encontrados.';
        productsSection.appendChild(warningDiv);
    }
}

function loadFeaturedProductsFallback(container) {
    const featuredProducts = [
        {
            id: 1,
            nome: "Notebook Gamer Avançado",
            precoAntigo: 4999.90,
            precoAtual: 4499.90,
            categoria: "Notebooks",
            estoque: 10,
            destaque: true,
            imagemPrincipal: "https://via.placeholder.com/300x300?text=Notebook+Gamer"
        },
        {
            id: 3,
            nome: "Mouse Gamer RGB",
            precoAntigo: 249.90,
            precoAtual: 199.90,
            categoria: "Periféricos",
            estoque: 25,
            destaque: true,
            imagemPrincipal: "https://via.placeholder.com/300x300?text=Mouse+Gamer"
        },
        {
            id: 4,
            nome: "Teclado Mecânico",
            precoAntigo: 349.90,
            precoAtual: 299.90,
            categoria: "Periféricos",
            estoque: 20,
            destaque: true,
            imagemPrincipal: "https://via.placeholder.com/300x300?text=Teclado+Mecanico"
        }
    ];

    const suggestedGrid = document.createElement('div');
    suggestedGrid.className = 'suggested-grid';
    suggestedGrid.style.display = 'flex';
    suggestedGrid.style.flexWrap = 'wrap';
    suggestedGrid.style.justifyContent = 'center';
    suggestedGrid.style.gap = '20px';
    suggestedGrid.style.padding = '20px';
    container.appendChild(suggestedGrid);

    featuredProducts.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.style.border = '2px solid #4088f4';
        productCard.style.borderRadius = '10px';
        productCard.style.padding = '15px';
        productCard.style.width = '250px';
        productCard.style.textAlign = 'center';
        productCard.style.backgroundColor = 'white';

        // Adicionar imagem do produto
        const imageHtml = product.imagemPrincipal ? 
            `<img src="${product.imagemPrincipal}" alt="${product.nome}" style="max-width: 100%; max-height: 150px; object-fit: contain;">` : 
            `<h4 style="color: #4088f4;">${product.nome}</h4>`;

        productCard.innerHTML = `
            <div style="height: 150px; display: flex; align-items: center; justify-content: center; margin-bottom: 10px;">
                ${imageHtml}
            </div>
            <h3 style="font-size: 18px; color: #4088f4; margin-bottom: 10px;">${product.nome}</h3>
            <p style="text-decoration: line-through; color: #888; margin: 5px 0;">R$${formatPrice(product.precoAntigo)}</p>
            <p style="font-size: 20px; color: #e60000; margin: 5px 0;">R$${formatPrice(product.precoAtual)}</p>
            <button class="btn btn-primary view-product" data-id="${product.id}" style="background-color: #4088f4; border-color: #4088f4; width: 100%; margin-top: 10px;">Ver Produto</button>
        `;

        suggestedGrid.appendChild(productCard);
    });

    document.querySelectorAll('.view-product').forEach(button => {
        button.addEventListener('click', function () {
            const productId = this.getAttribute('data-id');
            if (productId) {
                window.location.href = `produto.html?id=${productId}`;
            }
        });
    });
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