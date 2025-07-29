// Função para buscar e exibir dados do usuário
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
        console.log('Dados do usuário recebidos:', JSON.stringify(userData, null, 2));

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
        const perfilElement = document.getElementById('perfil');
        const statusElement = document.getElementById('status');
        const unidadeElement = document.getElementById('unidade');
        const senhaElement = document.getElementById('senha');

        // Verifica se os elementos existem no HTML e define os textos nos elementos com tratamento de valores nulos
        if (userNameElement && userRoleElement && nomeCompletoElement && cpfElement && dataNascimentoElement && generoElement && emailElement && telefoneElement && enderecoElement && perfilElement && statusElement && unidadeElement && senhaElement) {
            userNameElement.textContent = userData.nomeCompleto || 'Nome não disponível';
            userRoleElement.textContent = capitalizeFirstLetter(userData.perfil) || 'Perfil não disponível';
            nomeCompletoElement.value = userData.nomeCompleto || '';
            cpfElement.textContent = userData.cpf ? formatCPF(userData.cpf) : 'CPF não disponível';
            dataNascimentoElement.textContent = userData.dataNascimento ? formatDate(userData.dataNascimento) : 'Data não disponível';
            generoElement.value = userData.genero || 'masculino';
            emailElement.value = userData.email || '';
            telefoneElement.value = userData.telefone || '';
            enderecoElement.value = userData.endereco || '';
            perfilElement.textContent = capitalizeFirstLetter(userData.perfil) || 'Perfil não disponível';
            statusElement.textContent = capitalizeFirstLetter(userData.status) || 'Status não disponível';
            unidadeElement.textContent = userData.perfil === 'personal' && userData.unidade && userData.unidade.nome ? userData.unidade.nome : 'Não associado';
            senhaElement.value = '';
        } else {
            // Loga um erro se os elementos não foram encontrados
            console.error('Alguns elementos não foram encontrados no DOM');
        }
    } catch (error) {
        // Loga qualquer erro ocorrido durante o processo
        console.error('Erro ao carregar dados do usuário:', error);
        // Exibe um alerta e redireciona para a página de login
        alert('Erro ao carregar dados do usuário: ' + error.message);
        window.location.href = '../Login/index.html';
    }
}

// Função para salvar os dados editados do usuário
async function saveUserData() {
    // Recupera e loga o email do usuário armazenado no localStorage
    const userEmail = localStorage.getItem('userEmail');
    // Verifica se o usuário está logado,se não, redireciona para a página de login
    if (!userEmail) {
        alert('Usuário não está logado. Faça login novamente.');
        window.location.href = '../Login/index.html';
        return;
    }

    // Captura os dados do formulário
    const nomeCompleto = document.getElementById('nome-completo').value.trim();
    const genero = document.getElementById('genero').value.toLowerCase();
    const email = document.getElementById('email').value.trim();
    const telefone = document.getElementById('telefone').value.trim();
    const endereco = document.getElementById('endereco').value.trim();
    const senha = document.getElementById('senha').value.trim();

    // Valida os campos obrigatórios
    if (!nomeCompleto.match(/^[A-Za-zÀ-ÿ\s]+$/)) {
        alert('Nome completo deve conter apenas letras e espaços.');
        return;
    }
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        alert('E-mail inválido.');
        return;
    }
    if (!telefone.match(/^[0-9]+$/)) {
        alert('Telefone deve conter apenas dígitos.');
        return;
    }
    if (telefone.length !== 11 ) {
        alert('Telefone deve conter 11 dígitos.');
        return;
    }
    if (!endereco) {
        alert('Endereço é obrigatório.');
        return;
    }
    if (!['masculino', 'feminino', 'nao_informado'].includes(genero)) {
        alert('Gênero inválido.');
        return;
    }

    // Loga o início da requisição ao backend
    console.log('Buscando dados atuais do usuário antes de atualizar...');
    try {
        // Faz uma requisição GET ao endpoint da API com o email
        const response = await fetch(`http://localhost:8080/api/auth/user?email=${encodeURIComponent(userEmail)}`);

        // Verifica se a resposta foi bem-sucedida, se não, loga o código do status do erro
        if (!response.ok) {
            throw new Error('Erro ao buscar dados atuais do usuário: ' + response.status);
        }

        // Converte e loga a resposta para JSON e loga os dados recebidos
        const userData = await response.json();
        console.log('Dados atuais do usuário:', JSON.stringify(userData, null, 2));

        //Verifica se o ID do usuário é válido
        if (!userData.id) {
            throw new Error('ID do usuário não encontrado nos dados retornados.');
        }

        // Cria o objeto com os dados atualizados
        const usuarioAtualizado = {
            nomeCompleto: nomeCompleto,
            genero: genero,
            email: email,
            telefone: telefone,
            endereco: endereco,
            senhaHash: senha || null // Envia vazio se a senha estiver em branco
        };

        // Loga os dados editados do usuário
        console.log('Dados a serem enviados para o backend:', JSON.stringify(usuarioAtualizado, null, 2));

        // Faz uma requisição PUT ao endpoint da API com os dados do usuário atualizados
        const updateResponse = await fetch(`http://localhost:8080/api/usuarios/${userData.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(usuarioAtualizado)
        });

        // Loga o retorno do backend com sucesso ou falha
        console.log('Resposta do backend:', updateResponse);

        // Verifica se a resposta da requisição não foi bem-sucedida
        if (!updateResponse.ok) {
            // Lê o corpo da resposta negativa como texto para obter a mensagem de erro enviada pelo backend
            const errorText = await updateResponse.text();
            // Loga o texto do erro no console
            console.error('Erro retornado pelo backend:', errorText);
        }

        // Converte a resposta para JSON e loga os dados atualizados
        const updatedData = await updateResponse.json();
        console.log('Dados atualizados retornados pelo backend:', JSON.stringify(updatedData, null, 2));

        // Alerta o sucesso e redireciona para a tela anterior
        alert('Dados salvos com sucesso!');
        window.location.href = 'userdata.html';
    } catch (error) {
        // Loga qualquer erro ocorrido durante o processo
        console.error('Erro ao salvar dados:', error);
        alert('Erro ao salvar dados do usuário: ' + error.message);
    }
}

// Função para redirecionar para a página anterior
function cancelEdit() {
    window.location.href = 'userdata.html';
}