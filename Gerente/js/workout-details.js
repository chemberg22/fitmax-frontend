// Função para obter o ID do agendamento da URL
function getAgendamentoIdFromUrl() {
    // Cria um objeto que facilita a manipulação dos parâmetros da URL
    const urlParams = new URLSearchParams(window.location.search);
    // Retorna o valor do parâmetro ID da URL
    return urlParams.get('id');
}

// Função para carregar os detalhes do agendamento exibido
async function loadAgendamentoDetails() {
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
        const response = await fetch(`http://localhost:8080/api/agendamentos/${agendamentoId}`);

        // Verifica se a resposta foi bem-sucedida, se não, loga o código do status do erro
        if (!response.ok) {
            throw new Error('Erro ao buscar agendamento: ' + response.status);
        }

        // Converte a resposta para JSON e loga os dados recebidos
        const agendamento = await response.json();
        console.log('Detalhes do agendamento:', JSON.stringify(agendamento, null, 2));

        // Verifica se os campos esperados estão presentes (exceção)
        if (!agendamento.horario) {
            console.warn('Campo "horario" ausente no agendamento:', agendamento);
        }
        if (!agendamento.alunos) {
            console.warn('Campo "alunos" ausente ou undefined no agendamento:', agendamento);
        }

        // Obtém os campos do formulário HTML onde os dados serão exibidos e trata valores nulos
        const modalidadeNome = agendamento.modalidade?.nome || 'Modalidade não disponível';
        const personalNome = agendamento.personal?.nomeCompleto || 'Personal não disponível';
        const horarioInicio = agendamento.horario ? formatLocalTime(agendamento.horario.horaInicio) : 'Não disponível';
        const horarioFim = agendamento.horario ? formatLocalTime(agendamento.horario.horaFim) : 'Não disponível';
        const data = formatDateToPtBr(agendamento.data);
        const statusText = agendamento.status === 'em_aberto' ? 'Em aberto' :
                          agendamento.status === 'reservado' ? 'Reservado' :
                          agendamento.status === 'concluido' ? 'Concluído' : 'Indefinido';

        // Inicializa o texto de alunos como "Não reservado"
        let alunosText = 'Não reservado';
        // Verifica se a modalidade suporta agendamentos múltiplos
        const isMultiplo = agendamento.modalidade?.agendamentosMultiplos || false;
        // Verifica se o agendamento possui alunos vinculados
        if (agendamento.alunos && Array.isArray(agendamento.alunos) && agendamento.alunos.length > 0) {
            // Verifica se a modalidade é múltipla e exibe todos os nomes
            if (isMultiplo) {
                alunosText = agendamento.alunos
                    .map(aluno => {
                        if (!aluno.aluno || !aluno.aluno.nomeCompleto) {
                            console.warn('Nome completo do aluno não disponível:', aluno);
                            return null;
                        }
                        return formatAlunoNome(aluno.aluno.nomeCompleto);
                    })
                    .filter(nome => nome !== null && nome !== 'Não disponível')
                    .join(', ') || 'Não disponível';
            } else {
                // Caso contrário, mostra apenas o primeiro aluno
                const primeiroAluno = agendamento.alunos[0];
                if (!primeiroAluno.aluno || !primeiroAluno.aluno.nomeCompleto) {
                    console.warn('Nome completo do primeiro aluno não disponível:', primeiroAluno);
                    alunosText = 'Não disponível';
                } else {
                    alunosText = formatAlunoNome(primeiroAluno.aluno.nomeCompleto);
                }
            }
        } else {
            // Caso nenhum aluno esteja presente
            console.log('Nenhum aluno associado ou campo "alunos" inválido:', agendamento.alunos);
        }

        let actionButton = '';
        // Lógica para definir qual botão de ação será exibido na tela
        if (!agendamento.alunos || !Array.isArray(agendamento.alunos) || agendamento.alunos.length === 0) {
            // Caso não haja alunos vinculados, nenhum botão é exibido
            actionButton = '';
        } else if (agendamento.status !== 'concluido') {
            // Se houver alunos e o agendamento não estiver concluído, exibe o botão de cancelar
            actionButton = `<button class="action-button cancel" onclick="cancelarAgendamento(${agendamento.id})">Cancelar Agendamento</button>`;
        } else if (agendamento.status === 'concluido') {
            // Se o agendamento estiver concluído, verifica se há feedback vinculado
            // Faz uma requisição GET ao endpoint de feedback da API com o ID do agendamento
            const feedbackResponse = await fetch(`http://localhost:8080/api/feedback/exists/${agendamentoId}`);

            // Verifica se a resposta foi bem-sucedida, se não, loga o código do status do erro
            if (!feedbackResponse.ok) {
                throw new Error('Erro ao verificar feedback: ' + feedbackResponse.status);
            }

            // Converte a resposta para JSON e loga os dados recebidos
            const hasFeedback = await feedbackResponse.json();
            console.log('Feedback existe:', hasFeedback);

            // Exibe botão de "Ver Feedback(s)" se houver feedbacks, senão mostra botão "Sem Feedback" desabilitado
            if (hasFeedback) {
                actionButton = `<button class="action-button view" onclick="visualizarFeedback(${agendamento.id})">Ver Feedback(s)</button>`;
            } else {
                actionButton = `<button class="action-button none" disabled>Sem Feedback</button>`;
            }
        }

        // Monta o card HTML com os dados obtidos e renderiza no container da página
        const card = document.getElementById('appointment-card');
        card.innerHTML = `
            <div class="appointment-header">
                <h2>${modalidadeNome}</h2>
                <p>Data: ${data} | Horário: ${horarioInicio} - ${horarioFim}</p>
                <p>Status: ${statusText}</p>
            </div>
            <div class="appointment-user">
                <h3>Aluno(s): ${alunosText}</h3>
                <p>Personal: ${personalNome}</p>
            </div>
            ${actionButton ? `<div class="appointment-actions">${actionButton}</div>` : ''}
        `;
    } catch (error) {
        // Loga qualquer erro ocorrido durante o processo
        console.error('Erro ao carregar detalhes do agendamento:', error);
        const card = document.getElementById('appointment-card');
        card.innerHTML = '<p class="error-message">Não foi possível carregar os detalhes do agendamento.</p>';
    }
}

// Função para cancelar o agendamento
async function cancelarAgendamento(agendamentoId) {
    // Verifica a confirmação da ação
    if (!confirm('Tem certeza que deseja cancelar o agendamento? Isso removerá todos os alunos vinculados.')) return;

    // Obtém o ID e o perfil do usuário armazenados no localStorage
    const userId = localStorage.getItem('userId');
    const perfil = localStorage.getItem('perfil')?.toLowerCase();

    // Verifica se o ID e o perfil foram encontrados, se não, redireciona para a página de login
    if (!userId || !perfil) {
        console.error('userId ou perfil não encontrados no localStorage');
        alert('Erro: Usuário não está logado corretamente. Faça login novamente.');
        window.location.href = '../Login/index.html';
        return;
    }

    try {
        // Faz uma requisição PUT ao endpoint da API com o ID do agendamento
        const response = await fetch(`http://localhost:8080/api/agendamentos/${agendamentoId}/cancelar`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                usuarioId: parseInt(userId),
                perfil: perfil
            })
        });

        // Verifica se a resposta foi bem-sucedida, se não, loga o erro
        if (!response.ok) {
            const errorText = await response.text();
            console.log('Corpo da resposta de erro:', errorText);
            let errorMessage = 'Erro ao cancelar agendamento';
            if (errorText) {
                try {
                    const errorData = JSON.parse(errorText);
                    errorMessage = errorData.message || errorText || 'Erro desconhecido';
                } catch (e) {
                    errorMessage = errorText || 'Erro desconhecido no servidor';
                }
            } else {
                errorMessage = 'Nenhuma mensagem de erro retornada pelo servidor';
            }
            throw new Error(`HTTP ${response.status}: ${errorMessage}`);
        }

        // Loga e alerta o sucesso, em seguida carrega novamente os novos dados do agendamento
        console.log('Agendamento cancelado, recarregando detalhes do agendamento...');
        alert('Agendamento cancelado com sucesso! Todos os alunos foram desvinculados.');
        loadAgendamentoDetails();
    } catch (error) {
        // Loga qualquer erro ocorrido durante o processo
        console.error('Erro ao cancelar agendamento:', error);
        alert('Não foi possível cancelar o agendamento: ' + error.message);
    }
}