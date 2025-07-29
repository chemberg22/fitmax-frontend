// Função para carregar unidades disponíveis para o filtro de unidades
async function loadUnidades() {
    try {
        // Faz uma requisição GET ao endpoint unidades da API
        const response = await fetch('http://localhost:8080/api/unidades');

        // Verifica se a resposta foi bem-sucedida, se não, loga o código do status do erro
        if (!response.ok) {
            throw new Error('Erro ao carregar unidades: ' + response.status);
        }

        // Converte a resposta para JSON e loga os dados recebidos
        const unidades = await response.json();
        console.log('Unidades recebidas:', unidades);

        // Obtém o elemento select responsável pelo filtro de unidade
        const unidadeFilter = document.getElementById('unidade-filter');
        // Adiciona a opção padrão "Todas" no início do select
        unidadeFilter.innerHTML = '<option value="">Todas</option>';

        // Itera sobre cada unidade recebida e cria uma opção no select
        unidades.forEach(unidade => {
            const option = document.createElement('option'); // Cria o elemento <option>
            option.value = unidade.id; // Define o valor da opção com o ID da unidade
            option.textContent = unidade.nome; // Define o texto visível com o nome da unidade
            unidadeFilter.appendChild(option); // Adiciona a opção ao select
        });
    } catch (error) {
        // Loga qualquer erro ocorrido durante o processo
        console.error('Erro ao carregar unidades:', error);
        alert('Erro ao carregar unidades: ' + error.message);
    }
}

// Função para carregar personals disponíveis por unidade
async function loadPersonals(unidadeId = '') {
    try {
        // Faz uma requisição GET ao endpoint usuários da API
        const response = await fetch('http://localhost:8080/api/usuarios');
        
        // Verifica se a resposta foi bem-sucedida, se não, loga o código do status do erro
        if (!response.ok) {
            throw new Error('Erro ao carregar personals: ' + response.status);
        }

        // Converte a resposta para JSON e loga os dados recebidos
        const users = await response.json();

        // Filtra apenas usuários com perfil de personal por unidade (se a unidade for recebida)
        const personals = users.filter(user => 
            user.perfil && 
            user.perfil.toLowerCase() === 'personal' && 
            (!unidadeId || (user.unidade && user.unidade.id === parseInt(unidadeId)))
        );
        // Loga os personals recebidos pós filtro
        console.log('Personals recebidos:', personals);

        // Referencia o elemento HTML do filtro de personals
        const personalFilter = document.getElementById('personal-filter');
        // Inicializa o select com a opção padrão "Todos"
        personalFilter.innerHTML = '<option value="">Todos</option>';
        // Itera sobre os personais filtrados e adiciona cada um como uma opção no select
        personals.forEach(personal => {
            const option = document.createElement('option'); // Cria o elemento <option>
            option.value = personal.id; // Define o valor da opção com o ID do personal
            option.textContent = personal.nomeCompleto; // Define o texto visível com o nome do personal
            personalFilter.appendChild(option); // Adiciona a opção no select
        });
    } catch (error) {
        // Loga qualquer erro ocorrido durante o processo
        console.error('Erro ao carregar personals:', error);
        alert('Erro ao carregar personals: ' + error.message);
    }
}

// Função para atualizar personals e agendamentos quando o filtro de unidade muda
async function updatePersonalsAndAppointments() {
    // Adiciona ouvinte no filtro de unidade
    const unidadeId = document.getElementById('unidade-filter').value;

    // Atualiza filtro de personals
    await loadPersonals(unidadeId);

    // Recarrega os agendamentos
    await fetchAppointments();
}

// Função para buscar os agendamentos do aluno
async function fetchAppointments() {
    // Recupera o email do usuário armazenado no localStorage
    const userEmail = localStorage.getItem('userEmail');

    // Verifica se o email existe, se não, loga o erro redireciona para a página de login
    if (!userEmail) {
        console.log('Nenhum email encontrado no localStorage');
        alert('Usuário não está logado. Faça login novamente.');
        window.location.href = '../Login/index.html';
        return;
    }

    try {
        // Faz uma requisição GET ao endpoint da API com o email
        const userResponse = await fetch(`http://localhost:8080/api/auth/user?email=${encodeURIComponent(userEmail)}`);
        
        // Verifica se a resposta foi bem-sucedida, se não, loga o código do status do erro
        if (!userResponse.ok) {
            throw new Error('Erro ao buscar dados do usuário: ' + userResponse.status);
        }

        // Converte a resposta para JSON, busca o ID do aluno e loga os dados recebidos
        const userData = await userResponse.json();
        const alunoId = userData.id;
        console.log('ID do aluno:', alunoId);

        // Obtém e loga os valores dos filtros aplicados
        const unidadeId = document.getElementById('unidade-filter').value;
        const statusFilter = document.getElementById('status-filter').value;
        const personalFilter = document.getElementById('personal-filter').value;
        console.log('Filtro de status selecionado:', statusFilter);

        // Mapeia os valores do filtro de status do frontend para os usados no backend
        const statusMap = {
            'Reservado': ['em_aberto', 'reservado'],
            'reservado': ['em_aberto', 'reservado'],
            'Concluído': ['concluido'],
            'concluido': ['concluido']
        };
        const backendStatuses = statusMap[statusFilter] || [];

        // Monta a URL com intervalo do ano inteiro, e adiciona filtros se necessário
        const currentYear = new Date().getFullYear();
        let url = `http://localhost:8080/api/agendamentos?dataInicio=${currentYear}-01-01&dataFim=${currentYear}-12-31`;
        if (unidadeId) {
            url += `&unidadeId=${encodeURIComponent(unidadeId)}`;
        }
        if (personalFilter) {
            url += `&personalId=${encodeURIComponent(personalFilter)}`;
        }
        console.log('URL da requisição de agendamentos:', url);

        // Faz uma requisição GET ao endpoint da API com a URL montada
        const response = await fetch(url);

        // Verifica se a resposta foi bem-sucedida, se não, loga o código do status do erro
        if (!response.ok) {
            throw new Error('Erro ao carregar agendamentos: ' + response.status);
        }

        // Converte a resposta para JSON e loga os dados recebidos
        let agendamentos = await response.json();
        console.log('Agendamentos recebidos:', agendamentos);

        // Loga os status dos agendamentos recebidos
        console.log('Status dos agendamentos:', agendamentos.map(a => ({ id: a.id, status: a.status })));

        // Filtra apenas os agendamentos em que o aluno logado está vinculado
        agendamentos = agendamentos.filter(a => 
            a.alunos && Array.isArray(a.alunos) && a.alunos.some(aluno => aluno.alunoId === alunoId)
        );
        console.log('Agendamentos filtrados pelo aluno:', agendamentos);

        // Aplica filtro adicional por status, se houver
        if (backendStatuses.length > 0) {
            agendamentos = agendamentos.filter(a => backendStatuses.includes(a.status.toLowerCase()));
        }
        console.log('Agendamentos após filtro de status:', agendamentos.map(a => ({ id: a.id, status: a.status })));

        // Obtém o elemento HTML onde os cards serão exibidos
        const appointmentsList = document.getElementById('appointments-list');
        appointmentsList.innerHTML = '';

        // Se nenhum agendamento for encontrado, exibe mensagem informativa
        if (agendamentos.length === 0) {
            appointmentsList.innerHTML = '<p>Nenhum agendamento encontrado para os filtros selecionados.</p>';
            return;
        }

        // Ordena agendamentos por data e hora
        agendamentos.sort((a, b) => {
            const dateA = new Date(a.data);
            const dateB = new Date(b.data);
            if (dateA.getTime() === dateB.getTime()) {
                const horaA = a.horario.horaInicio || '00:00:00';
                const horaB = b.horario.horaInicio || '00:00:00';
                return horaA.localeCompare(horaB);
            }
            return dateA - dateB;
        });

        // Para cada agendamento, cria um card HTML com os dados formatados
        agendamentos.forEach(agendamento => {
            console.log('Processando agendamento:', agendamento);
            const horarioInicio = formatLocalTime(agendamento.horario?.horaInicio);
            const horarioFim = formatLocalTime(agendamento.horario?.horaFim);
            const data = formatDateToPtBr(agendamento.data);
            const modalidadeNome = agendamento.modalidade?.nome || 'Modalidade não disponível';
            const personalNome = agendamento.personal?.nomeCompleto || 'Personal não disponível';
            const unidadeNome = agendamento.unidade?.nome || 'Unidade não disponível';
            // Traduz status cru para um texto amigável e aplica a classe CSS correspondente
            const statusText = ['em_aberto', 'reservado'].includes(agendamento.status.toLowerCase()) ? 'Reservado' :
                              agendamento.status === 'concluido' ? 'Concluído' : 'Indefinido';
            const statusClass = ['em_aberto', 'reservado'].includes(agendamento.status.toLowerCase()) ? 'status-reservado' :
                               agendamento.status === 'concluido' ? 'status-concluido' : 'status-indefinido';
            // Cria o card com as informações do agendamento
            const classCard = document.createElement('div');
            classCard.classList.add('class-card');
            classCard.innerHTML = `
                <div class="class-time">
                    <p>${horarioInicio} - ${horarioFim}</p>
                    <p>${data}</p>
                </div>
                <div class="class-info">
                    <h2>${modalidadeNome}</h2>
                    <p>Personal: ${personalNome}</p>
                    <p class="data-label">Unidade: ${unidadeNome}</p>
                </div>
                <div class="button-container">
                    <a href="workout-details.html?id=${agendamento.id}" class="view-button">Visualizar</a>
                    <span class="status-button ${statusClass}">${statusText}</span>
                </div>
            `;
            // Adiciona o card ao container da página
            appointmentsList.appendChild(classCard);
        });
    } catch (error) {
        // Loga qualquer erro ocorrido durante o processo
        console.error('Erro ao carregar agendamentos:', error);
        const appointmentsList = document.getElementById('appointments-list');
        appointmentsList.innerHTML = '<p class="error-message">Não foi possível carregar os agendamentos.</p>';
    }
}