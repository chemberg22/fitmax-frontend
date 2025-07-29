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
        const actionCell = row.cells[5];
        const action = novoStatus === 'ativo' ? 'inativar' : 'ativar'; // Define o texto do botão conforme o novo status
        actionCell.innerHTML = `
            <button class="edit-button" onclick="window.location.href='edituser.html?id=${updatedUser.id}'">Editar</button>
            <button class="delete-button" data-action="${action}" onclick="toggleStatus(${updatedUser.id}, '${updatedUser.status}', this.parentElement.parentElement)">
                ${action.charAt(0).toUpperCase() + action.slice(1)}
            </button>`
            //<button class="excluir-button" onclick="deleteUser(${updatedUser.id}, this.parentElement.parentElement)">Excluir</button>
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

// Função para retornar um badge estilizado baseado no perfil do usuário
function getRoleBadge(perfil) {
    // Verifica e trata dados malformados
    if (!perfil || typeof perfil !== 'string') {
        console.warn(`Perfil inválido: ${perfil}`); // Loga dados malformados
        return '<span class="badge">Desconhecido</span>';
    }

    // Estiliza de acordo com o case
    switch (perfil.toLowerCase()) {
        case 'aluno':
            return '<span class="badge student">Aluno</span>';
        case 'personal':
            return '<span class="badge teacher">Personal</span>';
        case 'gerente':
            return '<span class="badge admin">Gerente</span>';
        default:
            console.warn(`Perfil desconhecido: ${perfil}`); // Loga o perfil fora dos esperados
            return '<span class="badge">Desconhecido</span>';
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

// Função para buscar as unidades e preencher o filtro de unidades
async function fetchUnidades() {
    try {
        // Faz uma requisição GET ao endpoint de unidades da API
        const response = await fetch('http://localhost:8080/api/unidades');

        // Verifica se a resposta foi bem-sucedida, se não, loga o código do status do erro
        if (!response.ok) {
            throw new Error('Erro ao carregar unidades: ' + response.status);
        }

        // Converte a resposta para JSON e loga os dados recebidos
        const unidades = await response.json();
        console.log('Unidades recebidas:', unidades);

        // Seleciona o elemento <select> do filtro de unidades no HTML para preenchimento
        const unidadeFilter = document.getElementById('unidade-filter');
        // Para cada unidade retornada, cria uma <option> e adiciona ao filtro
        unidades.forEach(unidade => {
            const option = document.createElement('option'); // Cria elemento <option>
            option.value = unidade.nome; // Define o valor da opção como o nome da unidade
            option.textContent = unidade.nome; // Define o texto visível da opção
            unidadeFilter.appendChild(option); // Adiciona a opção ao <select>
        });
    } catch (error) {
        // Loga qualquer erro ocorrido durante o processo
        console.error('Erro ao carregar unidades:', error);
        alert('Erro ao carregar unidades: ' + error.message);
    }
}

// Função para habilitar e desabilitar o filtro de unidade dependendo do perfil selecionado
function handleRoleFilterChange() {
    // Obtém o valor atual selecionado no filtro de perfil e converte para letras minúsculas
    const roleFilter = document.getElementById('role-filter').value.toLowerCase();
    // Referencia ao elemento de filtro de unidade (select)
    const unidadeFilter = document.getElementById('unidade-filter');
    // Verifica se o perfil filtrado é de aluno ou gerente
    if (roleFilter === 'aluno' || roleFilter === 'gerente') {
        unidadeFilter.value = 'todas'; // Define o filtro de unidades como "todas"
        unidadeFilter.disabled = true; // Desabilita o filtro de unidade
    } else {
        unidadeFilter.disabled = false;
    }
    // Atualiza a tabela de usuários com os filtros atuais aplicados
    loadUsers(
        document.getElementById('role-filter').value,
        document.getElementById('status-filter').value,
        document.getElementById('unidade-filter').value,
        document.getElementById('search-input').value
    );
}

// Função para buscar todos os usuários da API, aplicar filtros e implementar na tabela
function loadUsers(filterRole = 'todos', filterStatus = 'ativo', filterUnidade = 'todas', searchTerm = '') {
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
            // Loga os usuários recebidos
            console.log('Usuários recebidos:', users);
            // Seleciona o corpo da tabela de usuários no HTML
            const tbody = document.getElementById('user-table-body');
            tbody.innerHTML = ''; // Limpa o conteúdo atual da tabela

            // Aplica os filtros sobre a lista de usuários
            const filteredUsers = users.filter(user => {
                // Garante que o perfil do usuário esteja em minúsculo (evita erro se for indefinido)
                const userPerfil = user.perfil && typeof user.perfil === 'string' ? user.perfil.toLowerCase() : '';
                // Garante que o status do usuário esteja em minúsculo (evita erro se for indefinido)
                const userStatus = user.status && typeof user.status === 'string' ? user.status.toLowerCase() : '';
                // Obtém o nome da unidade do usuário caso existe
                const userUnidade = user.unidade && user.unidade.nome ? user.unidade.nome : '';
                // Verifica se o perfil corresponde ao filtro ou se o filtro está definido como "todos"
                const matchesRole = filterRole === 'todos' || userPerfil === filterRole.toLowerCase();
                // Verifica se o status corresponde ao filtro
                const matchesStatus = userStatus === filterStatus.toLowerCase();
                // Verifica se a unidade corresponde ao filtro ou se filtro está em "todas"
                const matchesUnidade = filterUnidade === 'todas' || (userPerfil === 'personal' && userUnidade === filterUnidade);
                // Verifica se o nome completo do usuário contém o termo de busca
                const matchesName = user.nomeCompleto && typeof user.nomeCompleto === 'string'
                    ? user.nomeCompleto.toLowerCase().includes(searchTerm.toLowerCase())
                    : false;
                // O usuário só será incluído se passar em todos os filtros
                return matchesRole && matchesStatus && matchesUnidade && matchesName;
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
                    <td>${getRoleBadge(user.perfil)}</td>
                    <td>${getStatusBadge(user.status)}</td>
                    <td>${user.plano || '-'}</td>
                    <td>${user.perfil === 'personal' && user.unidade && user.unidade.nome ? user.unidade.nome : '-'}</td>
                    <td>
                        <button class="edit-button" onclick="window.location.href='edituser.html?id=${user.id}'">Editar</button>
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
                tbody.innerHTML = '<tr><td colspan="6">Nenhum usuário encontrado.</td></tr>';
            }
        })
        .catch(error => {
            // Loga qualquer erro ocorrido durante o processo
            console.error('Erro:', error);
            alert('Não foi possível carregar os usuários. Verifique se o backend está rodando. Detalhes: ' + error.message);
        });
}