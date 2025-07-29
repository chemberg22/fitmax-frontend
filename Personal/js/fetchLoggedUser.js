// Função para buscar e exibir nome e perfil do usuário no cabeçalho
async function fetchLoggedUser() {
    // Recupera e loga o email do usuário armazenado no localStorage
    const userEmail = localStorage.getItem('userEmail');
    console.log('Email no localStorage:', userEmail);

    // Verifica se o email existe, se não, loga o erro redireciona para a página de login
    if (!userEmail) {
        console.error('Nenhum email encontrado no localStorage');
        alert('Usuário não está logado. Faça login novamente.');
        window.location.href = '../Login/index.html';
        return;
    }

    // Loga o início da requisição ao backend
    console.log('Fazendo requisição para o backend...');
    try {
        // Faz uma requisição GET ao endpoint da API com o email
        const response = await fetch(`http://localhost:8080/api/auth/user?email=${encodeURIComponent(userEmail)}`);

        // Verifica se a resposta foi bem-sucedida, se não, loga o código do status do erro
        if (!response.ok) {
            throw new Error('Erro ao buscar dados do usuário: ' + response.status);
        }

        // Converte a resposta para JSON e loga os dados recebidos
        const userData = await response.json();
        console.log('Dados do usuário recebidos:', userData);

        // Armazena o ID do personal logado para telas que utilizam
        userId = userData.id;

        // Salva o id e o perfil no localStorage para telas que utilizam
        localStorage.setItem('personalId', userData.id);
        localStorage.setItem('perfil', userData.perfil?.toLowerCase());

        // Obtém os elementos HTML onde os dados serão exibidos
        const userNameElement = document.getElementById('user-name');
        const userRoleElement = document.getElementById('user-role');

        // Verifica se os elementos existem no HTML e loga erro caso não existam
        if (!userNameElement || !userRoleElement) {
            console.error('Elementos user-name ou user-role não encontrados no DOM');
            return;
        }

        // Define os textos nos elementos e loga os valores atualizados, com tratamento de valores nulos
        userNameElement.textContent = userData.nomeCompleto || 'Nome não disponível';
        userRoleElement.textContent = userData.perfil && typeof userData.perfil === 'string'
            ? userData.perfil.charAt(0).toUpperCase() + userData.perfil.slice(1)
            : 'Perfil não disponível';
        console.log('Elementos atualizados - Nome:', userNameElement.textContent, 'Perfil:', userRoleElement.textContent);

        return userData; // Retorna os dados do usuário para telas que utilizam
    } catch (error) {
        // Loga qualquer erro ocorrido durante o processo
        console.error('Erro ao carregar dados do usuário:', error);
        // Exibe um alerta e redireciona para a página de login
        alert('Erro ao carregar dados do usuário. Faça login novamente.');
        window.location.href = '../Login/index.html';
    }
}