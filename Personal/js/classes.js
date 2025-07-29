// Função para carregar modalidades disponíveis para o filtro de modalidades
async function loadModalidades() {
    try {
        // Faz uma requisição GET ao endpoint modalidades da API
        const response = await fetch('http://localhost:8080/api/modalidades');

        // Verifica se a resposta foi bem-sucedida, se não, loga o código do status do erro
        if (!response.ok) {
            throw new Error('Erro ao carregar unidades: ' + response.status);
        }

        // Converte a resposta para JSON e loga os dados recebidos
        const modalidades = await response.json();
        console.log('Modalidades recebidas:', modalidades);

        // Obtém o elemento select responsável pelo filtro de modalidade
        const modalidadeFilter = document.getElementById('modalidade-filter');
        // Adiciona a opção padrão "Todas" no início do select
        modalidadeFilter.innerHTML = '<option value="">Todas as modalidades</option>';

        // Itera sobre cada modalidade recebida e cria uma opção no select
        modalidades.forEach(modalidade => {
            const option = document.createElement('option'); // Cria o elemento <option>
            option.value = modalidade.id; // Define o valor da opção com o ID da modalidade
            option.textContent = modalidade.nome; // Define o texto visível com o nome da modalidade
            modalidadeFilter.appendChild(option); // Adiciona a opção ao select
        });
    } catch (error) {
        // Loga qualquer erro ocorrido durante o processo
        console.error('Erro ao carregar modalidades:', error);
        alert('Erro ao carregar modalidades: ' + error.message);
    }
}

// Função para buscar os agendamentos do personal
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
        const personalId = userData.id;
        console.log('ID do personal:', personalId);

        // Obtém os valores dos filtros aplicados
        const modalidadeFilter = document.getElementById('modalidade-filter').value;
        const dataFilter = document.getElementById('data-filter').value;

        // Monta a URL da requisição a API de agendamentos com os filtros aplicados
        let url = `http://localhost:8080/api/agendamentos?personalId=${personalId}`;
        if (dataFilter) {
            // Se o filtro de data estiver preenchido, usa a mesma data como início e fim
            url += `&dataInicio=${dataFilter}&dataFim=${dataFilter}`;
        } else {
            // Usa intervalo amplo se a data não foi especificada
            const currentYear = new Date().getFullYear();
            url += `&dataInicio=${currentYear}-01-01&dataFim=${currentYear}-12-31`;
        }
        // Loga a URL montada
        console.log('URL da requisição de agendamentos:', url);

        // Faz uma requisição GET ao endpoint da API com a URL montada
        const response = await fetch(url);

        // Verifica se a resposta foi bem-sucedida, se não, loga o código do status do erro
        if (!response.ok) {
            throw new Error('Erro ao buscar dados do usuário: ' + response.status);
        }

        // Converte a resposta para JSON e loga os dados recebidos
        let agendamentos = await response.json();
        console.log('Agendamentos recebidos:', agendamentos);

        // Aplica filtro por modalidade, se selecionado
        if (modalidadeFilter) {
            agendamentos = agendamentos.filter(a => a.modalidade?.id === parseInt(modalidadeFilter));
        }
        // Loga os agendamentos pós filtro
        console.log('Agendamentos filtrados:', agendamentos);

        // Seleciona o container HTML onde os agendamentos serão renderizados
        const appointmentsList = document.getElementById('appointments-list');
        appointmentsList.innerHTML = '';

        // Verifica se não há agendamento e exibe mensagem
        if (agendamentos.length === 0) {
            appointmentsList.innerHTML = '<p>Nenhum agendamento encontrado para os filtros selecionados.</p>';
            return;
        }

        // Ordena agendamentos por data e horário
        agendamentos.sort((a, b) => {
            const dateA = new Date(a.data);
            const dateB = new Date(b.data);
            if (dateA.getTime() === dateB.getTime()) {
                const horaA = a.horario?.horaInicio || '00:00:00';
                const horaB = b.horario?.horaInicio || '00:00:00';
                return horaA.localeCompare(horaB);
            }
            return dateA - dateB;
        });

        // Para cada agendamento, cria um card com as informações
        agendamentos.forEach(agendamento => {
            // Loga o agendamento processado
            console.log('Processando agendamento:', agendamento);
            // Verifica se o horário é válido (exceção)
            if (!agendamento.horario) {
                console.warn('Horário não definido para agendamento:', agendamento.id);
                return;
            }
            // Formata os dados e trata valores nulos
            const horarioInicio = formatLocalTime(agendamento.horario.horaInicio);
            const horarioFim = formatLocalTime(agendamento.horario.horaFim);
            const data = formatDateToPtBr(agendamento.data);
            const modalidadeNome = agendamento.modalidade?.nome || 'Modalidade não disponível';
            const alunoNome = formatAlunosNomes(agendamento.alunos);
            // Define o texto e a classe do status
            const statusText = agendamento.status === 'reservado' ? 'Reservado' :
                               agendamento.status === 'concluido' ? 'Concluído' :
                               agendamento.status === 'em_aberto' ? 'Em aberto' : 'Indefinido';
            const statusClass = agendamento.status === 'reservado' ? 'status-reservado' :
                                agendamento.status === 'concluido' ? 'status-concluido' :
                                agendamento.status === 'em_aberto' ? 'status-em-aberto' : 'status-indefinido';
            // Cria e monta o card do agendamento estilizado
            const classCard = document.createElement('div');
            classCard.classList.add('class-card');
            classCard.innerHTML = `
                <div class="class-time">
                    <p>${horarioInicio} - ${horarioFim}</p>
                    <p>${data}</p>
                </div>
                <div class="class-info">
                    <h2>${modalidadeNome}</h2>
                    <p>Aluno: ${alunoNome}</p>
                </div>
                <div class="button-container">
                    <a href="workout-details.html?id=${agendamento.id}" class="view-button">Visualizar</a>
                    <span class="status-button ${statusClass}">${statusText}</span>
                </div>
            `;
            // Adiciona o card à lista
            appointmentsList.appendChild(classCard);
        });
    } catch (error) {
        // Loga qualquer erro ocorrido durante o processo
        console.error('Erro ao carregar agendamentos:', error);
        const appointmentsList = document.getElementById('appointments-list');
        appointmentsList.innerHTML = '<p class="error-message">Não foi possível carregar os agendamentos.</p>';
    }
}