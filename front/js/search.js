// search.js - Funcionalidade para barra de pesquisa
document.addEventListener('DOMContentLoaded', function () {
    console.log('Script de pesquisa carregado');

    // Esperar um pouco para garantir que o cabeçalho já foi carregado
    setTimeout(function () {
        // Buscar o formulário de pesquisa em cada página
        const searchForm = document.querySelector('form[role="search"]');

        if (searchForm) {
            console.log('Formulário de pesquisa encontrado');

            searchForm.addEventListener('submit', function (event) {
                event.preventDefault();
                console.log('Formulário de pesquisa submetido');

                // Obter o texto da pesquisa
                const searchInput = this.querySelector('input[type="search"]');
                const searchTerm = searchInput.value.trim();

                console.log('Termo de pesquisa:', searchTerm);

                // Se o termo de pesquisa estiver vazio, restauramos a exibição normal
                if (searchTerm === '') {
                    console.log('Termo de pesquisa vazio, restaurando exibição normal');
                    restaurarExibicaoNormal();
                    return;
                }

                // Executar a pesquisa
                executarPesquisa(searchTerm);
            });

            // Adicionar manipulador para tecla Enter no campo de pesquisa
            const searchInput = searchForm.querySelector('input[type="search"]');
            if (searchInput) {
                searchInput.addEventListener('keypress', function (event) {
                    if (event.key === 'Enter') {
                        event.preventDefault();
                        const searchTerm = this.value.trim();

                        // Se o termo de pesquisa estiver vazio, restauramos a exibição normal
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

        // Verificar se estamos na página de exibição de produtos e temos um parâmetro de busca
        if (window.location.href.includes('exibirProduto.html')) {
            const urlParams = new URLSearchParams(window.location.search);
            const searchTerm = urlParams.get('busca');

            if (searchTerm) {
                console.log('Parâmetro de busca encontrado na URL:', searchTerm);
                // Executar a pesquisa com o termo da URL
                carregarResultadosPesquisa(searchTerm);

                // Atualizar o campo de pesquisa com o termo
                const searchInput = document.querySelector('input[type="search"]');
                if (searchInput) {
                    searchInput.value = searchTerm;
                }
            }
        }
    }, 500); // Aguardar 500ms para garantir que o DOM esteja pronto
});

// Função para restaurar a exibição normal da página (produtos em destaque)
function restaurarExibicaoNormal() {
    console.log('Restaurando exibição normal');

    // Remover parâmetros de busca da URL sem recarregar a página
    const url = new URL(window.location.href);
    url.search = '';
    window.history.pushState({}, '', url);

    // Mostrar o carrossel novamente
    const carousel = document.querySelector('.carousel-container');
    if (carousel) {
        carousel.style.display = 'block';
    }

    // Limpar a seção de produtos de pesquisa, se existir
    const searchResults = document.querySelector('.products-section');
    if (searchResults) {
        searchResults.innerHTML = '';
    }

    // Se estivermos na página inicial, recarregar a página para garantir que os produtos sejam exibidos
    if (window.location.href.includes('exibirProduto.html')) {
        console.log('Recarregando a página para exibir produtos em destaque');
        window.location.reload();
    }
}

// Função para executar a pesquisa
function executarPesquisa(termo) {
    console.log('Executando pesquisa para:', termo);

    // Salvar o termo de pesquisa para uso na página de resultados
    localStorage.setItem('ultimaPesquisa', termo);

    // Se estivermos já na página de exibição de produtos, atualizamos in-place
    if (window.location.href.includes('exibirProduto.html')) {
        // Se já estamos na página de produtos, apenas carregamos os resultados
        carregarResultadosPesquisa(termo);
    } else {
        // Caso contrário, redirecionamos para a página de produtos com o parâmetro de pesquisa
        window.location.href = `exibirProduto.html?busca=${encodeURIComponent(termo)}`;
    }
}

// Função para carregar os resultados da pesquisa
function carregarResultadosPesquisa(termo) {
    console.log('Carregando resultados para:', termo);

    // Indicador de carregamento
    const carousel = document.querySelector('.carousel-container');
    if (carousel) {
        // Esconder o carrossel temporariamente durante a pesquisa
        carousel.style.display = 'none';
    }

    // Verificar se já existe uma seção de produtos
    let productsSection = document.querySelector('.products-section');

    if (!productsSection) {
        // Se não existir, criar uma nova seção
        productsSection = document.createElement('section');
        productsSection.className = 'products-section';

        // Adicionar após o carrossel ou no corpo do documento
        if (carousel) {
            carousel.parentNode.insertBefore(productsSection, carousel.nextSibling);
        } else {
            document.body.appendChild(productsSection);
        }
    }

    // Mostrar indicador de carregamento
    productsSection.innerHTML = '<h2 style="text-align: center; margin: 20px 0; color: #4088f4;">Buscando por: ' + termo + '</h2>' +
        '<div class="loading" style="text-align: center; padding: 20px;">Carregando resultados...</div>';

    // Fazer a requisição para o backend
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

            // Mostrar o carrossel novamente se não tivermos resultados
            if (produtos.length === 0 && carousel) {
                carousel.style.display = 'block';
            }
        })
        .catch(error => {
            console.error('Erro na pesquisa:', error);

            // Em caso de erro, exibir produtos simulados para demonstração
            const produtosSimulados = gerarProdutosSimulados(termo);

            console.log('Usando produtos simulados:', produtosSimulados.length);
            exibirResultadosPesquisa(produtosSimulados, termo, true);

            // Mostrar o carrossel novamente se não tivermos resultados
            if (produtosSimulados.length === 0 && carousel) {
                carousel.style.display = 'block';
            }
        });
}

// Função para gerar produtos simulados baseados no termo de pesquisa
function gerarProdutosSimulados(termo) {
    const termoBusca = termo.toLowerCase();

    // Lista de produtos simulados
    const todosProdutos = [
        {
            id: 1,
            nome: "Notebook Gamer Avançado",
            descricao: "Notebook poderoso para jogos de última geração",
            precoAntigo: 4999.90,
            precoAtual: 4499.90,
            categoria: "Notebooks",
            estoque: 10,
            destaque: true
        },
        {
            id: 2,
            nome: "Notebook Ultrafino",
            descricao: "Notebook leve e portátil para produtividade",
            precoAntigo: 3599.90,
            precoAtual: 3299.90,
            categoria: "Notebooks",
            estoque: 15,
            destaque: false
        },
        {
            id: 3,
            nome: "Mouse Gamer RGB",
            descricao: "Mouse de alta precisão para jogos",
            precoAntigo: 249.90,
            precoAtual: 199.90,
            categoria: "Periféricos",
            estoque: 25,
            destaque: true
        },
        {
            id: 4,
            nome: "Teclado Mecânico",
            descricao: "Teclado mecânico com switches blue",
            precoAntigo: 349.90,
            precoAtual: 299.90,
            categoria: "Periféricos",
            estoque: 20,
            destaque: true
        },
        {
            id: 5,
            nome: "Headset 7.1 Surround",
            descricao: "Headset com som surround para jogos",
            precoAntigo: 299.90,
            precoAtual: 249.90,
            categoria: "Periféricos",
            estoque: 18,
            destaque: true
        },
        {
            id: 6,
            nome: "Monitor Gamer 144Hz",
            descricao: "Monitor com alta taxa de atualização para jogos",
            precoAntigo: 1499.90,
            precoAtual: 1299.90,
            categoria: "Monitores",
            estoque: 8,
            destaque: false
        }
    ];

    // Filtrar produtos que contêm o termo de busca (case insensitive)
    return todosProdutos.filter(produto =>
        produto.nome.toLowerCase().includes(termoBusca) ||
        produto.descricao.toLowerCase().includes(termoBusca) ||
        produto.categoria.toLowerCase().includes(termoBusca)
    );
}

// Função para exibir os resultados da pesquisa
function exibirResultadosPesquisa(produtos, termo, dadosSimulados = false) {
    console.log('Exibindo resultados para:', termo);
    console.log('Número de produtos:', produtos.length);

    // Verificar se já existe uma seção de produtos
    let productsSection = document.querySelector('.products-section');

    if (!productsSection) {
        // Se não existir, criar uma nova seção
        productsSection = document.createElement('section');
        productsSection.className = 'products-section';

        // Adicionar após o carrossel ou no corpo do documento
        const carousel = document.querySelector('.carousel-container');
        if (carousel) {
            carousel.parentNode.insertBefore(productsSection, carousel.nextSibling);
        } else {
            document.body.appendChild(productsSection);
        }
    }

    // Atualizar o conteúdo da seção
    productsSection.innerHTML = '';

    // Título da seção
    const titleElement = document.createElement('h2');
    titleElement.style.textAlign = 'center';
    titleElement.style.margin = '20px 0';
    titleElement.style.color = '#4088f4';
    titleElement.textContent = `Resultados para: "${termo}"`;
    productsSection.appendChild(titleElement);

    // Botão para voltar à exibição normal
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

    // Grid de produtos
    const productsGrid = document.createElement('div');
    productsGrid.className = 'products-grid';
    productsGrid.style.display = 'flex';
    productsGrid.style.flexWrap = 'wrap';
    productsGrid.style.justifyContent = 'center';
    productsGrid.style.gap = '20px';
    productsGrid.style.padding = '20px';
    productsSection.appendChild(productsGrid);

    // Verificar se há produtos
    if (!produtos || produtos.length === 0) {
        const noResults = document.createElement('p');
        noResults.style.textAlign = 'center';
        noResults.style.padding = '20px';
        noResults.textContent = `Nenhum produto encontrado para "${termo}". Tente outra palavra-chave.`;
        productsGrid.appendChild(noResults);

        // Exibir produtos em destaque como sugestão
        const sugestaoTitle = document.createElement('h3');
        sugestaoTitle.style.textAlign = 'center';
        sugestaoTitle.style.margin = '20px 0';
        sugestaoTitle.style.color = '#4088f4';
        sugestaoTitle.textContent = 'Você pode gostar destes produtos:';
        productsSection.appendChild(sugestaoTitle);

        // Carregar produtos em destaque
        loadFeaturedProductsFallback(productsSection);

        return;
    }

    // Exibir cada produto
    produtos.forEach(product => {
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

    // Adicionar evento de clique nos botões
    document.querySelectorAll('.view-product').forEach(button => {
        button.addEventListener('click', function () {
            const productId = this.getAttribute('data-id');
            if (productId) {
                window.location.href = `produto.html?id=${productId}`;
            }
        });
    });

    // Se estamos usando dados simulados, exibir um aviso
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

// Função para carregar produtos em destaque como fallback
function loadFeaturedProductsFallback(container) {
    // Produtos em destaque simulados
    const featuredProducts = [
        {
            id: 1,
            nome: "Notebook Gamer Avançado",
            precoAntigo: 4999.90,
            precoAtual: 4499.90,
            categoria: "Notebooks",
            estoque: 10,
            destaque: true
        },
        {
            id: 3,
            nome: "Mouse Gamer RGB",
            precoAntigo: 249.90,
            precoAtual: 199.90,
            categoria: "Periféricos",
            estoque: 25,
            destaque: true
        },
        {
            id: 4,
            nome: "Teclado Mecânico",
            precoAntigo: 349.90,
            precoAtual: 299.90,
            categoria: "Periféricos",
            estoque: 20,
            destaque: true
        }
    ];

    // Grid de produtos
    const suggestedGrid = document.createElement('div');
    suggestedGrid.className = 'suggested-grid';
    suggestedGrid.style.display = 'flex';
    suggestedGrid.style.flexWrap = 'wrap';
    suggestedGrid.style.justifyContent = 'center';
    suggestedGrid.style.gap = '20px';
    suggestedGrid.style.padding = '20px';
    container.appendChild(suggestedGrid);

    // Exibir cada produto em destaque
    featuredProducts.forEach(product => {
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

        suggestedGrid.appendChild(productCard);
    });

    // Adicionar evento de clique nos botões
    document.querySelectorAll('.view-product').forEach(button => {
        button.addEventListener('click', function () {
            const productId = this.getAttribute('data-id');
            if (productId) {
                window.location.href = `produto.html?id=${productId}`;
            }
        });
    });
}

// Função auxiliar para formatar preço
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