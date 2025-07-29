// Função para determinar o texto e estilizar o badge de status
function getStatusBadge(agendamento) {
    // Loga informações úteis do agendamento
    console.log('Depurando getStatusBadge:', {
        id: agendamento.id,
        status: agendamento.status,
        numAlunos: agendamento.alunos ? agendamento.alunos.length : 0,
        modalidadeMultipla: agendamento.modalidade?.agendamentosMultiplos,
        capacidadeMaxima: agendamento.modalidade?.capacidadeMaxima,
        alunos: agendamento.alunos
    });

    // Obtém o número de alunos vinculados
    const numAlunos = agendamento.alunos ? agendamento.alunos.length : 0;
    // Verifica se a modalidade permite agendamentos múltiplos
    const modalidadeMultipla = agendamento.modalidade?.agendamentosMultiplos ?? false;
    // Verifica a capacidade máxima da modalidade
    const capacidadeMaxima = agendamento.modalidade?.capacidadeMaxima ?? 1;

    // Caso o agendamento esteja com status concluído
    if (agendamento.status === 'concluido') {
        return { text: 'concluido', displayText: 'Concluído', class: 'status-concluido' }; // Valor interno, texto visível e classe do badge
    }
    // Caso o agendamento esteja com status em aberto e não tenha alunos vinculados
    if (agendamento.status === 'em_aberto' && numAlunos === 0) {
        return { text: 'em_aberto', displayText: 'Em aberto', class: 'status-em-aberto' }; // Valor interno, texto visível e classe do badge
    }
    // Caso o agendamento esteja com status em aberto, modalidade suporte agendamentos múltilos e não esteja cheia
    if (agendamento.status === 'em_aberto' && modalidadeMultipla && numAlunos > 0 && numAlunos < capacidadeMaxima) {
        return { text: 'disponivel', displayText: 'Disponível', class: 'status-disponivel' }; // Valor interno, texto visível e classe do badge
    }
    // Caso o agendamento esteja com status reservado
    return { text: 'reservado', displayText: 'Reservado', class: 'status-reservado' }; // Valor interno, texto visível e classe do badge
}

// Função para obter a data da URL
function getDateFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('date');
}

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

// Função para carregar personais disponíveis por unidade
async function loadPersonals(unidadeId = '') {
    try {
        // Faz uma requisição GET ao endpoint usuários da API
        const response = await fetch('http://localhost:8080/api/usuarios');

        // Verifica se a resposta foi bem-sucedida, se não, loga o código do status do erro
        if (!response.ok) {
            throw new Error('Erro ao carregar personais: ' + response.status);
        }
        // Converte a resposta para JSON e loga os dados recebidos
        const users = await response.json();
        console.log('Personals recebidos: ', users);
        
        // Filtra apenas usuários com perfil de personal por unidade (se a unidade for recebida)
        const personals = users.filter(user => 
            user.perfil &&  // Verifica se o campo perfil existe
            user.perfil.toLowerCase() === 'personal' && // Verifica se o perfil é de personal
            (!unidadeId || (user.unidade && user.unidade.id === parseInt(unidadeId))) // Verifica se a unidade foi recebida e filtra por ela
        );
        // Loga os personals recebidos pós filtro
        console.log('Personais recebidos:', personals);

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
        console.error('Erro ao carregar personais:', error);
        alert('Erro ao carregar personais: ' + error.message);
    }
}

// Função para atualizar personals e agendamentos quando o filtro de unidade muda
async function updatePersonalsAndReservations() {
    // Adiciona ouvinte no filtro de unidade
    const unidadeId = document.getElementById('unidade-filter').value;

    // Atualiza filtro de personals
    await loadPersonals(unidadeId);

    // Recarrega os agendamentos
    await loadReservations();
}

// Função para carregar modalidades disponíveis
async function loadModalidades() {
    try {
        // Faz uma requisição GET ao endpoint de modalidades da API
        const response = await fetch('http://localhost:8080/api/modalidades');

        // Verifica se a resposta foi bem-sucedida, se não, loga o código do status do erro
        if (!response.ok) {
            throw new Error('Erro ao carregar modalidades: ' + response.status);
        }

        // Converte a resposta para JSON e loga os dados recebidos
        const modalidades = await response.json();
        console.log('Modalidades recebidas:', modalidades);

        // Obtém o elemento select responsável pelo filtro de modalidade
        const modalidadeFilter = document.getElementById('modalidade-filter');
        // Adiciona a opção padrão "Todas" no início do select
        modalidadeFilter.innerHTML = '<option value="">Todas</option>';

        // Itera sobre cada unidade recebida e cria uma opção no select
        modalidades.forEach(modalidade => {
            const option = document.createElement('option'); // Cria o elemento <option>
            option.value = modalidade.id; // Define o valor da opção com o ID da modalidade
            option.textContent = modalidade.nome; // Define o texto visível com o nome da modalidade
            modalidadeFilter.appendChild(option); // Adiciona a opção no select
        });
    } catch (error) {
        // Loga qualquer erro ocorrido durante o processo
        console.error('Erro ao carregar modalidades:', error);
        alert('Erro ao carregar modalidades: ' + error.message);
    }
}

// Função para carregar os agendamentos existentes
async function loadReservations() {
    // Busca e loga a data do URL
    const date = getDateFromUrl();
    console.log('Data extraída da URL:', date);

    // Se a data não chegar via URL, mostra mensagem padrão (exceção)
    if (!date) {
        const container = document.getElementById('reservations-container');
        container.innerHTML = '<p class="error-message">Nenhuma data selecionada. Por favor, selecione uma data no calendário.</p>';
        return;
    }

    // Atualiza o título da página com a data formatada
    document.getElementById('page-title').textContent = `Agendamentos do Dia ${formatDateToPtBr(date)}`;

    // Referencia os elementos HTML para obter os valores dos filtros
    const unidadeId = document.getElementById('unidade-filter').value;
    const statusFilter = document.getElementById('status-filter').value;
    const personalFilter = document.getElementById('personal-filter').value;
    const modalidadeId = document.getElementById('modalidade-filter').value;

    try {
        // Monta a URL de requisição para a API com base nos filtros aplicados
        let url = `http://localhost:8080/api/agendamentos?dataInicio=${encodeURIComponent(date)}&dataFim=${encodeURIComponent(date)}`;
        if (unidadeId) {
            url += `&unidadeId=${encodeURIComponent(unidadeId)}`;
        }
        if (personalFilter) {
            url += `&personalId=${encodeURIComponent(personalFilter)}`;
        }
        if (modalidadeId) {
            url += `&modalidadeId=${encodeURIComponent(modalidadeId)}`;
        }

        // Loga os filtros aplicados e o URL montado
        console.log('Filtros aplicados:', { unidadeId, personalFilter, modalidadeId, statusFilter });
        console.log('URL da requisição:', url);

        // Faz uma requisição GET ao endpoint de agendamentos da API com os parâmetros adicionados na URL
        const response = await fetch(url);

        // Verifica se a resposta foi bem-sucedida, se não, loga o código do status do erro
        if (!response.ok) {
            throw new Error('Erro ao carregar agendamentos: ' + response.status);
        }

        // Converte a resposta em JSON e loga os dados
        let agendamentos = await response.json();
            console.log('Agendamentos recebidos:', agendamentos.map(a => ({
                id: a.id,
                modalidadeId: a.modalidade?.id,
                modalidadeNome: a.modalidade?.nome,
                status: a.status,
                numAlunos: a.alunos?.length || 0,
                unidadeId: a.unidade?.id,
                personalId: a.personal?.id
            })));

            // Verifica se a API não está filtrando corretamente por modalidade, caso não, aplica filtro manual. Loga o caminho e a alteração dos dados
            if (modalidadeId) {
                console.log('Verificando filtro de modalidade:', modalidadeId);
                const filteredByModalidade = agendamentos.filter(a => a.modalidade?.id === parseInt(modalidadeId));
                console.log('Agendamentos após validação de modalidade:', filteredByModalidade.length, filteredByModalidade.map(a => a.id));
                if (filteredByModalidade.length !== agendamentos.length) {
                    console.warn('Aviso: Backend pode não estar filtrando modalidadeId corretamente. Aplicando filtro no frontend.');
                    agendamentos = filteredByModalidade;
                }
            }

            // Verifica se o filtro por status está selecionado e o aplica. Loga o caminho e a alteração dos dados
            if (statusFilter) {
                console.log('Aplicando filtro de status:', statusFilter, 'Códigos:', statusFilter.split('').map(c => c.charCodeAt(0)));
                console.log('Antes do filtro de status - agendamentos:', agendamentos.length, agendamentos.map(a => a.id));
                const filteredAgendamentos = agendamentos.filter(a => {
                    const badge = getStatusBadge(a);
                    console.log(`Filtrando agendamento ID ${a.id}: badge=${badge.text}, statusFilter=${statusFilter}, códigos badge=${badge.text.split('').map(c => c.charCodeAt(0))}`);
                    return badge.text === statusFilter;
                });
                console.log('Após o filtro de status - agendamentos:', filteredAgendamentos.length, filteredAgendamentos.map(a => a.id));
                agendamentos = filteredAgendamentos;
            }

            // Referencia o elemento do HTML onde as informações serão exibidas
            const container = document.getElementById('reservations-container');
            container.innerHTML = ''; // Limpa dados anteriores

            // Verifica se há agendamentos para os filtros aplicados
            if (agendamentos.length === 0) {
                container.innerHTML = '<p>Nenhum agendamento encontrado para os filtros selecionados.</p>';
                return;
            }

        // Ordena os agendamentos por horário (cedo > tarde)
        agendamentos.sort((a, b) => {
            const horaA = a.horario.horaInicio || '00:00:00';
            const horaB = b.horario.horaInicio || '00:00:00';
            return horaA.localeCompare(horaB);
        });

        // Para cada agendamento, cria um card com as informações formatadas
        agendamentos.forEach(agendamento => {
            const horarioInicio = formatLocalTime(agendamento.horario.horaInicio);
            const horarioFim = formatLocalTime(agendamento.horario.horaFim);
            const modalidadeNome = agendamento.modalidade?.nome || 'Modalidade não disponível';
            const personalNome = agendamento.personal?.nomeCompleto || 'Personal não disponível';
            const alunoNome = formatAlunosNomes(agendamento.alunos);
            const { text: statusText, displayText, class: statusClass } = getStatusBadge(agendamento);

            // Cria elemento HTML com as informações do agendamento
            const card = document.createElement('div');
            card.classList.add('class-card');
            card.innerHTML = `
                <div class="class-time">
                    <p>${horarioInicio} - ${horarioFim}</p>
                    <p>${formatDateToPtBr(agendamento.data)}</p>
                </div>
                <div class="class-info">
                    <h2>${modalidadeNome}</h2>
                    <p>Personal: ${personalNome}</p>
                    <p>Aluno: ${alunoNome}</p>
                </div>
                <div class="button-container">
                    <a href="workout-details.html?id=${agendamento.id}" class="view-button">Visualizar</a>
                    <span class="status-button ${statusClass}">${displayText}</span>
                </div>
            `;
            container.appendChild(card); // Adiciona o card ao container
        });
    } catch (error) {
        // Loga qualquer erro ocorrido durante o processo
        console.error('Erro ao carregar agendamentos:', error);
        const container = document.getElementById('reservations-container');
        container.innerHTML = '<p class="error-message">Não foi possível carregar os agendamentos.</p>';
    }
}