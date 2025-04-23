document.addEventListener("DOMContentLoaded", () => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true"; 
    const headerFile = isLoggedIn ? "cabecalho.html" : "cabecalhoDeslogado.html"; 
    
    console.log("Status de login:", isLoggedIn);
    console.log("Carregando cabeçalho:", headerFile);

    fetch(headerFile)
        .then(res => res.text())
        .then(html => {
            document.getElementById("meu-header").innerHTML = html;
            
            if (isLoggedIn) {
                setupLogoutFunctionality();
                setupPerfilFunctionality();
            }

            setupCartFunctionality();

            if (!document.querySelector('script[src*="search.js"]')) {
                const searchScript = document.createElement('script');
                searchScript.src = '../js/search.js';
                document.body.appendChild(searchScript);
            }

            if (!document.querySelector('script[src*="bootstrap.bundle.min.js"]')) {
                const bootstrapScript = document.createElement('script');
                bootstrapScript.src = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js';
                document.body.appendChild(bootstrapScript);
            }
        })
        .catch(error => {
            console.error("Erro ao carregar o cabeçalho:", error);
        });
});

function setupLogoutFunctionality() {
    setTimeout(() => {
        const logoutLink = document.querySelector('.logout-link') || 
                          document.querySelector('a[href="../html/exibirProduto.html"]');
        
        if (logoutLink) {
            logoutLink.addEventListener('click', function(e) {
                e.preventDefault();
                
                localStorage.removeItem('isLoggedIn');
                localStorage.removeItem('usuario');
                
                window.location.href = "exibirProduto.html";
            });
            console.log("Funcionalidade de logout configurada");
        } else {
            console.warn("Link de logout não encontrado");
        }
        
        const usuarioLogado = localStorage.getItem('usuario');
        console.log('ID do usuário logado:', usuarioLogado);
    }, 100);
}

function setupPerfilFunctionality() {
    setTimeout(() => {
        const perfilLink = document.querySelector('a[href="dadosCliente.html"]');
        
        if (perfilLink) {
            perfilLink.addEventListener('click', function(e) {
                e.preventDefault();
                
                const usuarioLogado = localStorage.getItem('usuario');
                if (usuarioLogado) {
                    window.location.href = "dadosCliente.html";
                } else {
                    alert("Você precisa estar logado para acessar seu perfil.");
                    window.location.href = "login.html";
                }
            });
            console.log("Funcionalidade de perfil configurada");
        } else {
            console.warn("Link de perfil não encontrado");
        }

        const segurancaLink = document.querySelector('a[href="segurancaConta.html"]');
        if (segurancaLink) {
            segurancaLink.addEventListener('click', function(e) {
                e.preventDefault();
                
                const usuarioLogado = localStorage.getItem('usuario');
                if (usuarioLogado) {
                    window.location.href = "segurancaConta.html";
                } else {
                    alert("Você precisa estar logado para acessar a segurança da conta.");
                    window.location.href = "login.html";
                }
            });
            console.log("Funcionalidade de segurança da conta configurada");
        } else {
            console.warn("Link de segurança da conta não encontrado");
        }

        const historicoLink = document.querySelector('a[href="historico.html"]');
        if (historicoLink) {
            historicoLink.addEventListener('click', function(e) {
                e.preventDefault();
                
                const usuarioLogado = localStorage.getItem('usuario');
                if (usuarioLogado) {
                    window.location.href = "historico.html";
                } else {
                    alert("Você precisa estar logado para acessar seu histórico de compras.");
                    window.location.href = "login.html";
                }
            });
            console.log("Funcionalidade de histórico configurada");
        }
    }, 100);
}

function setupCartFunctionality() {
    setTimeout(() => {
        const cartLink = document.querySelector('a[href="carrinho.html"]');
        
        if (cartLink) {
            cartLink.addEventListener('click', function(e) {
                e.preventDefault();
                
                const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
                
                if (isLoggedIn) {
                    window.location.href = "carrinho.html";
                } else {
                    alert("Você precisa estar logado para acessar o carrinho.");
                    localStorage.setItem('redirectAfterLogin', 'carrinho.html');
                    window.location.href = "login.html";
                }
            });
            console.log("Funcionalidade de carrinho configurada");
        } else {
            console.warn("Link do carrinho não encontrado");
        }
    }, 100);
}