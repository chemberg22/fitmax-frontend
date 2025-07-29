// Função para obter o ID do agendamento da URL
function getAgendamentoIdFromUrl() {
    // Cria um objeto que facilita a manipulação dos parâmetros da URL
    const urlParams = new URLSearchParams(window.location.search);
    // Retorna o valor do parâmetro ID da URL
    return urlParams.get('id');
}

// Função para carregar os detalhes do(s) feedback(s) exibidos
async function fetchFeedbackDetails() {
    // Obtém e loga o ID do agendamento da URL
    const agendamentoId = getAgendamentoIdFromUrl();
    console.log('ID do agendamento extraído da URL:', agendamentoId);

    // Verifica se o ID foi encontrado na URL, se não, redireciona para a página anterior
    if (!agendamentoId) {
        const card = document.getElementById('appointment-card');
        card.innerHTML = '<p class="error-message">ID do agendamento não encontrado. Por favor, retorne à página de agendamentos.</p>';
        return;
    }

    try {
        // Faz uma requisição GET ao endpoint da API com o ID do agendamento
        const agendamentoResponse = await fetch(`http://localhost:8080/api/agendamentos/${agendamentoId}`);

        // Verifica se a resposta foi bem-sucedida, se não, loga o código do status do erro
        if (!agendamentoResponse.ok) {
            throw new Error('Erro ao buscar agendamento: ' + agendamentoResponse.status);
        }

        // Converte a resposta para JSON e loga os dados recebidos
        const agendamento = await agendamentoResponse.json();
        console.log('Detalhes do agendamento:', JSON.stringify(agendamento, null, 2));

        // Valida se o agendamento está concluído (exceção)
        const normalizedStatus = agendamento.status?.trim().toLowerCase();
        console.log('Status normalizado:', normalizedStatus);
        if (normalizedStatus !== 'concluido') {
            console.log('Agendamento não está concluído');
            alert('Feedback só pode ser visualizado para agendamentos concluídos.');
            window.location.href = `workout-details.html?id=${agendamentoId}`;
            return;
        }

        // Cria e loga um mapa relacionando ID do aluno ao nome completo
        const alunoMap = {};
        agendamento.alunos.forEach(aluno => {
            alunoMap[aluno.alunoId] = aluno.aluno.nomeCompleto;
        });
        console.log('Mapa de alunos:', alunoMap);

        // Faz uma requisição GET ao endpoint dos feedbacks da API com o ID do agendamento
        const feedbackResponse = await fetch(`http://localhost:8080/api/feedback/by-agendamento/${agendamentoId}`);

        // Verifica se a resposta foi bem-sucedida, se não, loga o código do status do erro
        if (!feedbackResponse.ok) {
            throw new Error('Erro ao buscar feedback: ' + feedbackResponse.status);
        }

        // Converte a resposta para JSON e loga os dados recebidos
        let feedbacks = await feedbackResponse.json();
        // Garante compatibilidade com casos onde o backend retorna apenas um objeto
        if (!Array.isArray(feedbacks)) {
            feedbacks = feedbacks ? [feedbacks] : [];
        }
        // Loga os dados do(s) feedback(s)
        console.log('Detalhes dos feedbacks:', JSON.stringify(feedbacks, null, 2));

        // Obtém o elemento container onde os feedbacks serão renderizados
        const feedbackContainer = document.getElementById('feedback-container');
        // Verifica se não há feedbacks e exibe uma mensagem informativa (exceção)
        if (feedbacks.length === 0) {
            console.log('Nenhum feedback encontrado');
            feedbackContainer.innerHTML = `
                <div class="data-container">
                    <div class="data-item">
                        <span class="data-label">Feedback:</span>
                        <div class="data-info">Nenhum feedback disponível.</div>
                    </div>
                    <div class="button-group">
                        <button class="action-button view" onclick="voltar()">Voltar</button>
                    </div>
                </div>
            `;
            return;
        }

        // Gera o elemento HTML de cada feedback e insere os dados
        feedbackContainer.innerHTML = feedbacks.map((feedback, index) => `
            <div class="data-container">
                <div class="data-item">
                    <span class="data-label">Aluno:</span>
                    <div class="data-info">${alunoMap[feedback.alunoId] || 'Não disponível'}</div>
                </div>
                <div class="data-item">
                    <span class="data-label">Assunto:</span>
                    <div class="data-info">${feedback.assunto || 'Não disponível'}</div>
                </div>
                <div class="data-item">
                    <span class="data-label">Comentário:</span>
                    <div class="data-info">${feedback.comentario || 'Não disponível'}</div>
                </div>
                <div class="data-item">
                    <span class="data-label">Nota:</span>
                    <div class="data-info">${feedback.nota != null ? feedback.nota : 'Não disponível'}</div>
                </div>
                ${index === feedbacks.length - 1 ? `
                    <div class="button-group">
                        <button class="action-button view" onclick="voltar()">Voltar</button>
                    </div>
                ` : ''}
            </div>
        `).join('');
    } catch (error) {
        // Loga qualquer erro ocorrido durante o processo e redireciona para a página anterior
        console.error('Erro ao carregar feedback:', error);
        alert('Não foi possível carregar os detalhes do feedback. Verifique se o backend está rodando. Detalhes: ' + error.message);
        window.location.href = `workout-details.html?id=${agendamentoId}`;
    }
}

// Função para voltar à página de detalhes do agendamento
function voltar() {
    const agendamentoId = getAgendamentoIdFromUrl();
    console.log('Voltando para: workout-details.html?id=', agendamentoId);
    window.location.href = agendamentoId ? `workout-details.html?id=${agendamentoId}` : 'index.html';
}