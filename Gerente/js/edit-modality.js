// Função para obter o ID da modalidade via URL
function getModalityIdFromUrl() {
    // Cria um objeto que facilita a manipulação dos parâmetros da URL
    const urlParams = new URLSearchParams(window.location.search);
    // Retorna o valor do parâmetro ID da URL
    return urlParams.get('id');
}

// Função que alterna a visibilidade dos valores da capacidade máxima
function toggleCapacidadeMaxima() {
    // Obtém o valor do elemento HTML referente aos agendamentos múltiplos
    const agendamentosMultiplos = document.getElementById('agendamentos_multiplos').value;
    // Obtém a referência ao elemento HTML referente ao container dos agendamentos múltiplos
    const capacidadeMaximaContainer = document.getElementById('capacidade_maxima_container');
    // Verifica se a modalidade possui agendamentos múltiplos e mostra a opção de capacidade, se não, esconde a opção
    if (agendamentosMultiplos === 'true') {
        capacidadeMaximaContainer.style.display = 'block';
    } else {
        capacidadeMaximaContainer.style.display = 'none';
    }
}

// Função para buscar e exibir os dados da modalidade a ser editada
async function fetchModalityData() {
    // Obtém e loga o ID da modalidade da URL
    const modalityId = getModalityIdFromUrl();
    console.log('ID da modalidade a ser editada:', modalityId);

    // Verifica se o ID foi encontrado na URL, se não, redireciona para a página anterior
    if (!modalityId) {
        alert('ID de modalidade não encontrado. Retornando à página de cadastros.');
        window.location.href = 'manager-modalities.html';
        return;
    }

    // Loga o início da requisição ao backend
    console.log('Fazendo requisição para buscar dados da modalidade...');
    try {
        // Faz uma requisição GET ao endpoint da API com o ID da modalidade
        const response = await fetch(`http://localhost:8080/api/modalidades/${modalityId}`);

        // Verifica se a resposta foi bem-sucedida, se não, loga o código do status do erro
        if (!response.ok) {
            throw new Error('Erro ao buscar dados da modalidade: ' + response.status);
        }

        // Converte a resposta para JSON e loga os dados recebidos
        const modalityData = await response.json();
        console.log('Dados da modalidade a ser editada recebidos:', modalityData);

        // Seleciona os campos do formulário HTML onde os dados serão inseridos
        const nomeElement = document.getElementById('nome');
        const descricaoElement = document.getElementById('descricao');
        const statusElement = document.getElementById('status');
        const agendamentosElement = document.getElementById('agendamentos_multiplos');
        const capacidadeElement = document.getElementById('capacidade_maxima');

        // Verifica se todos os campos foram encontrados no DOM
        if (nomeElement && descricaoElement && statusElement && agendamentosElement && capacidadeElement) {
            // Preenche os campos do formulário com os dados da modalidade
            nomeElement.value = modalityData.nome || '';
            descricaoElement.value = modalityData.descricao || '';
            statusElement.value = modalityData.status || 'ativo';
            agendamentosElement.value = modalityData.agendamentosMultiplos ? 'true' : 'false';
            capacidadeElement.value = modalityData.capacidadeMaxima != null ? modalityData.capacidadeMaxima : '';
        } else {
            // Loga um erro se os elementos não foram encontrados
            console.error('Alguns elementos não foram encontrados no DOM');
        }

        // Atualiza exibição da capacidade máxima com base no valor preenchido
        toggleCapacidadeMaxima();

    } catch (error) {
        // Loga qualquer erro ocorrido durante o processo e redireciona para a página anterior
        console.error('Erro ao carregar dados da modalidade:', error);
        alert('Erro ao carregar dados da modalidade. Retornando à página de cadastros.');
        window.location.href = 'manager-modalities.html';
    }
}

// Função para salvar os dados editados da modalidade
async function saveModalityData() {
    // Obtém o ID da modalidade via URL
    const modalityId = getModalityIdFromUrl();

    // Verifica se o ID foi encontrado na URL, se não, redireciona para a página anterior
    if (!modalityId) {
        alert('ID de modalidade não encontrado. Retornando à página de modalidades.');
        window.location.href = 'manager-modalities.html';
        return;
    }

    // Loga o início da requisição ao backend
    console.log('Buscando dados atuais da modalidade antes de atualizar...');
    try {
        // Faz uma requisição GET ao endpoint da API com o ID da modalidade
        const response = await fetch(`http://localhost:8080/api/modalidades/${modalityId}`);

        // Verifica se a resposta foi bem-sucedida, se não, loga o código do status do erro
        if (!response.ok) {
            throw new Error('Erro ao buscar dados atuais da modalidade: ' + response.status);
        }

        // Converte a resposta para JSON e loga os dados recebidos
        const modalityData = await response.json();
        console.log('Dados atuais da modalidade:', modalityData);

        // Atualiza os campos do objeto com os valores do formulário
        modalityData.nome = document.getElementById('nome').value;
        modalityData.descricao = document.getElementById('descricao').value;
        modalityData.status = document.getElementById('status').value;
        modalityData.agendamentosMultiplos = document.getElementById('agendamentos_multiplos').value === 'true';
        
        // Verifica se a modalidade suporta agendamentos múltiplos, se não, seta como null
        if (modalityData.agendamentosMultiplos) {
            modalityData.capacidadeMaxima = parseInt(document.getElementById('capacidade_maxima').value);
        } else {
            modalityData.capacidadeMaxima = null;
        }

        // Loga os dados editados da modalidade
        console.log('Dados a serem enviados para o backend:', modalityData);

        // Faz uma requisição PUT ao endpoint da API com os dados da modalidade atualizada
        const updateResponse = await fetch(`http://localhost:8080/api/modalidades/${modalityId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(modalityData)
        });

        // Verifica se a resposta foi bem-sucedida, se não, loga o código do status do erro
        if (!updateResponse.ok) {
            throw new Error('Erro ao salvar dados da modalidade: ' + updateResponse.status);
        }

        // Alerta o sucesso e redireciona para a tela anterior
        alert('Dados salvos com sucesso!');
        window.location.href = 'manager-modalities.html';
    } catch (error) {
        // Loga qualquer erro ocorrido durante o processo
        console.error('Erro ao salvar dados:', error);
        alert('Erro ao salvar dados da modalidade. Tente novamente.');
    }
}

// Função para redirecionar para a página anterior
function cancelEdit() {
    window.location.href = 'manager-modalities.html';
}