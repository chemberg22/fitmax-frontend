// Função para obter o ID do usuário via URL
function getUserIdFromUrl() {
    // Cria um objeto que facilita a manipulação dos parâmetros da URL
    const urlParams = new URLSearchParams(window.location.search);
    // Retorna o valor do parâmetro ID da URL
    return urlParams.get('id');
}

// Função para buscar e exibir os dados do usuário a ser editado
async function fetchUserData() {
    // Obtém e loga o ID do usuário da URL
    const userId = getUserIdFromUrl();
    console.log('ID do usuário a ser editado:', userId);

    // Verifica se o ID foi encontrado na URL, se não, redireciona para a página anterior
    if (!userId) {
        alert('ID de usuário não encontrado. Retornando à página de cadastros.');
        window.location.href = 'manager.html';
        return;
    }

    // Loga o início da requisição ao backend
    console.log('Fazendo requisição para buscar dados do usuário...');
    try {
        // Faz uma requisição GET ao endpoint da API com o ID do usuário
        const response = await fetch(`http://localhost:8080/api/usuarios/${userId}`);

        // Verifica se a resposta foi bem-sucedida, se não, loga o código do status do erro
        if (!response.ok) {
            throw new Error('Erro ao buscar dados do usuário: ' + response.status);
        }

        // Converte a resposta para JSON e loga os dados recebidos
        const userData = await response.json();
        console.log('Dados do usuário a ser editado recebidos:', JSON.stringify(userData, null, 2));

        // Obtém os campos do formulário HTML onde os dados serão inseridos
        const nomeCompletoElement = document.getElementById('nome-completo');
        const cpfElement = document.getElementById('cpf');
        const dataNascimentoElement = document.getElementById('data-nascimento');
        const generoElement = document.getElementById('genero');
        const emailElement = document.getElementById('email');
        const telefoneElement = document.getElementById('telefone');
        const enderecoElement = document.getElementById('endereco');
        const planoElement = document.getElementById('plano');
        const planoContainer = document.getElementById('plano-container');
        const turnoElement = document.getElementById('turno');
        const turnoContainer = document.getElementById('turno-container');
        const senhaElement = document.getElementById('senha');

        // Verifica se todos os campos foram encontrados no HTML
        if (nomeCompletoElement && cpfElement && dataNascimentoElement && generoElement && emailElement && telefoneElement && enderecoElement && planoElement && planoContainer && turnoElement && turnoContainer && senhaElement) {
            // Preenche os campos do formulário com os dados do usuário com tratamento de valores nulos
            nomeCompletoElement.value = userData.nomeCompleto || '';
            cpfElement.textContent = userData.cpf ? formatCPF(userData.cpf) : 'CPF não disponível';
            dataNascimentoElement.textContent = userData.dataNascimento ? formatDate(userData.dataNascimento) : 'Data não disponível';
            generoElement.textContent = formatGenero(userData.genero);
            emailElement.value = userData.email || '';
            telefoneElement.value = userData.telefone || '';
            enderecoElement.value = userData.endereco || '';
            planoElement.value = userData.plano || 'black';
            turnoElement.value = userData.turno || 'manha';
            senhaElement.value = '';

            // Verifica se o perfil do usuário é de aluno e exibe ou oculta o campo de plano
            if (userData.perfil && userData.perfil.toLowerCase() === 'aluno') {
                planoContainer.style.display = 'block';
            } else {
                planoContainer.style.display = 'none';
                planoElement.value = '';
            }

            // Verifica se o perfil do usuário é de personal e exibe ou oculta o plano de turno
            if (userData.perfil && userData.perfil.toLowerCase() === 'personal') {
                turnoContainer.style.display = 'block';
            } else {
                turnoContainer.style.display = 'none';
                turnoElement.value = '';
            }

            // Trata o campo de unidade, exibindo apenas se o perfil for de personal
            const unidadeContainer = document.getElementById('unidade-container');
            const unidadeSelect = document.getElementById('unidade');

            if (userData.perfil && userData.perfil.toLowerCase() === 'personal') {
                unidadeContainer.style.display = 'block';

                try {
                    // Faz uma requisição GET ao endpoint de unidades da API
                    const unidadeResponse = await fetch('http://localhost:8080/api/unidades');

                    // Verifica se a resposta foi bem-sucedida, se não, loga o código do status do erro
                    if (!unidadeResponse.ok) {
                        throw new Error(`Erro ao buscar unidades: ${unidadeResponse.status}`);
                    }

                    // Converte a resposta para JSON
                    const unidades = await unidadeResponse.json();

                    // Limpa o select de unidades e preenche com as opções retornadas
                    unidadeSelect.innerHTML = '';
                    // Para cada unidade retornada, cria um option e adiciona para seleção
                    unidades.forEach(unidade => {
                        const option = document.createElement('option'); // Cria elemento <option>
                        option.value = unidade.id; // Define o valor da opção como o ID da unidade
                        option.textContent = unidade.nome; // Define o texto visível da opção
                        unidadeSelect.appendChild(option); // Adiciona a opção ao <select>
                    });

                    // Verifica e seleciona a unidade atual do usuário
                    if (userData.unidade && userData.unidade.id) {
                        unidadeSelect.value = userData.unidade.id;
                    }

                } catch (error) {
                    // Loga qualquer erro ocorrido durante o processo
                    console.error('Erro ao carregar unidades:', error);
                    alert('Erro ao carregar unidades disponíveis.');
                }
            } else {
                // Oculta o campo de unidade caso o perfil não seja de personal
                unidadeContainer.style.display = 'none';
                unidadeSelect.innerHTML = '';
            }
        } else {
            // Loga um erro se os elementos não foram encontrados
            console.error('Alguns elementos não foram encontrados no DOM');
        }
    } catch (error) {
        // Loga qualquer erro ocorrido durante o processo e redireciona para a página anterior
        console.error('Erro ao carregar dados do usuário:', error);
        alert('Erro ao carregar dados do usuário. Retornando à página de cadastros. Detalhes: ' + error.message);
        window.location.href = 'manager.html';
    }
}

// Função para salvar os dados editados do usuário
async function saveUserData() {
    // Obtém o ID do usuário da URL
    const userId = getUserIdFromUrl();

    // Verifica se o ID foi encontrado na URL, se não, redireciona para a página anterior
    if (!userId) {
        alert('ID de usuário não encontrado. Retornando à página de usuários.');
        window.location.href = 'manager.html';
        return;
    }

    // Captura os dados do formulário
    const nomeCompleto = document.getElementById('nome-completo').value.trim();
    const email = document.getElementById('email').value.toLowerCase().trim();
    const telefone = document.getElementById('telefone').value.trim();
    const endereco = document.getElementById('endereco').value.trim();
    const plano = document.getElementById('plano-container').style.display === 'block' ? document.getElementById('plano').value.toLowerCase() : null;
    const turno = document.getElementById('turno-container').style.display === 'block' ? document.getElementById('turno').value.toLowerCase() : null;
    const senha = document.getElementById('senha').value;

    // Valida os campos obrigatórios
    if (!nomeCompleto) {
        alert('Nome completo é obrigatório.');
        return;
    }
    if (!nomeCompleto.match(/^[A-Za-zÀ-ÿ\s]+$/)) {
        alert('Nome completo deve conter apenas letras e espaços.');
        return;
    }

    if (!email) {
        alert('E-mail é obrigatório.');
        return;
    }
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        alert('E-mail inválido.');
        return;
    }

    if (!telefone) {
        alert('Telefone é obrigatório.');
        return;
    }
    if (!telefone.match(/^[0-9]+$/)) {
        alert('Telefone deve conter apenas dígitos.');
        return;
    }
    
    if(telefone.length !== 11) {
        alert('Telefone deve conter 11 digitos.');
        return;
    }

    if (!endereco) {
        alert('Endereço é obrigatório.');
        return;
    }

    // Captura o ID da unidade se o campo estiver visível
    const unidadeId = document.getElementById('unidade-container').style.display === 'block' ? parseInt(document.getElementById('unidade').value) : null;

    // Cria o objeto com os dados atualizados
    const usuarioAtualizado = {
        nomeCompleto: nomeCompleto,
        email: email,
        telefone: telefone,
        endereco: endereco,
        plano: plano,
        turno: turno,
        senhaHash: senha || null,
        unidade: unidadeId ? { id: unidadeId } : null
    };

    // Loga os dados editados do usuário
    console.log('Dados a serem enviados para o backend:', JSON.stringify(usuarioAtualizado, null, 2));

    // Faz uma requisição PUT ao endpoint da API com os dados do usuário atualizado
    try {
        const response = await fetch(`http://localhost:8080/api/usuarios/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(usuarioAtualizado)
        });

        // Verifica se a resposta da requisição não foi bem-sucedida
        if (!response.ok) {
            // Lê o corpo da resposta negativa como texto para obter a mensagem de erro enviada pelo backend
            const errorMessage = await response.text();
            // Loga o texto do erro no console
            throw new Error(errorMessage);
        }

        // Converte a resposta para JSON e loga os dados atualizados
        const updatedUser = await response.json();
        console.log('Usuário atualizado:', updatedUser);

        // Alerta o sucesso e redireciona para a tela anterior
        alert('Dados salvos com sucesso!');
        window.location.href = 'manager.html';
    } catch (error) {
        // Loga qualquer erro ocorrido durante o processo
        console.error('Erro ao salvar dados:', error);
        alert('Erro ao salvar dados do usuário. Tente novamente. Detalhes: ' + error.message);
    }
}

// Função para redirecionar para a página anterior
function cancelEdit() {
    window.location.href = 'manager.html';
}