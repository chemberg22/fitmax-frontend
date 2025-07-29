// Função para buscar e exibir dados do usuário (cabeçalho e campos)
async function fetchUserData() {
    // Recupera e loga o email do usuário armazenado no localStorage
    const userEmail = localStorage.getItem('userEmail');
    console.log('Email no localStorage:', userEmail);

    // Verifica se o email existe, se não, loga o erro redireciona para a página de login
    if (!userEmail) {
        console.log('Nenhum email encontrado no localStorage');
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

        // Obtém os elementos HTML onde os dados serão exibidos
        const userNameElement = document.getElementById('user-name');
        const userRoleElement = document.getElementById('user-role');
        const nomeCompletoElement = document.getElementById('nome-completo');
        const cpfElement = document.getElementById('cpf');
        const dataNascimentoElement = document.getElementById('data-nascimento');
        const generoElement = document.getElementById('genero');
        const emailElement = document.getElementById('email');
        const telefoneElement = document.getElementById('telefone');
        const enderecoElement = document.getElementById('endereco');

        // Verifica se os elementos existem no HTML, define os textos nos elementos com tratamento de valores nulos e loga os principais elementos atualizados
        if (userNameElement && userRoleElement && nomeCompletoElement && cpfElement && dataNascimentoElement && generoElement && emailElement && telefoneElement && enderecoElement) {
            userNameElement.textContent = userData.nomeCompleto || 'Nome não disponível';
            userRoleElement.textContent = capitalizeFirstLetter(userData.perfil);
            nomeCompletoElement.textContent = userData.nomeCompleto || 'Nome não disponível';
            cpfElement.textContent = userData.cpf ? formatCPF(userData.cpf) : 'CPF não disponível';
            dataNascimentoElement.textContent = formatDate(userData.dataNascimento);
            generoElement.textContent = formatGenero(userData.genero);
            emailElement.textContent = userData.email || 'Email não disponível';
            telefoneElement.textContent = userData.telefone ? formatTelefone(userData.telefone) : 'Telefone não disponível';
            enderecoElement.textContent = userData.endereco || 'Endereço não disponível';
            console.log('Elementos atualizados - Nome:', userNameElement.textContent, 'Perfil:', userRoleElement.textContent);
        } else {
            // Loga um erro se os elementos não forem encontrados
            console.error('Alguns elementos não foram encontrados no DOM');
        }
    } catch (error) {
        // Loga qualquer erro ocorrido durante o processo
        console.error('Erro ao carregar dados do usuário:', error);
        // Exibe um alerta e redireciona para a página de login
        alert('Erro ao carregar dados do usuário. Faça login novamente.');
        window.location.href = '../Login/index.html';
    }
}