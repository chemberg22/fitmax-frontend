// Função para criar uma nova unidade
async function saveNewUnit() {
    // Captura os dados do formulário
    const nome = document.getElementById('nome').value.trim();
    const endereco = document.getElementById('endereco').value.trim();
    const status = document.getElementById('status').value.toLowerCase();

    // Valida os campos obrigatórios
    if (!nome) {
        alert('O campo Nome é obrigatório.');
        return;
    }

    if (!endereco) {
        alert('O campo Endereço é obrigatório.');
        return;
    }

    if (!status || !['ativo', 'inativo'].includes(status)) {
        alert('O campo Status é obrigatório.');
        return;
    }

    // Cria o objeto com os novos dados
    const newUnitData = {
        nome: nome,
        endereco: endereco,
        status: status
    };

    // Loga os dados da nova unidade
    console.log('Dados a serem enviados para o backend:', JSON.stringify(newUnitData, null, 2));

    try {
        // Faz uma requisição POST ao endpoint da API com os dados da nova unidade
        const response = await fetch('http://localhost:8080/api/unidades', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newUnitData)
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
        console.log('Unidade criada:', responseData);

        // Alerta o sucesso e redireciona para a tela anterior
        alert('Unidade criada com sucesso!');
        window.location.href = 'manager-units.html';
    } catch (error) {
        // Loga qualquer erro ocorrido durante o processo
        console.error('Erro ao criar unidade:', error);
        alert('Erro ao criar nova unidade: ' + error.message);
    }
}

// Função para redirecionar para a página anterior
function cancelEdit() {
    window.location.href = 'manager-units.html';
}