// Função para validar o agendamento
async function validateAppointment(userId) {
    // Busca o ID do agendamento via URL
    const agendamentoId = getAgendamentoIdFromUrl();
    // Referencia o elemento HTML oculto onde o ID será armazenado no formulário
    const agendamentoIdElement = document.getElementById('agendamento_id');
    // Loga o ID do agendamento
    console.log('ID do agendamento extraído da URL:', agendamentoId);

    // Se não houver ID na URL, redireciona o usuário para a página de agendamentos, logando e alertando o usuário
    if (!agendamentoId) {
        console.log('Nenhum ID de agendamento encontrado na URL');
        alert('ID do agendamento não encontrado. Por favor, retorne à página de agendamentos.');
        window.location.href = 'appointments.html';
        return false;
    }

     // Preenche o input oculto do formulário
    agendamentoIdElement.value = agendamentoId;

    try {
        // Faz uma requisição GET ao endpoint da API com o ID do agendamento
        const response = await fetch(`http://localhost:8080/api/agendamentos/${agendamentoId}`);

        // Verifica se a resposta foi bem-sucedida, se não, loga o código do status do erro
        if (!response.ok) {
            throw new Error('Erro ao buscar dados do usuário: ' + response.status);
        }

        // Converte a resposta para JSON e loga os dados recebidos
        const agendamento = await response.json();
        console.log('Detalhes do agendamento:', agendamento);

        // Valida se o agendamento está vinculado ao aluno logado, se não, loga e alerta o usuário redirecionando para a página de agendamentos
        if (!agendamento.alunos || !Array.isArray(agendamento.alunos) || !agendamento.alunos.some(aluno => aluno.alunoId === userId)) {
            console.log('Agendamento não pertence ao aluno logado');
            alert('Acesso não autorizado. Este agendamento não pertence a você.');
            window.location.href = 'appointments.html';
            return false;
        }

        // Valida se o agendamento está concluído, se não, loga e alerta o usuário redirecionando para a tela de detalhes do agendamento
        if (agendamento.status !== 'concluido') {
            console.log('Agendamento não está concluído');
            alert('Feedback só pode ser dado para agendamentos concluídos.');
            window.location.href = `workout-details.html?id=${agendamentoId}`;
            return false;
        }

        return true;
    } catch (error) {
        // Loga e alerta qualquer erro ocorrido durante o processo, redirecionando para a página de agendamentos
        console.error('Erro ao validar agendamento:', error);
        alert('Não foi possível validar o agendamento. ' + error.message);
        window.location.href = 'appointments.html';
        return false;
    }
}

// Função para validar os campos do formulário
function validateForm() {
    // Captura os dados inseridos no formulário (também os ocultos, ID aluno e ID agendamento)
    const assunto = document.getElementById('assunto').value;
    const comentario = document.getElementById('comentario').value.trim();
    const nota = document.getElementById('nota').value;
    const alunoId = document.getElementById('aluno_id').value;
    const agendamentoId = document.getElementById('agendamento_id').value;

    // Valida os campos obrigatórios
    if (!assunto) {
        alert('O campo Assunto é obrigatório.');
        return false;
    }
    if (!comentario) {
        alert('O campo Comentário é obrigatório.');
        return false;
    }
    if (comentario.length < 5) {
        alert('O comentário deve ter pelo menos 5 caracteres.');
        return false;
    }
    if (comentario.length > 500) {
        alert('O comentário não pode exceder 500 caracteres.');
        return false;
    }
    if (!nota) {
        alert('O campo Nota é obrigatório.');
        return false;
    }
    if (!alunoId) {
        alert('Erro: ID do aluno não encontrado.');
        return false;
    }
    if (!agendamentoId) {
        alert('Erro: ID do agendamento não encontrado.');
        return false;
    }
    return true;
}

// Função para enviar o feedback
async function handleFeedbackSubmission() {
    // Verifica se o formulário é válido, se não, interrompe o processo
    if (!validateForm()) {
        return;
    }

    // Cria e loga o objeto com os dados do feedback a partir dos valores preenchidos no formulário
    const feedback = {
        alunoId: parseInt(document.getElementById('aluno_id').value),
        agendamentoId: parseInt(document.getElementById('agendamento_id').value),
        assunto: document.getElementById('assunto').value,
        comentario: document.getElementById('comentario').value.trim(),
        nota: parseInt(document.getElementById('nota').value)
    };
    console.log('Enviando feedback:', JSON.stringify(feedback, null, 2));

    try {
        // Faz uma requisição POST ao endpoint de feedbacks da API
        const response = await fetch('http://localhost:8080/api/feedback', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(feedback)
        });


        // Se a resposta não for bem-sucedida, tenta extrair a mensagem de erro
        if (!response.ok) {
            const errorText = await response.text();
            let errorMessage = 'Erro ao enviar feedback';
            try {
                const errorData = JSON.parse(errorText);
                errorMessage = errorData.message || errorText;
            } catch (e) {
                errorMessage = errorText || 'Erro desconhecido';
            }
            throw new Error(errorMessage);
        }

        // Alerta o sucesso e redireciona para os detalhes do agendamento
        alert('Feedback enviado com sucesso!');
        window.location.href = `workout-details.html?id=${feedback.agendamentoId}`;
    } catch (error) {
        // Loga qualquer erro ocorrido durante o processo
        console.error('Erro ao enviar feedback:', error);
        alert('Não foi possível enviar o feedback: ' + error.message);
    }
}

// Função para cancelar o envio do feedback e redirecionar para a página anterior
function cancelFeedback() {
    const agendamentoId = getAppointmentIdFromUrl();
    console.log('Cancelando feedback, redirecionando para:', agendamentoId ? `workout-details.html?id=${agendamentoId}` : 'appointments.html');
    window.location.href = agendamentoId ? `workout-details.html?id=${agendamentoId}` : 'appointments.html';
}