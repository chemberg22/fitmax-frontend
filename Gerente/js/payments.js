 // Função para buscar e exibir usuários por ID
async function fetchUser(id) {
    try {
        // Faz uma requisição GET para buscar os dados de um usuário pelo ID
        const response = await fetch(`http://localhost:8080/api/usuarios/${id}`,);

        // Verifica se a resposta foi bem-sucedida, se não, loga o código do status do erro
        if (!response.ok) {
            throw new Error('Erro ao buscar usuário: ' + response.status);
        }

        // Converte o retorno para JSON
        return response.json();
    } catch (error) {
        // Loga qualquer erro ocorrido durante o processo
        console.error('Erro ao buscar modalidade:', error);
        throw error;
    }
}

// Função para alternar o status do usuário (ativo ou inativo) e atualizar a visualização
async function toggleStatus(id, currentStatus, row) {
    try {
        // Define o novo status com base no status atual
        const novoStatus = currentStatus === 'ativo' ? 'inativo' : 'ativo';
        console.log(`Alterando status do usuário ${id} de ${currentStatus} para ${novoStatus}`);

        // Busca e loga os dados atuais do usuário no backend
        const user = await fetchUser(id);
        console.log('Usuário antes da atualização:', user);

        // Verifica se o perfil exige validação de agendamento
        if (novoStatus === 'inativo' && (user.perfil === 'aluno' || user.perfil === 'personal')) {
            const response = await fetch(`http://localhost:8080/api/agendamentos/usuario/${id}/possui-agendamentos-pendentes`);
            const possuiPendentes = await response.json();

            if (possuiPendentes) {
                alert("Este usuário não pode ser inativado pois possui agendamentos pendentes.");
                return;
            }
        }
        
        // Altera o campo "status" do objeto do usuário localmente
        user.status = novoStatus;
        console.log('Objeto usuário atualizado antes de enviar:', user);

        // Faz uma requisição PUT para atualizar os dados do usuário pelo ID
        const response = await fetch(`http://localhost:8080/api/usuarios/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(user)
        });

        // Verifica se a resposta foi bem-sucedida, se não, loga o código do status do erro
        if (!response.ok) {
            throw new Error('Erro ao atualizar status: ' + response.status);
        }

        // Se a atualização foi bem-sucedida, extrai o JSON do usuário atualizado
        const updatedUser = await response.json();
        console.log('Usuário após atualização:', updatedUser);

        // Atualiza a célula de status na linha da tabela com o novo badge de status
        row.cells[2].innerHTML = getStatusBadge(updatedUser.status);
        // Atualiza os botões da célula de ações com o novo texto e comportamento
        const actionCell = row.cells[3];
        const action = novoStatus === 'ativo' ? 'inativar' : 'ativar'; // Define o texto do botão conforme o novo status
        actionCell.innerHTML = `
            <button class="delete-button" data-action="${action}" onclick="toggleStatus(${updatedUser.id}, '${updatedUser.status}', this.parentElement.parentElement)">
                ${action.charAt(0).toUpperCase() + action.slice(1)}
            </button>
            `
            // <button class="excluir-button" onclick="deleteUser(${updatedUser.id}, this.parentElement.parentElement)">Excluir</button>
        ;
        // Loga e exibe um alerta confirmando o novo status do usuário
        console.log(`Usuário ${updatedUser.nomeCompleto} atualizado para status: ${updatedUser.status}`);
        alert(`Usuário atualizado para status: ${updatedUser.status}`);
    } catch (error) {
        // Loga qualquer erro ocorrido durante o processo
        console.error('Erro:', error);
        alert('Não foi possível atualizar o status do usuário. Detalhes: ' + error.message);
    }
}

// Função para retornar um badge estilizado baseado no status do usuário
function getStatusBadge(status) {
    if (!status || typeof status !== 'string') {
        console.warn(`Status inválido: ${status}`); // Loga dados malformados
        return '<span class="badge">Desconhecido</span>';
    }

    switch (status.toLowerCase()) {
        case 'ativo':
            return '<span class="badge active">Ativo</span>';
        case 'inativo':
            return '<span class="badge inactive">Inativo</span>';
        default:
            console.warn(`Status desconhecido: ${status}`);
            return '<span class="badge">Desconhecido</span>';
    }
}
 
// Função para obter o badge de status de pagamento
function getPaymentStatusBadge(paymentStatus) {
    if (!paymentStatus || typeof paymentStatus !== 'string') {
        console.warn(`Status de pagamento inválido: ${paymentStatus}`); // Loga dados malformados
        return '<span class="badge">Desconhecido</span>';
    }

    switch (paymentStatus.toLowerCase()) {
        case 'atrasado':
            return '<span class="badge late">Atrasado</span>';
        case 'em_dia':
            return '<span class="badge uptodate">Em dia</span>';
        case 'adiantado':
            return '<span class="badge upfront">Adiantado</span>';
        default:
            console.warn(`Status de pagamento desconhecido: ${paymentStatus}`);
            return '<span class="badge">Desconhecido</span>';
    }
}

// Função para excluir um usuário
async function deleteUser(id, row) {
    // Verifica a confirmação da ação
    if (!confirm('Tem certeza que deseja excluir este usuário?')) {
        return;
    }

    try {
        // Loga o início da requisição ao backend
        console.log(`Deletando usuário com ID ${id}`);
        // Faz uma requisição DELETE ao endpoint da API com o ID do usuário
        const response = await fetch(`http://localhost:8080/api/usuarios/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // Verifica se a resposta foi bem-sucedida, se não, loga o código do status do erro
        if (!response.ok) {
            throw new Error('Erro ao excluir usuário: ' + response.status);
        }

        row.remove(); // Remove a linha da tabela referente ao usuário
        alert('Usuário excluído com sucesso!');
    } catch (error) {
        // Loga qualquer erro ocorrido durante o processo
        console.error('Erro:', error);
        alert('Não foi possível excluir o usuário. Detalhes: ' + error.message);
    }
}

// Função para buscar todos os usuários da API, aplicar filtros e implementar na tabela
function loadPayments(filterPaymentStatus = 'todos', filterUserStatus = 'ativo', searchTerm = '') {
    // Faz uma requisição GET ao endpoint usuários da API
    fetch('http://localhost:8080/api/usuarios')
        .then(response => {
            // Loga o retorno e verifica se a resposta foi bem-sucedida, se não, loga o código do status do erro
            console.log('Resposta da requisição de usuários:', response);
            if (!response.ok) throw new Error('Erro ao carregar usuários: ' + response.status);
            // Converte o retorno para JSON
            return response.json();
        })
        .then(users => {
            console.log('Usuários recebidos:', users);
            // Loga os usuários recebidos
            const tbody = document.getElementById('payment-table-body');
            // Seleciona o corpo da tabela de usuários no HTML
            tbody.innerHTML = '';  // Limpa o conteúdo atual da tabela

            // Aplica os filtros sobre a lista de alunos
            const filteredUsers = users.filter(user => {
                if (!user.perfil || user.perfil.toLowerCase() !== 'aluno') {
                    return false;
                }
                // Garante que o status do pagamento do usuário esteja em minúsculo (evita erro se for indefinido)
                const paymentStatus = user.pagamento && typeof user.pagamento === 'string' ? user.pagamento.toLowerCase() : '';
                // Verifica se o status do pagamento corresponde ao filtro
                const matchesPaymentStatus = filterPaymentStatus === 'todos' || paymentStatus === filterPaymentStatus.toLowerCase();
                // Garante que o status do usuário esteja em minúsculo (evita erro se for indefinido)
                const userStatus = user.status && typeof user.status === 'string' ? user.status.toLowerCase() : '';
                // Verifica se o status corresponde ao filtro
                const matchesUserStatus = userStatus === filterUserStatus.toLowerCase();
                // Verifica se o nome completo do usuário contém o termo de busca
                const matchesName = user.nomeCompleto && typeof user.nomeCompleto === 'string'
                    ? user.nomeCompleto.toLowerCase().includes(searchTerm.toLowerCase())
                    : false;
                // O usuário só será incluído se passar em todos os filtros
                return matchesPaymentStatus && matchesUserStatus && matchesName;
            });

            // Loga os usuários após aplicação dos filtros
            console.log('Usuários filtrados:', filteredUsers);

            // Para cada usuário filtrado, cria uma nova linha na tabela
            filteredUsers.forEach(user => {
                const tr = document.createElement('tr');
                // Define a ação com base no status atual (ativo ou inativo)
                const action = user.status.toLowerCase() === 'ativo' ? 'inativar' : 'ativar';
                // Monta o conteúdo HTML da linha com os dados do usuário e botões de ação
                tr.innerHTML = `
                    <td>${user.nomeCompleto || 'Nome não disponível'}</td>
                    <td>${getPaymentStatusBadge(user.pagamento)}</td>
                    <td>${getStatusBadge(user.status)}</td>
                    <td>
                        <button class="delete-button" data-action="${action}" onclick="toggleStatus(${user.id}, '${user.status}', this.parentElement.parentElement)">
                            ${action.charAt(0).toUpperCase() + action.slice(1)}
                        </button>
                        </td>
                        `
                        // <button class="excluir-button" onclick="deleteUser(${user.id}, this.parentElement.parentElement)">Excluir</button>
                    
                ;
                // Adiciona a nova linha à tabela
                tbody.appendChild(tr);
            });
            // Verifica se há usuários correspondentes aos filtros, se não, mostra uma linha de "Nenhum usuário encontrado"
            if (filteredUsers.length === 0) {
                tbody.innerHTML = '<tr><td colspan="4">Nenhum usuário encontrado.</td></tr>';
            }
        })
        .catch(error => {
            // Loga qualquer erro ocorrido durante o processo
            console.error('Erro ao carregar pagamentos:', error);
            alert('Não foi possível carregar os pagamentos. Verifique se o backend está rodando. Detalhes: ' + error.message);
        });
}