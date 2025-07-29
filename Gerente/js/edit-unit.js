// Função para obter o ID da unidade via URL
function getUnitIdFromUrl() {
    // Cria um objeto que facilita a manipulação dos parâmetros da URL
    const urlParams = new URLSearchParams(window.location.search);
    // Retorna o valor do parâmetro ID da URL
    return urlParams.get('id');
}

// Função para buscar e exibir os dados da unidade a ser editada
async function fetchUnitData() {
    // Obtém e loga o ID da unidade da URL
    const unitId = getUnitIdFromUrl();
    console.log('ID da unidade a ser editada:', unitId);

    // Verifica se o ID foi encontrado na URL, se não, redireciona para a página anterior
    if (!unitId) {
        alert('ID de unidade não encontrado. Retornando à página de cadastros.');
        window.location.href = 'manager-units.html';
        return;
    }

    // Loga o início da requisição ao backend
    console.log('Fazendo requisição para buscar dados da unidade...');
    try {
        // Faz uma requisição GET ao endpoint da API com o ID da unidade
        const response = await fetch(`http://localhost:8080/api/unidades/${unitId}`);

        // Verifica se a resposta foi bem-sucedida, se não, loga o código do status do erro
        if (!response.ok) {
            throw new Error('Erro ao buscar dados da unidade: ' + response.status);
        }

        // Converte a resposta para JSON e loga os dados recebidos
        const unitData = await response.json();
        console.log('Dados da unidade editada recebidos:', unitData);

        // Seleciona os campos do formulário HTML onde os dados serão inseridos
        const nomeElement = document.getElementById('nome');
        const enderecoElement = document.getElementById('endereco');
        const statusElement = document.getElementById('status');

        // Verifica se todos os campos foram encontrados no DOM
        if (nomeElement && enderecoElement && statusElement) {
            // Preenche os campos do formulário com os dados da modalidade
            nomeElement.value = unitData.nome || '';
            enderecoElement.value = unitData.endereco || '';
            statusElement.value = unitData.status || 'ativo';
        } else {
            // Loga um erro se os elementos não foram encontrados
            console.error('Alguns elementos não foram encontrados no DOM');
        }
    } catch (error) {
        // Loga qualquer erro ocorrido durante o processo e redireciona para a página anterior
        console.error('Erro ao carregar dados da unidade:', error);
        alert('Erro ao carregar dados da unidade. Retornando à página de cadastros.');
        window.location.href = 'manager-units.html';
    }
}


// Função para salvar os dados editados da modalidade
async function saveUnitData() {
    // Obtém o ID da unidade via URL
    const unitId = getUnitIdFromUrl();

    // Verifica se o ID foi encontrado na URL, se não, redireciona para a página anterior
    if (!unitId) {
        alert('ID de unidade não encontrado. Retornando à página de cadastros.');
        window.location.href = 'manager-units.html';
        return;
    }

    // Loga o início da requisição ao backend
    console.log('Buscando dados atuais da unidade antes de atualizar...');
    try {
        // Faz uma requisição GET ao endpoint da API com o ID da unidade
        const response = await fetch(`http://localhost:8080/api/unidades/${unitId}`);

        // Verifica se a resposta foi bem-sucedida, se não, lança erro com o status
        if (!response.ok) {
            throw new Error('Erro ao buscar dados atuais da unidade: ' + response.status);
        }

        // Converte a resposta para JSON e loga os dados recebidos
        const unitData = await response.json();
        console.log('Dados atuais da unidade:', unitData);

        // Atualiza os campos do objeto com os valores do formulário
        unitData.nome = document.getElementById('nome').value.trim();
        unitData.endereco = document.getElementById('endereco').value.trim();
        unitData.status = document.getElementById('status').value;

        // Valida campos obrigatórios
        if (!unitData.nome) {
            alert('O campo Nome é obrigatório.');
            return;
        }
        if (!unitData.endereco) {
            alert('O campo Endereço é obrigatório.');
            return;
        }
        if (!unitData.status) {
            alert('O campo Status é obrigatório.');
            return;
        }

        // Loga os dados editados da unidade
        console.log('Dados a serem enviados para o backend:', unitData);

        // Faz uma requisição PUT ao endpoint da API com os dados da unidade atualizada
        const updateResponse = await fetch(`http://localhost:8080/api/unidades/${unitId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(unitData)
        });

        // Verifica se a resposta foi bem-sucedida, se não, lança erro detalhado
        if (!updateResponse.ok) {
            const errorText = await updateResponse.text();
            throw new Error('Erro ao salvar dados da unidade: ' + updateResponse.status + ' - ' + errorText);
        }

        // Alerta o sucesso e redireciona para a tela anterior
        alert('Dados salvos com sucesso!');
        window.location.href = 'manager-units.html';
    } catch (error) {
        // Loga qualquer erro ocorrido durante o processo
        console.error('Erro ao salvar dados:', error);
        alert('Erro ao salvar dados da unidade. Tente novamente. Detalhes: ' + error.message);
    }
}

// Função para redirecionar para a página anterior
function cancelEdit() {
    window.location.href = 'manager-units.html';
}