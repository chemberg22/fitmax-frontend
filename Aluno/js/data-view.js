// Função para carregar personals por unidade
async function loadPersonals() {
    try {
        // Faz uma requisição GET ao endpoint usuários da API
        const response = await fetch('http://localhost:8080/api/usuarios');
        
        // Verifica se a resposta foi bem-sucedida, se não, loga o código do status do erro
        if (!response.ok) {
            throw new Error('Erro ao carregar personals: ' + response.status);
        }

        // Converte a resposta para JSON e loga os dados recebidos
        const users = await response.json();

        // Filtra e loga apenas usuários com perfil de personal
        const personals = users.filter(user => user.perfil && user.perfil.toLowerCase() === 'personal');
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

// Função para buscar os agendamentos do aluno para a data selecionada
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

    // Obtém a data pela URL, se não, redireciona para a página anterior
    const selectedDate = getDateFromUrl();
    if (!selectedDate) {
        console.log('Data não fornecida ou inválida. Redirecionando para schedule.html');
        alert('Data inválida. Por favor, selecione uma data válida.');
        window.location.href = 'schedule.html';
        return;
    }

    try {
        // Faz uma requisição GET ao endpoint da API com o email do aluno logado
        const userResponse = await fetch(`http://localhost:8080/api/auth/user?email=${encodeURIComponent(userEmail)}`);

        // Verifica se a resposta foi bem-sucedida, se não, loga o código do status do erro
        if (!userResponse.ok) {
            throw new Error('Erro ao buscar dados do usuário: ' + userResponse.status);
        }

        // Converte a resposta para JSON
        const userData = await userResponse.json();

        // Guarda e loga o ID do aluno
        const alunoId = userData.id;
        console.log('ID do aluno:', alunoId);

        // Verifica se o ID é válido
        if (!alunoId) {
            throw new Error('ID do usuário não encontrado.');
        }

        // Obtém o valor do filtro de personals
        const personalFilter = document.getElementById('personal-filter').value;

        // Monta e loga a URL de requisição a API
        let url = `http://localhost:8080/api/agendamentos?dataInicio=${selectedDate}&dataFim=${selectedDate}`;
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

        // Filtra agendamentos vinculados ao aluno pelo ID do usuário logado
        agendamentos = agendamentos.filter(a => a.alunos?.some(aluno => aluno.alunoId === alunoId));
        console.log('Agendamentos filtrados pelo aluno:', agendamentos);

        // Referencia o container HTML onde os cards serão inseridos
        const appointmentsList = document.getElementById('appointments-list');
        appointmentsList.innerHTML = '';

        // Se nenhum agendamento foi encontrado, exibe mensagem
        if (agendamentos.length === 0) {
            appointmentsList.innerHTML = '<p>Nenhum agendamento encontrado para a data selecionada.</p>';
            return;
        }

        // Ordena os agendamentos por horário de início
        agendamentos.sort((a, b) => {
            const horaA = a.horario?.horaInicio || '00:00:00';
            const horaB = b.horario?.horaInicio || '00:00:00';
            return horaA.localeCompare(horaB);
        });

        // Para cada agendamento, cria e adiciona um card à tela, logando o agendamento processado
        agendamentos.forEach(agendamento => {
            console.log('Processando agendamento:', agendamento);
            // Verifica se o horário é válido (exceção)
            if (!agendamento.horario) {
                console.warn('Horário não definido para agendamento:', agendamento.id);
                return;
            }

            // Formata os dados
            const horarioInicio = formatLocalTime(agendamento.horario.horaInicio);
            const horarioFim = formatLocalTime(agendamento.horario.horaFim);
            const data = formatDateToPtBr(agendamento.data);
            const modalidadeNome = agendamento.modalidade?.nome || 'Modalidade não disponível';
            const personalNome = agendamento.personal?.nomeCompleto || 'Personal não disponível';
            
            // Define o texto e a classe do status, logando informações
            const isAlunoInscrito = agendamento.alunos?.some(aluno => aluno.alunoId === alunoId);
            let statusText, statusClass;
            if (agendamento.status === 'concluido') {
                statusText = 'Concluído';
                statusClass = 'status-concluido';
            } else if (isAlunoInscrito) {
                statusText = 'Reservado';
                statusClass = 'status-reservado';
            } else {
                statusText = 'Indefinido';
                statusClass = 'status-indefinido';
            }
            console.log(`Agendamento ${agendamento.id}: statusText=${statusText}, statusClass=${statusClass}`);

            // Cria o card do agendamento
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
                </div>
                <div class="button-container">
                    <a href="workout-details.html?id=${agendamento.id}" class="view-button">Visualizar</a>
                    <span class="status-button ${statusClass}">${statusText}</span>
                </div>
            `;
            // Adiciona o card na lista de agendamentos
            appointmentsList.appendChild(classCard);
        });
    } catch (error) {
        // Loga qualquer erro ocorrido durante o processo
        console.error('Erro ao carregar agendamentos:', error);
        const appointmentsList = document.getElementById('appointments-list');
        appointmentsList.innerHTML = '<p class="error-message">Não foi possível carregar os agendamentos. Verifique se o backend está rodando.</p>';
    }
}