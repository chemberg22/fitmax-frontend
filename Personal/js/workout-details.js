// Função para carregar os detalhes do agendamento
async function fetchAppointmentDetails(userId) {
    // Obtém e loga o ID do agendamento da URL
    const agendamentoId = getAgendamentoIdFromUrl();

    // Verifica se o ID foi encontrado na URL, se não, redireciona para a página anterior
    console.log('ID do agendamento extraído da URL:', agendamentoId);
    if (!agendamentoId) {
        console.log('Nenhum ID de agendamento encontrado na URL');
        alert('ID do agendamento não encontrado. Por favor, retorne à página de agendamentos.');
        window.location.href = 'classes.html';
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

        // Valida se o agendamento pertence ao personal logado, se não, loga e alerta redirecionando para a tela anterior
        if (!agendamento.personal || agendamento.personal.id !== userId) {
            console.log('Agendamento não pertence ao personal logado');
            alert('Acesso não autorizado. Este agendamento não pertence a você.');
            window.location.href = 'classes.html';
            return;
        }

        // Obtém os campos do formulário HTML onde os dados serão exibidos e trata valores nulos
        const modalidadeNome = agendamento.modalidade?.nome || 'Não disponível';
        const alunoNome = formatAlunosNomes(agendamento.alunos);
        const horarioInicio = formatLocalTime(agendamento.horario?.horaInicio);
        const horarioFim = formatLocalTime(agendamento.horario?.horaFim);
        const data = formatDateToPtBr(agendamento.data);
        // Define o texto legível do status com base nos valores crus
        const statusText = agendamento.status === 'reservado' ? 'Reservado' :
                           agendamento.status === 'concluido' ? 'Concluído' :
                           agendamento.status === 'em_aberto' ? 'Em aberto' : 'Indefinido';

        // Exibe os dados formatados nos elementos da interface
        document.getElementById('modalidade-nome').textContent = modalidadeNome;
        document.getElementById('data-hora').textContent = `${data} às ${horarioInicio} - ${horarioFim}`;
        document.getElementById('status').textContent = `Status: ${statusText}`;
        document.getElementById('aluno').textContent = `Aluno: ${alunoNome}`;

        // Prepara o container de botões de ação (nada/cancelar)
        const actionsContainer = document.getElementById('appointment-actions');
        actionsContainer.innerHTML = '';

        // Verifica se o agendamento possui alunos vinculados
        const alunosVinculados = Array.isArray(agendamento.alunos) && agendamento.alunos.length > 0;

        // Concluído = sem botões
        // Reservado = botões de concluir e cancelar
        // Em aberto = botão de concluir e reservar caso tenha alunos vinculados
        if (agendamento.status === 'reservado' || (agendamento.status === 'em_aberto' && alunosVinculados)) {
            actionsContainer.innerHTML = `
                <button class="action-button concluir" onclick="concluirAgendamento(${agendamentoId})">Concluir Agendamento</button>
                <button class="action-button cancel" onclick="cancelarAgendamento(${agendamentoId})">Cancelar Agendamento</button>
            `;
        }
    } catch (error) {
        // Loga e alerta qualquer erro ocorrido durante o processo
        console.error('Erro ao carregar detalhes do agendamento:', error);
        alert('Não foi possível carregar os detalhes do agendamento. Verifique se o backend está rodando. Detalhes: ' + error.message);
        window.location.href = 'classes.html';
    }
}

// Função para concluir o agendamento
async function concluirAgendamento(agendamentoId) {
    // Verifica a confirmação da ação
    if (!confirm('Tem certeza que deseja concluir o agendamento?')) return;

    // Loga o ID do agendamento a ser concluído
    console.log('Concluindo agendamento: id=', agendamentoId);

    try {
        // Faz uma requisição PUT ao endpoint da API com o ID do agendamento
        const response = await fetch(`http://localhost:8080/api/agendamentos/${agendamentoId}/concluir`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // Verifica se a resposta foi bem-sucedida, se não, loga o erro
        if (!response.ok) {
            const errorText = await response.text();
            let errorMessage = 'Erro ao concluir agendamento';
            try {
                const errorData = JSON.parse(errorText);
                errorMessage = errorData.message || errorText;
            } catch (e) {
                errorMessage = errorText || 'Erro desconhecido';
            }
            throw new Error(errorMessage);
        }

        // Loga e alerta o sucesso, redireciona para a tela anterior
        alert('Agendamento concluído com sucesso!');
        window.location.href = 'classes.html';
    } catch (error) {
        // Loga qualquer erro ocorrido durante o processo
        console.error('Erro ao concluir agendamento:', error);
        alert('Não foi possível concluir o agendamento: ' + error.message);
    }
}

// Função para cancelar o agendamento
async function cancelarAgendamento(agendamentoId) {
    // Verifica a confirmação da ação
    if (!confirm('Tem certeza que deseja cancelar o agendamento?')) return;

    // Loga o ID do agendamento a ser cancelado
    console.log('Cancelando agendamento: id=', agendamentoId);

    try {
        // Faz uma requisição PUT ao endpoint da API com o ID do agendamento
        const response = await fetch(`http://localhost:8080/api/agendamentos/${agendamentoId}/cancelar`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                usuarioId: userData.id,
                perfil: userPerfil
            })
        });
        
        // Verifica se a resposta foi bem-sucedida, se não, loga o erro
        if (!response.ok) {
            const errorText = await response.text();
            let errorMessage = 'Erro ao cancelar agendamento';
            try {
                const errorData = JSON.parse(errorText);
                errorMessage = errorData.message || errorText;
            } catch (e) {
                errorMessage = errorText || 'Erro desconhecido';
            }
            throw new Error(errorMessage);
        }
        // Loga e alerta o sucesso, redireciona para a tela anterior
        alert('Agendamento cancelado com sucesso!');
        window.location.href = 'classes.html';
    } catch (error) {
        // Loga qualquer erro ocorrido durante o processo
        console.error('Erro ao cancelar agendamento:', error);
        alert('Não foi possível cancelar o agendamento: ' + error.message);
    }
}