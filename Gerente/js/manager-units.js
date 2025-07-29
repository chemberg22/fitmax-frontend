// Função para buscar e exibir unidades por ID
async function fetchUnit(id) {
    try {
        // Faz uma requisição GET para buscar os dados de uma unidade pelo ID
        const response = await fetch(`http://localhost:8080/api/unidades/${id}`);

        // Verifica se a resposta foi bem-sucedida, se não, loga o código do status do erro
        if (!response.ok) {
            throw new Error('Erro ao buscar unidade: ' + response.status);
        }

        // Converte o retorno para JSON
        return response.json();
    } catch (error) {
        // Loga qualquer erro ocorrido durante o processo
        console.error('Erro ao buscar unidade:', error);
        throw error;
    }
}

// Função para alternar o status (Ativar/Inativar)
async function toggleStatus(id, currentStatus, row) {
    try {
        // Define o novo status com base no status atual
        const novoStatus = currentStatus.toLowerCase() === 'ativo' ? 'inativo' : 'ativo';
        console.log(`Alterando status da unidade ${id} de ${currentStatus} para ${novoStatus}`);

        // Busca e loga os dados atuais da unidade no backend
        const unit = await fetchUnit(id);
        console.log('Unidade antes da atualização:', unit);

        if (novoStatus === 'inativo') {
            const response = await fetch(`http://localhost:8080/api/usuarios/unidade/${id}/possui-personal-ativo`);
            const possuiPersonalAtivo = await response.json();

            if (possuiPersonalAtivo) {
                alert("Esta unidade não pode ser inativada pois possui personals ativos.");
                return;
            }
        }

        // Altera o campo "status" do objeto da unidade localmente
        unit.status = novoStatus;
        console.log('Objeto modalidade atualizado antes de enviar:', unit);

        // Faz uma requisição PUT para atualizar os dados da unidade pelo ID
        const response = await fetch(`http://localhost:8080/api/unidades/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(unit)
        });

        // Verifica se a resposta foi bem-sucedida, se não, loga o código do status do erro
        if (!response.ok) {
            throw new Error('Erro ao atualizar status: ' + response.status);
        }

        // Se a atualização foi bem-sucedida, extrai o JSON da unidade atualizada
        const updatedUnit = await response.json();
        console.log('Unidade após atualização:', updatedUnit);

        // Atualiza a célula de status na linha da tabela com o novo badge de status
        row.cells[2].innerHTML = getStatusBadge(updatedUnit.status);
        // Atualiza os botões da célula de ações com o novo texto e comportamento
        const actionCell = row.cells[3];
        const action = novoStatus === 'ativo' ? 'inativar' : 'ativar'; // Define o texto do botão conforme o novo status
        actionCell.innerHTML = `
            <button class="edit-button" onclick="window.location.href='edit-unit.html?id=${updatedUnit.id}'">Editar</button>
            <button class="delete-button" data-action="${action}" onclick="toggleStatus(${updatedUnit.id}, '${updatedUnit.status}', this.parentElement.parentElement)">
                ${action.charAt(0).toUpperCase() + action.slice(1)}
            </button>
            `
            // <button class="excluir-button" onclick="deleteUnit(${updatedUnit.id}, this.parentElement.parentElement)">Excluir</button>
        ;
        // Loga e exibe um alerta confirmando o novo status da unidade
        console.log(`Unidade ${updatedUnit.nome} atualizada para status: ${updatedUnit.status}`);
        alert(`Unidade atualizada para status: ${updatedUnit.status}`);
    } catch (error) {
        // Loga qualquer erro ocorrido durante o processo
        console.error('Erro ao alternar status:', error);
        alert('Não foi possível atualizar o status da unidade. Detalhes: ' + error.message);
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

// Função para excluir uma unidade
async function deleteUnit(id, row) {
    // Verifica a confirmação da ação
    if (!confirm('Tem certeza que deseja excluir esta unidade?')) {
        return;
    }

    try {
        // Loga o início da requisição ao backend
        console.log(`Deletando unidade com ID ${id}`);
        // Faz uma requisição DELETE ao endpoint da API com o ID da unidade
        const response = await fetch(`http://localhost:8080/api/unidades/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // Verifica se a resposta foi bem-sucedida, se não, loga o código do status do erro
        if (!response.ok) {
            throw new Error('Erro ao excluir unidade: ' + response.status);
        }

        row.remove(); // Remove a linha da tabela referente a modalidade
        alert('Unidade excluída com sucesso!');
    } catch (error) {
        // Loga qualquer erro ocorrido durante o processo
        console.error('Erro ao excluir unidade:', error);
        alert('Não foi possível excluir a unidade. Detalhes: ' + error.message);
    }
}

// Função para carregar unidades
function loadUnits() {
    // Faz uma requisição GET ao endpoint modalidades da API
    fetch('http://localhost:8080/api/unidades')
        .then(response => {
            // Loga o retorno e verifica se a resposta foi bem-sucedida, se não, loga o código do status do erro
            console.log('Resposta da requisição de unidades:', response);
            if (!response.ok) throw new Error('Erro ao carregar unidades: ' + response.status);
            // Converte o retorno para JSON
            return response.json();
        })
        .then(units => {
            // Loga as unidades recebidas
            console.log('Unidades recebidas:', units);
            // Seleciona o corpo da tabela de usuários no HTML
            const tbody = document.getElementById('unit-table-body');
            tbody.innerHTML = ''; // Limpa o conteúdo atual da tabela

            // Para cada unidade filtrada, cria uma nova linha na tabela
            units.forEach(unit => {
                const tr = document.createElement('tr');
                // Define a ação com base no status atual (ativo ou inativo)
                const action = unit.status.toLowerCase() === 'ativo' ? 'inativar' : 'ativar';
                // Monta o conteúdo HTML da linha com os dados da modalidade e botões de ação
                tr.innerHTML = `
                    <td>${unit.nome || 'Nome não disponível'}</td>
                    <td>${unit.endereco || '-'}</td>
                    <td>${getStatusBadge(unit.status)}</td>
                    <td>
                        <button class="edit-button" onclick="window.location.href='edit-unit.html?id=${unit.id}'">Editar</button>
                        <button class="delete-button" data-action="${action}" onclick="toggleStatus(${unit.id}, '${unit.status}', this.parentElement.parentElement)">
                            ${action.charAt(0).toUpperCase() + action.slice(1)}
                        </button>
                        </td>
                        `
                        // <button class="excluir-button" onclick="deleteUnit(${unit.id}, this.parentElement.parentElement)">Excluir</button>
                    
                ;
                // Adiciona a nova linha à tabela
                tbody.appendChild(tr);
            });

            // Verifica se há unidades cadastradas, se não, mostra uma linha de "Nenhuma unidade encontrada"
            if (units.length === 0) {
                tbody.innerHTML = '<tr><td colspan="4">Nenhuma unidade encontrada.</td></tr>';
            }
        })
        .catch(error => {
            // Loga qualquer erro ocorrido durante o processo
            console.error('Erro ao carregar unidades:', error);
            alert('Não foi possível carregar as unidades. Verifique se o backend está rodando. Detalhes: ' + error.message);
        });
}