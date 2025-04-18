document.addEventListener("DOMContentLoaded", () => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true"; // Check login status
    const headerFile = isLoggedIn ? "cabecalho.html" : "cabecalhoDeslogado.html"; // Determine which header to load

    // Buscar o cabeçalho correto baseado no estado de login
    fetch(headerFile)
        .then(res => res.text())
        .then(html => {
            document.getElementById("meu-header").innerHTML = html;
            
            // Após o carregamento do cabeçalho, configurar o botão de logout se estiver logado
            if (isLoggedIn) {
                setupLogoutFunctionality();
            }
            
            // Carregar scripts do Bootstrap depois do cabeçalho se necessário
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

// Configurar a funcionalidade de logout
function setupLogoutFunctionality() {
    // Esperar um momento para garantir que o DOM foi atualizado com o cabeçalho
    setTimeout(() => {
        // Procurar o link de logout nos dois possíveis formatos
        const logoutLink = document.querySelector('.logout-link') || 
                          document.querySelector('a[href="../html/exibirProduto.html"]');
        
        if (logoutLink) {
            logoutLink.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Limpar as informações de login
                localStorage.removeItem('isLoggedIn');
                localStorage.removeItem('usuario');
                
                // Redirecionar para a página principal
                window.location.href = "exibirProduto.html";
            });
        }
        
        // Obter e exibir informações do usuário logado
        const usuarioLogado = localStorage.getItem('usuario');
        console.log('ID do usuário logado:', usuarioLogado);
    }, 100); // Pequeno timeout para garantir que o DOM foi atualizado
}