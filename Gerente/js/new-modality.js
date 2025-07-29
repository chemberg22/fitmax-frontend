// Função para alternar a visibilidade do campo "Capacidade Máxima"
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

// Função para criar uma nova modalidade
async function saveNewModality() {
    // Captura os dados do formulário
    const nome = document.getElementById('nome').value.trim();
    const descricao = document.getElementById('descricao').value.trim();
    const status = document.getElementById('status').value.toLowerCase();
    const agendamentosMultiplos = document.getElementById('agendamentos_multiplos').value === 'true';
    const capacidadeMaxima = agendamentosMultiplos ? parseInt(document.getElementById('capacidade_maxima').value) : null;

    // Valida os campos obrigatórios
    if (!nome) {
        alert('O campo Nome é obrigatório.');
        return;
    }

    if (!status || !['ativo', 'inativo'].includes(status)) {
        alert('O campo Status é obrigatório.');
        return;
    }

    // Cria o objeto com os novos dados
    const newModalityData = {
        nome: nome,
        descricao: descricao || null,
        status: status,
        agendamentosMultiplos: agendamentosMultiplos,
        capacidadeMaxima: capacidadeMaxima
    };

    // Loga os dados da nova modalidade
    console.log('Dados a serem enviados para o backend:', JSON.stringify(newModalityData, null, 2));

    try {
        // Faz uma requisição POST ao endpoint da API com os dados da nova modalidade
        const response = await fetch('http://localhost:8080/api/modalidades', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newModalityData)
        });

        // Verifica se a resposta da requisição não foi bem-sucedida
        if (!response.ok) {
            // Lê o corpo da resposta negativa como texto para obter a mensagem de erro enviada pelo backend
            const errorMessage = await response.text();
            // Loga o texto do erro no console
            throw new Error(errorMessage);
        }

        // Converte a resposta para JSON e loga os novos dados
        const responseData = await response.json();
        console.log('Modalidade criada:', responseData);

        // Alerta o sucesso e redireciona para a tela anterior
        alert('Modalidade criada com sucesso!');
        window.location.href = 'manager-modalities.html';
    } catch (error) {
        // Loga qualquer erro ocorrido durante o processo
        console.error('Erro ao criar modalidade:', error);
        alert('Erro ao criar nova modalidade: ' + error.message);
    }
}

// Função para redirecionar para a página anterior
function cancelEdit() {
    window.location.href = 'manager-modalities.html';
}