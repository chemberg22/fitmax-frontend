// Variável para armazenar o ID do usuário atualmente logado
let userId = null;
// Variável para armazenar o ID do personal selecionado em algum filtro ou interação
let selectedPersonalId = null;

// Função para carregar unidades disponíveis no filtro
async function loadUnidades() {
    try {
        // Faz uma requisição GET ao endpoint de unidades da API
        const response = await fetch('http://localhost:8080/api/unidades');

        // Verifica se a resposta foi bem-sucedida, se não, loga o código do status do erro
        if (!response.ok) {
            throw new Error('Erro ao carregar unidades: ' + response.status);
        }

        // Converte a resposta para JSON e loga os dados recebidos
        const unidades = await response.json();
        console.log('Unidades recebidas:', unidades);

        // Referencia o select de unidade no HTML
        const unidadeFilter = document.getElementById('unidade-filter');
        // Define a primeira opção como desabilitada e selecionada por padrão
        unidadeFilter.innerHTML = '<option value="" disabled selected>Selecione uma unidade</option>';
        // Para cada unidade retornada da API, cria e adiciona uma <option> ao <select>
        unidades.forEach(unidade => {
            const option = document.createElement('option'); // Cria o elemento <option>
            option.value = unidade.id; // Define o valor como o ID da unidade
            option.text = unidade.nome; // Define o texto visível como o nome da unidade
            unidadeFilter.appendChild(option); // Adiciona a opção ao <select>
        });
    } catch (error) {
        // Loga qualquer erro ocorrido durante o processo
        console.error('Erro ao carregar unidades:', error);
        alert('Erro ao carregar unidades: ' + error.message);
    }
}

// Função para buscar modalidades disponíveis no filtro
async function fetchModalidades() {
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

        // Referencia o select de modalidade no HTML
        const modalidadeSelect = document.getElementById('modalidade');
        // Define a primeira opção como desabilitada e selecionada por padrão
        modalidadeSelect.innerHTML = '<option value="" selected disabled>Selecione uma modalidade</option>';
        // Para cada modalidade retornada da API, cria e adiciona uma <option> ao <select>
        modalidades.forEach(modalidade => {
            const option = document.createElement('option'); // Cria o elemento <option>
            option.value = modalidade.id; // Define o valor como o ID da modalidade
            option.textContent = modalidade.nome; // Define o texto visível como o nome da modalidade
            modalidadeSelect.appendChild(option); // Adiciona a opção ao <select>
        });
    } catch (error) {
        // Loga qualquer erro ocorrido durante o processo
        console.error('Erro ao carregar modalidades:', error);
        alert('Não foi possível carregar as modalidades. Verifique se o backend está rodando.');
    }
}

// Função para carregar personais disponíveis por unidade no filtro
async function fetchPersonals(unidadeId = '') {
    try {
        // Faz uma requisição GET ao endpoint de usuários da API
        const response = await fetch('http://localhost:8080/api/usuarios');
        
        // Verifica se a resposta foi bem-sucedida, se não, loga o código do status do erro
        if (!response.ok) {
            throw new Error('Erro ao carregar personais: ' + response.status);
        }

        // Converte o retorno para JSON
        const users = await response.json();

        // Filtra os usuários para retornar apenas o perfil de personal vinculados a unidade selecionada
        const personals = users.filter(user => 
            user.perfil && // Perfil presente
            user.perfil.toLowerCase() === 'personal' &&  // Perfil = personal
            user.status === 'ativo' &&
            (!unidadeId || (user.unidade && user.unidade.id === parseInt(unidadeId))) // ID unidade = ID selecionada
        );

        // Referencia o select de personals
        const personalsContainer = document.getElementById('personals-container');
        personalsContainer.innerHTML = '';

        // Verifica a seleção de uma unidade, se não, informa a necessidade na tela
        if (!unidadeId) {
            personalsContainer.innerHTML = '<p>Selecione uma unidade para ver os personals disponíveis.</p>';
            selectedPersonalId = null;
            fetchHorarios();
            return;
        }

        // Verifica a disponibilidade de um personal de acordo com a unidade selecionada, se não, informa na tela
        if (personals.length === 0) {
            personalsContainer.innerHTML = '<p>Nenhum personal disponível para esta unidade.</p>';
            selectedPersonalId = null;
            fetchHorarios();
            return;
        }

        // Itera sobre a lista de personals recebida para criar e exibir os cards na tela
        personals.forEach((personal, index) => {
            const card = document.createElement('div'); // Cria um elemento <div> para representar o card do personal
            card.classList.add('card-personal'); // Adiciona a classe CSS que estiliza o card
            // Se for o primeiro personal da lista, já deixa o card selecionado por padrão
            if (index === 0) {
                card.classList.add('selected');
                selectedPersonalId = personal.id;
                fetchHorarios(); // Preenche os horários disponíveis
            }
            // Define o comportamento de clique no card para selecionar o personal
            card.onclick = () => selecionarPersonal(card, personal.id);
            // Define o conteúdo HTML do card, incluindo imagem e nome do personal
            card.innerHTML = `
                <img class="icon-personal" src="img/user-image.png" alt="${personal.nomeCompleto}" />
                <span>${personal.nomeCompleto}</span>
            `;
            // Adiciona o card ao container que lista todos os personals na interface
            personalsContainer.appendChild(card);
        });
    } catch (error) {
        // Loga qualquer erro ocorrido durante o processo
        console.error('Erro ao carregar personals:', error);
        alert('Não foi possível carregar os personals. Verifique se o backend está rodando.');
    }
}

// Função para buscar horários disponíveis
async function fetchHorarios() {
    // Referencia os elementos HTML dos filtros
    const unidadeId = document.getElementById('unidade-filter').value;
    const modalidadeId = document.getElementById('modalidade').value;
    const data = document.getElementById('data').value;

    // Loga as seleções do usuário (filtro + personal)
    console.log('Buscando horários - Unidade ID:', unidadeId, 'Modalidade ID:', modalidadeId, 'Data:', data, 'Personal ID:', selectedPersonalId, 'User ID:', userId);

    // Referencia o elemento HTML onde os horário serão exibidos
    const horariosSection = document.getElementById('horarios-section');
    if (!horariosSection) {
        // Loga caso o elemento HTML não seja encontrado
        console.error('Elemento horarios-section não encontrado no DOM');
        return;
    }

    // Verifica se todos os filtros obrigatórios foram preenchidos
    if (!unidadeId || !modalidadeId || !data || !selectedPersonalId) {
        horariosSection.innerHTML = '<p>Por favor, selecione uma unidade, modalidade, data e personal.</p>';
        return;
    }

    try {
        // Monta a URL de requisão a API incluindo data, personal e unidade
        let url = `http://localhost:8080/api/agendamentos?dataInicio=${data}&dataFim=${data}`;
        if (selectedPersonalId) {
            url += `&personalId=${encodeURIComponent(selectedPersonalId)}`;
        }
        if (unidadeId) {
            url += `&unidadeId=${encodeURIComponent(unidadeId)}`;
        }
        
        // Faz uma requisição GET ao endpoint da API com a URL montada
        const response = await fetch(url);

        // Verifica se a resposta foi bem-sucedida, se não, loga o código do status do erro
        if (!response.ok) {
            throw new Error('Erro ao buscar dados do agendamento: ' + response.status);
        }

        // Converte e loga o retorno para JSON
        let agendamentos = await response.json();
        console.log('Agendamentos recebidos:', JSON.stringify(agendamentos, null, 2));

        // Filtra por status em aberto, modalidade selecionada e que o aluno logado não esteja vinculado
        agendamentos = agendamentos.filter(a => 
            a.status === 'em_aberto' && 
            a.modalidade?.id === parseInt(modalidadeId) && 
            (!a.alunos || !a.alunos.some(aluno => aluno.alunoId === userId))
        );
        // Loga os agendamentos disponíveis
        console.log('Agendamentos filtrados:', agendamentos);

        // Filtra horários que já passaram, somente se a data for hoje
        const dataSelecionada = new Date(data + 'T00:00:00'); // Data do filtro no fuso local
        // Cria um objeto Date com a data e hora atual do sistema
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0); // Zera horas

        // Compara se a data selecionada é igual à data de hoje
        const isHoje = dataSelecionada.getTime() === hoje.getTime();
        // Verifica se a data selecionada for hoje e aplica o filtro para esconder horários que já passaram
        if (isHoje) {
            // Cria um novo objeto com a data e hora exata do momento
            const agora = new Date();
            // Filtra os agendamentos, mantendo apenas aqueles que ainda não começaram
            agendamentos = agendamentos.filter(agendamento => {
                // Recupera o horário de início no formato string
                const horaInicioStr = agendamento.horario?.horaInicio;
                // Verifica se não há horário definido, ignora esse agendamento (exceção)
                if (!horaInicioStr) return false;
                // Separa a string em partes: hora, minuto e segundo
                const [hora, minuto, segundo] = horaInicioStr.split(':');
                // Cria um objeto com a hora de início do agendamento na data de hoje
                const horaInicioDate = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate(), hora, minuto, segundo);
                // Só retorna os agendamentos que a hora de início ainda começou
                return horaInicioDate > agora;
            });
        }

        // Exibe o título da seção
        horariosSection.innerHTML = '<h3>Horários disponíveis</h3>';

        // Se não houver agendamentos disponíveis, exibe mensagem
        if (agendamentos.length === 0) {
            horariosSection.innerHTML += '<p>Nenhum horário disponível para os critérios selecionados.</p>';
            return;
        }

        // Cria container para exibir os horários
        const horariosContainer = document.createElement('div');
        horariosContainer.classList.add('horarios-container');

        // Ordena os agendamentos por horário de início
        agendamentos.sort((a, b) => {
            const horaA = a.horario?.horaInicio || '00:00:00';
            const horaB = b.horario?.horaFim || '00:00:00';
            return horaA.localeCompare(horaB);
        });

        // Para cada agendamento filtrado, renderiza um card com horário e botão de agendar
        agendamentos.forEach(agendamento => {
            console.log('Processando agendamento:', agendamento);
            if (!agendamento.horario) {
                console.warn('Horário não definido para agendamento:', agendamento.id);
                return;
            }
            // Formata o horário
            const horarioInicio = formatLocalTime(agendamento.horario.horaInicio);
            const horarioFim = formatLocalTime(agendamento.horario.horaFim);

            // Exibe a contagem de alunos para modalidades com agendamento múltiplo
            let alunosCount = '';
            // Verifica se a modalidade suporta agendamentos múltiplos e exibe-os, se não, loga o false para suporte de agendamento múltiplo
            if (agendamento.modalidade?.agendamentosMultiplos) {
                const alunosReservados = agendamento.alunos?.length || 0;
                const capacidadeMaxima = agendamento.modalidade?.capacidadeMaxima || 1;
                alunosCount = `<span class="alunos-count">${alunosReservados}/${capacidadeMaxima}</span>`;
                console.log(`Agendamento ${agendamento.id}: ${alunosReservados}/${capacidadeMaxima} alunos`);
            } else {
                console.log(`Agendamento ${agendamento.id}: Não é agendamento múltiplo`);
            }

            // Cria o item de horário com botão de ação
            const horarioItem = document.createElement('div');
            horarioItem.classList.add('horario-item');
            horarioItem.innerHTML = `
                <span>${horarioInicio} - ${horarioFim}</span>
                ${alunosCount}
                <button onclick="agendarHorario(${agendamento.id})">Agendar</button>
            `;
            horariosContainer.appendChild(horarioItem);
        });

        // Adiciona o container de horários à seção principal
        horariosSection.appendChild(horariosContainer);
        console.log('Horarios container anexado ao horarios-section');
    } catch (error) {
        // Loga qualquer erro ocorrido durante o processo
        console.error('Erro ao carregar horários:', error);
        horariosSection.innerHTML = '<p>Não foi possível carregar os horários. Verifique se o backend está rodando.</p>';
    }
}

// Função para agendar um horário
async function agendarHorario(agendamentoId) {
    // Loga o ID do agendamento e do aluno
    console.log('Agendando horário: id=', agendamentoId, 'usuário=', userId);

    try {
        // Faz uma requisição PUT ao endpoint da API com o ID do agendamento
        const response = await fetch(`http://localhost:8080/api/agendamentos/${agendamentoId}/reservar`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ alunoId: userId })
        });

        // Verifica se a resposta foi bem-sucedida, se não, loga a mensagem e o código de status do erro (incluindo exceções)
        if (!response.ok) {
            const errorText = await response.text();
            let errorMessage = 'Erro ao agendar horário';
            try {
                const errorData = JSON.parse(errorText);
                errorMessage = errorData.message || errorText;
            } catch (e) {
                errorMessage = errorText || 'Erro desconhecido';
            }
            throw new Error(errorMessage);
        }

        // Alerta o sucesso e redireciona para a página de detalhes do agendamento
        alert('Horário agendado com sucesso!');
        window.location.href = `workout-details.html?id=${agendamentoId}`;
    } catch (error) {
        // Loga qualquer erro ocorrido durante o processo
        console.error('Erro ao agendar horário:', error);
        alert('Não foi possível agendar o horário: ' + error.message);
    }
}