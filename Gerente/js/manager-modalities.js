// Função para buscar e exibir modalidades por ID
async function fetchModality(id) {
    try {
        // Faz uma requisição GET para buscar os dados de uma modalidade pelo ID
        const response = await fetch(`http://localhost:8080/api/modalidades/${id}`);

        // Verifica se a resposta foi bem-sucedida, se não, loga o código do status do erro
        if (!response.ok) {
            throw new Error('Erro ao buscar modalidade: ' + response.status);
        }

        // Converte o retorno para JSON
        return response.json();
    } catch (error) {
        // Loga qualquer erro ocorrido durante o processo
        console.error('Erro ao buscar modalidade:', error);
        throw error;
    }
}

// Função para alternar o status da modalidade (ativo ou inativo) e atualizar a visualização
async function toggleStatus(id, currentStatus, row) {
    try {
        // Define o novo status com base no status atual
        const novoStatus = currentStatus.toLowerCase() === 'ativo' ? 'inativo' : 'ativo';
        console.log(`Alterando status da modalidade ${id} de ${currentStatus} para ${novoStatus}`);

        // Busca e loga os dados atuais da modalidade no backend
        const modality = await fetchModality(id);
        console.log('Modalidade antes da atualização:', modality);

        // Verifica se há agendamentos pendentes
        if (novoStatus === 'inativo') {
            const response = await fetch(`http://localhost:8080/api/agendamentos/modalidade/${id}/possui-agendamentos-pendentes`);
            const possuiPendentes = await response.json();

            if (possuiPendentes) {
                alert("Esta modalidade não pode ser inativada pois possui agendamentos pendentes.");
                return;
            }
        }

        // Altera o campo "status" do objeto da modalidade localmente
        modality.status = novoStatus;
        console.log('Objeto modalidade atualizado antes de enviar:', modality);

        // Faz uma requisição PUT para atualizar os dados da modalidade pelo ID
        const response = await fetch(`http://localhost:8080/api/modalidades/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(modality)
        });

        // Verifica se a resposta foi bem-sucedida, se não, loga o código do status do erro
        if (!response.ok) {
            throw new Error('Erro ao atualizar status: ' + response.status);
        }

        // Se a atualização foi bem-sucedida, extrai o JSON da modalidade atualizada
        const updatedModality = await response.json();
        console.log('Modalidade após atualização:', updatedModality);

        // Atualiza a célula de status na linha da tabela com o novo badge de status
        row.cells[2].innerHTML = getStatusBadge(updatedModality.status);
        // Atualiza os botões da célula de ações com o novo texto e comportamento
        const actionCell = row.cells[3];
        const action = novoStatus === 'ativo' ? 'inativar' : 'ativar'; // Define o texto do botão conforme o novo status
        actionCell.innerHTML = `
            <button class="edit-button" onclick="window.location.href='edit-modality.html?id=${updatedModality.id}'">Editar</button>
            <button class="delete-button" data-action="${action}" onclick="toggleStatus(${updatedModality.id}, '${updatedModality.status}', this.parentElement.parentElement)">
                ${action.charAt(0).toUpperCase() + action.slice(1)}
            </button>
            `
            // <button class="excluir-button" onclick="deleteModality(${updatedModality.id}, this.parentElement.parentElement)">Excluir</button>
        ;
        // Loga e exibe um alerta confirmando o novo status da modalidade
        console.log(`Modalidade ${updatedModality.nome} atualizada para status: ${updatedModality.status}`);
        alert(`Modalidade atualizada para status: ${updatedModality.status}`);
    } catch (error) {
        // Loga qualquer erro ocorrido durante o processo
        console.error('Erro ao alternar status:', error);
        alert('Não foi possível atualizar o status da modalidade. Detalhes: ' + error.message);
    }
}

// Função para retornar um badge estilizado baseado no status da modalidade
function getStatusBadge(status) {
    // Verifica e trata dados malformados
    if (!status || typeof status !== 'string') {
        console.warn(`Status inválido: ${status}`); // Loga dados malformados
        return '<span class="badge">Desconhecido</span>';
    }

    // Estiliza de acordo com o case
    switch (status.toLowerCase()) {
        case 'ativo':
            return '<span class="badge active">Ativo</span>';
        case 'inativo':
            return '<span class="badge inactive">Inativo</span>';
        default:
            console.warn(`Status desconhecido: ${status}`); // Loga o status fora dos esperados
            return '<span class="badge">Desconhecido</span>';
    }
}

// Função para excluir uma modalidade
async function deleteModality(id, row) {
    // Verifica a confirmação da ação
    if (!confirm('Tem certeza que deseja excluir esta modalidade?')) {
        return;
    }

    try {
        // Loga o início da requisição ao backend
        console.log(`Deletando modalidade com ID ${id}`);
        // Faz uma requisição DELETE ao endpoint da API com o ID da modalidade
        const response = await fetch(`http://localhost:8080/api/modalidades/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // Verifica se a resposta foi bem-sucedida, se não, loga o código do status do erro
        if (!response.ok) {
            throw new Error('Erro ao excluir modalidade: ' + response.status);
        }

        row.remove(); // Remove a linha da tabela referente a modalidade
        alert('Modalidade excluída com sucesso!');
    } catch (error) {
        // Loga qualquer erro ocorrido durante o processo
        console.error('Erro ao excluir modalidade:', error);
        alert('Não foi possível excluir a modalidade. Detalhes: ' + error.message);
    }
}

// Função para buscar todos os usuários da API e implementar na tabela
function loadModalities(statusFilter = 'todos', searchTerm = '') {
    // Faz uma requisição GET ao endpoint modalidades da API
    fetch('http://localhost:8080/api/modalidades')
        .then(response => {
            // Loga o retorno e verifica se a resposta foi bem-sucedida, se não, loga o código do status do erro
            console.log('Resposta da requisição de modalidades:', response);
            if (!response.ok) throw new Error('Erro ao carregar modalidades: ' + response.status);
            // Converte o retorno para JSON
            return response.json();
        })
        .then(modalities => {
            // Loga as modalidades recebidas
            console.log('Modalidades recebidas:', modalities);
            // Seleciona o corpo da tabela de usuários no HTML
            const tbody = document.getElementById('modality-table-body');
            tbody.innerHTML = ''; // Limpa o conteúdo atual da tabela

            // Aplica o filtro sobre a lista de modalidades
            const filteredModalities = modalities.filter(modality => {
                // Garante que o status da modalidade esteja em minúsculo (evita erro se for indefinido)
                const modalityStatus = modality.status && typeof modality.status === 'string' ? modality.status.toLowerCase() : '';
                // Verifica se o status corresponde ao filtro
                const matchesStatus = statusFilter === 'todos' || modalityStatus === statusFilter.toLowerCase();
                // Verifica se o nome completo da modalidade contém o termo de busca
                const matchesName = modality.nome && typeof modality.nome === 'string'
                    ? modality.nome.toLowerCase().includes(searchTerm.toLowerCase())
                    : false;
                    // A modalidade só será incluída se passar em todos os filtros
                return matchesStatus && matchesName;
            });

            // Loga as modalidades após aplicação dos filtros
            console.log('Modalidades filtradas:', filteredModalities);

            // Para cada modalidade filtrada, cria uma nova linha na tabela
            filteredModalities.forEach(modality => {
                const tr = document.createElement('tr');
                // Define a ação com base no status atual (ativo ou inativo)
                const action = modality.status.toLowerCase() === 'ativo' ? 'inativar' : 'ativar';
                // Monta o conteúdo HTML da linha com os dados da modalidade e botões de ação
                tr.innerHTML = `
                    <td>${modality.nome || 'Nome não disponível'}</td>
                    <td>${modality.descricao || '-'}</td>
                    <td>${getStatusBadge(modality.status)}</td>
                    <td>
                        <button class="edit-button" onclick="window.location.href='edit-modality.html?id=${modality.id}'">Editar</button>
                        <button class="delete-button" data-action="${action}" onclick="toggleStatus(${modality.id}, '${modality.status}', this.parentElement.parentElement)">
                            ${action.charAt(0).toUpperCase() + action.slice(1)}
                        </button>
                        </td>
                        `
                        // <button class="excluir-button" onclick="deleteModality(${modality.id}, this.parentElement.parentElement)">Excluir</button>
                    
                ;
                // Adiciona a nova linha à tabela
                tbody.appendChild(tr);
            });
            // Verifica se há modalidades correspondentes aos filtros, se não, mostra uma linha de "Nenhuma modalidade encontrada"
            if (filteredModalities.length === 0) {
                tbody.innerHTML = '<tr><td colspan="4">Nenhuma modalidade encontrada.</td></tr>';
            }
        })
        .catch(error => {
            // Loga qualquer erro ocorrido durante o processo
            console.error('Erro ao carregar modalidades:', error);
            alert('Não foi possível carregar as modalidades. Verifique se o backend está rodando. Detalhes: ' + error.message);
        });
}