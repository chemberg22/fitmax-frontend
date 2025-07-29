// Função para verificar se existe feedback do aluno para o agendamento
async function hasFeedback(agendamentoId, alunoId) {
    try {
        // Faz uma requisição GET ao endpoint de feedbacks da API com o ID do agendamento
        const response = await fetch(`http://localhost:8080/api/feedback/exists/${agendamentoId}/aluno/${alunoId}`);

        // Verifica se a resposta foi bem-sucedida, se não, loga o código do status do erro
        if (!response.ok) {
            throw new Error('Erro ao verificar feedback: ' + response.status);
        }

        // Converte a resposta para JSON e loga os dados recebidos
        const exists = await response.json();
        console.log('Feedback existe para agendamentoId=', agendamentoId, 'e alunoId=', alunoId, ':', exists);
        // Retorna a existência de feedback para o referido agendamento
        return exists;
    } catch (error) {
        // Loga qualquer erro ocorrido durante o processo
        console.error('Erro ao verificar feedback:', error);
        return false; // Retorna que não há feedback em caso de erro
    }
}

// Função para carregar os detalhes do agendamento
async function fetchAgendamentoDetails(userId) {
    // Obtém e loga o ID do agendamento da URL
    const agendamentoId = getAgendamentoIdFromUrl();
    console.log('ID do agendamento extraído da URL:', agendamentoId);

    // Verifica se o ID foi encontrado na URL, se não, redireciona para a página anterior
    if (!agendamentoId) {
        console.log('Nenhum ID de agendamento encontrado na URL');
        alert('ID do agendamento não encontrado. Por favor, retorne à página de agendamentos.');
        window.location.href = 'appointments.html';
        return;
    }

    try {
        // Faz uma requisição GET ao endpoint da API com o ID do agendamento
        const response = await fetch(`http://localhost:8080/api/agendamentos/${agendamentoId}`);

        // Verifica se a resposta foi bem-sucedida, se não, loga o código do status do erro
        if (!response.ok) {
            throw new Error('Erro ao buscar agendamento: ' + response.status);
        }

        // Converte a resposta para JSON e loga os dados recebidos
        const agendamento = await response.json();
        console.log('Detalhes do agendamento:', agendamento);

        // Valida se o agendamento pertence ao aluno logado, se não, loga, alerta e redireciona para a página anterior
        if (!agendamento.alunos || !Array.isArray(agendamento.alunos) || !agendamento.alunos.some(aluno => aluno.alunoId === userId)) {
            console.log('Agendamento não pertence ao aluno logado');
            alert('Acesso não autorizado. Este agendamento não pertence a você.');
            window.location.href = 'appointments.html';
            return;
        }

        // Obtém os campos do formulário HTML onde os dados serão exibidos e trata valores nulos
        const modalidadeNome = agendamento.modalidade?.nome || 'Não disponível';
        const personalNome = agendamento.personal?.nomeCompleto || 'Não disponível';
        const horarioInicio = formatLocalTime(agendamento.horario?.horaInicio);
        const horarioFim = formatLocalTime(agendamento.horario?.horaFim);
        const data = formatDateToPtBr(agendamento.data);
        // Define o texto legível do status com base nos valores crus
        const statusText = ['em_aberto', 'reservado'].includes(agendamento.status.toLowerCase()) ? 'Reservado' :
                          agendamento.status === 'concluido' ? 'Concluído' : 'Indefinido';

        // Exibe os dados formatados nos elementos da interface
        document.getElementById('modalidade-nome').textContent = modalidadeNome;
        document.getElementById('data-hora').textContent = `${data} às ${horarioInicio} - ${horarioFim}`;
        document.getElementById('status').textContent = `Status: ${statusText}`;
        document.getElementById('personal').textContent = `Personal: ${personalNome}`;

        // Prepara o container de botões de ação (cancelar/enviar/visualizar feedback)
        const actionsContainer = document.getElementById('appointment-actions');
        actionsContainer.innerHTML = '';

        // Se o agendamento estiver aberto ou reservado, exibe o botão de cancelamento
        if (['em_aberto', 'reservado'].includes(agendamento.status.toLowerCase())) {
            actionsContainer.innerHTML = `
                <button class="action-button cancel" onclick="cancelarAgendamento(${agendamentoId}, ${userId})">Cancelar Agendamento</button>
            `;
        } else if (agendamento.status === 'concluido') { // Se o agendamento estiver concluído, exibe botão para feedback (ou visualização)
            const feedbackExists = await hasFeedback(agendamentoId, userId);
            // Verifica se o aluno já enviou feedback para este agendamento
            if (feedbackExists) {
                actionsContainer.innerHTML = `
                    <button class="action-button" onclick="visualizarFeedback(${agendamentoId})">Visualizar Feedback</button>
                `;
            } else {
                actionsContainer.innerHTML = `
                    <button class="action-button" onclick="enviarFeedback(${agendamentoId})">Enviar Feedback</button>
                `;
            }
        }
    } catch (error) {
        // Loga e alerta qualquer erro ocorrido durante o processo
        console.error('Erro ao carregar detalhes do agendamento:', error);
        alert('Não foi possível carregar os detalhes do agendamento.' + error.message);
        window.location.href = 'appointments.html';
    }
}

// Função para cancelar o agendamento
async function cancelarAgendamento(agendamentoId, alunoId) {
    // Verifica a confirmação da ação
    if (!confirm('Tem certeza que deseja cancelar sua participação neste agendamento?')) return;

    // Loga os IDs envolvidos na operação (agendamento e aluno)
    console.log('Cancelando participação do aluno: agendamentoId=', agendamentoId, 'alunoId=', alunoId);

    try {
        // Faz uma requisição PUT ao endpoint da API com o ID do agendamento
        const response = await fetch(`http://localhost:8080/api/agendamentos/${agendamentoId}/cancelar`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                usuarioId: alunoId,
                perfil: 'aluno'
            })
        });
        
        // Verifica se a resposta foi bem-sucedida, se não, loga o erro
        if (!response.ok) {
            const errorText = await response.text();
            let errorMessage = `Erro ao cancelar participação: ${response.status}`;
            try {
                const errorData = JSON.parse(errorText);
                errorMessage = errorData.message || errorText;
            } catch (e) {
                errorMessage = errorText || 'Erro desconhecido';
            }
            throw new Error(errorMessage);
        }

        // Loga e alerta o sucesso, redireciona para a tela anterior
        alert('Participação cancelada com sucesso!');
        window.location.href = 'appointments.html';
    } catch (error) {
        // Loga qualquer erro ocorrido durante o processo
        console.error('Erro ao cancelar participação:', error);
        alert('Não foi possível cancelar sua participação: ' + error.message);
    }
}