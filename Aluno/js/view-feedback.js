// Função para carregar os detalhes do feedback
async function fetchFeedbackDetails(userId) {
    // Busca e loga o ID do agendamento via URL
    const agendamentoId = getAgendamentoIdFromUrl();
    console.log('ID do agendamento extraído da URL:', agendamentoId);

    // Verifica se o agendamento existe, se não, loga e alerta o erro redirecionando para a página anterior
    if (!agendamentoId) {
        console.log('Nenhum ID de agendamento encontrado na URL');
        alert('ID do agendamento não encontrado. Por favor, retorne à página de agendamentos.');
        window.location.href = 'appointments.html';
        return;
    }

    try {
        // Faz uma requisição GET ao endpoint da API com o ID do agendamento
        const agendamentoResponse = await fetch(`http://localhost:8080/api/agendamentos/${agendamentoId}`);

        // Verifica se a resposta foi bem-sucedida, se não, loga o código do status do erro
        if (!agendamentoResponse.ok) {
            throw new Error('Erro ao buscar dados do usuário: ' + agendamentoResponse.status);
        }

        // Converte a resposta para JSON e loga os dados recebidos
        const agendamento = await agendamentoResponse.json();
        console.log('Detalhes do agendamento:', agendamento);

        // Valida se o agendamento pertence ao aluno, se não, loga e alerta o erro redirecionando para a página anterior
        if (!agendamento.alunos || !Array.isArray(agendamento.alunos) || !agendamento.alunos.some(aluno => aluno.alunoId === userId)) {
            console.log('Agendamento não pertence ao aluno logado');
            alert('Acesso não autorizado. Este agendamento não pertence a você.');
            window.location.href = 'appointments.html';
            return;
        }

        // Valida se o agendamento está concluído, se não, loga e alerta que o agendamento não está concluído
        if (agendamento.status !== 'concluido') {
            console.log('Agendamento não está concluído');
            alert('Feedback só pode ser visualizado para agendamentos concluídos.');
            window.location.href = `workout-details.html?id=${agendamentoId}`;
            return;
        }

        // Faz uma requisição GET ao endpoint de feedbacks da API com o ID do agendamento e do aluno
        const feedbackResponse = await fetch(`http://localhost:8080/api/feedback/${agendamentoId}/aluno/${userId}`);

        // Verifica se a resposta foi bem-sucedida, se não, loga o código do status do erro
        if (!feedbackResponse.ok) {
            throw new Error('Erro ao buscar dados do usuário: ' + feedbackResponse.status);
        }

        // Converte a resposta para JSON e loga os dados recebidos
        const feedback = await feedbackResponse.json();
        console.log('Detalhes do feedback:', feedback);

        // Define os textos nos elementos com tratamento de valores nulos
        document.getElementById('modalidade-nome').textContent = agendamento.modalidade?.nome || 'Não disponível';
        document.getElementById('personal-nome').textContent = agendamento.personal?.nomeCompleto || 'Não disponível';
        document.getElementById('assunto').textContent = feedback.assunto || 'Não disponível';
        document.getElementById('comentario').textContent = feedback.comentario || 'Não disponível';
        document.getElementById('nota').textContent = feedback.nota != null ? feedback.nota : 'Não disponível';
    } catch (error) {
        // Loga e alerta qualquer erro ocorrido durante o processo, redirecionando para a página anterior
        console.error('Erro ao carregar feedback:', error);
        alert('Não foi possível carregar os detalhes do feedback. Verifique se o backend está rodando. Detalhes: ' + error.message);
        window.location.href = 'appointments.html';
    }
}

// Função para voltar para a página de agendamentos
function voltar() {
    window.location.href = 'appointments.html';
}