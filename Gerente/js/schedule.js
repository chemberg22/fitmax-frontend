// Função para carregar unidades disponíveis
async function fetchUnidades() {
    try {
        // Faz uma requisição GET ao endpoint de unidades da API
        const response = await fetch('http://localhost:8080/api/unidades');

        // Verifica se a resposta foi bem-sucedida, se não, loga o código do status do erro
        if (!response.ok) {
            throw new Error('Erro ao carregar unidades: ' + response.status);
        }

        // Converte o retorno para JSON
        return await response.json();
    } catch (error) {
        // Loga qualquer erro ocorrido durante o processo e retorna vazio
        console.error('Erro ao carregar unidades:', error);
        alert('Erro ao carregar unidades: ' + error.message);
        return [];
    }
}

// Função para preencher o select de unidades
async function populateUnidadeSelects() {
    // Aciona o fetchUnidades() que retorna um array de unidades
    const unidades = await fetchUnidades();
    // Referencia IDs dos select que devem ser preenchidos com as opções de unidades
    const selectIds = ['unidade-filter', 'add-unidade', 'remove-unidade', 'add-massa-unidade', 'remove-massa-unidade'];

    // Para cada ID da lista acima, executa o preenchimento do <select> correspondente
    selectIds.forEach(id => {
        const select = document.getElementById(id);
        // Define a primeira opção como desabilitada e selecionada por padrão
        select.innerHTML = '<option value="" disabled selected>Selecione uma Unidade</option>';
        // Para cada unidade retornada da API, cria e adiciona uma <option> ao <select>
        unidades.forEach(unidade => {
            const option = document.createElement('option'); // Cria o elemento <option>
            option.value = unidade.id; // Define o valor como o ID da unidade
            option.text = unidade.nome; // Define o texto visível como o nome da unidade
            select.appendChild(option); // Adiciona a opção ao <select>
        });
    });
}

// Função para carregar horários disponíveis
async function fetchHorarios() {
    try {
        // Faz uma requisição GET ao endpoint de horarios da API
        const response = await fetch('http://localhost:8080/api/horarios');

        // Verifica se a resposta foi bem-sucedida, se não, loga o código do status do erro
        if (!response.ok) {
            throw new Error('Erro ao carregar horários: ' + response.status);
        }

        // Converte o retorno para JSON
        return await response.json();
    } catch (error) {
        // Loga qualquer erro ocorrido durante o processo e retorna vazio
        console.error('Erro ao carregar horários:', error);
        alert('Erro ao carregar horários: ' + error.message);
        return [];
    }
}

// Função para carregar modalidades disponíveis
async function fetchModalidades() {
    try {
        // Faz uma requisição GET ao endpoint de modalidades da API
        const response = await fetch('http://localhost:8080/api/modalidades');

        // Verifica se a resposta foi bem-sucedida, se não, loga o código do status do erro
        if (!response.ok) {
            throw new Error('Erro ao carregar modalidades: ' + response.status);
        }

        // Converte o retorno para JSON
        return await response.json();
    } catch (error) {
        // Loga qualquer erro ocorrido durante o processo e retorna vazio
        console.error('Erro ao carregar modalidades:', error);
        alert('Erro ao carregar modalidades: ' + error.message);
        return [];
    }
}

// Função para carregar personais disponíveis por unidade
async function fetchPersonais(unidadeId) {
    try {
        // Faz uma requisição GET ao endpoint de usuários da API
        const response = await fetch(`http://localhost:8080/api/usuarios/unidade/${unidadeId}/personais-ativos`);

        // Verifica se a resposta foi bem-sucedida, se não, loga o código do status do erro
        if (!response.ok) {
            throw new Error('Erro ao carregar personais: ' + response.status);
        }

        // Converte o retorno para JSON
        const users = await response.json();

        // Filtra os usuários para retornar apenas o perfil de personal vinculados a unidade selecionada
        return users.filter(user => 
            user.perfil && // Perfil presente
            user.perfil.toLowerCase() === 'personal' && // Perfil = personal
            user.unidade &&  // Unidade presente
            user.unidade.id === parseInt(unidadeId) // ID unidade = ID fornecido
        );
    } catch (error) {
        // Loga qualquer erro ocorrido durante o processo e retorna vazio
        console.error('Erro ao carregar personais:', error);
        alert('Erro ao carregar personais: ' + error.message);
        return [];
    }
}

// Função para preencher o select de personais com base no turno e unidade
function populatePersonalSelect(turno, unidadeId, personais, selectId) {
    // Referencia o <select> que será preenchido, com base no ID recebido
    const personalSelect = document.getElementById(selectId);
    // Define a primeira opção do <select> como padrão, desabilitada e selecionada
    personalSelect.innerHTML = '<option value="" disabled selected>Selecione um Personal</option>';

    // Filtra os personais com base no turno e unidade
    const filteredPersonais = personais.filter(personal => 
        personal.turno && // Turno presente
        personal.turno.toLowerCase() === turno && // Turno = turno do personal
        personal.unidade && // Unidade presente
        personal.unidade.id === parseInt(unidadeId) // ID unidade = ID do personal
    );

    // Verifica se nenhum personal foi encontrado após o filtro
    if (filteredPersonais.length === 0) {
        const option = document.createElement('option'); // Cria uma nova <option>
        option.value = "";
        option.text = "Nenhum personal disponível"; // Texto exibido
        option.disabled = true; // Impede seleção
        personalSelect.appendChild(option); // Adiciona ao <select>
        return;
    }

    // Para cada personal filtrado, cria uma <option> e adiciona ao <select>
    filteredPersonais.forEach(personal => {
        const option = document.createElement('option'); // Cria elemento <option>
        option.value = personal.id; // Define o valor como o ID do personal
        option.text = personal.nomeCompleto; // Define o texto visível como o nome do personal
        personalSelect.appendChild(option); // Adiciona ao <select>
    });
}

// Função para preencher o select de personais no filtro superior
async function populatePersonalFilter(unidadeId) {
    // Referencia o elemento <select> com ID 'personal-filter'
    const personalFilter = document.getElementById('personal-filter');
    // Define o conteúdo inicial do <select> com uma opção padrão desabilitada e selecionada
    personalFilter.innerHTML = '<option value="" disabled selected>Selecione um Personal</option>';

    // Aciona fetchPersonais que retorna os personais da unidade informada
    const personais = await fetchPersonais(unidadeId);
    // Para cada personal retornado, cria uma <option> e adiciona ao <select>
    personais.forEach(personal => {
        const option = document.createElement('option'); // Cria elemento <option>
        option.value = personal.id; // Define o valor com o ID do personal
        option.text = personal.nomeCompleto; // Define o texto visível como o nome do personal
        personalFilter.appendChild(option); // Adiciona ao <select>
    });
}

// Função para preencher os selects dos formulários individuais
async function populateSelects(unidadeId, horarioSelectId, modalidadeSelectId, personalSelectId) {
    // Aciona as funções responsáveis por buscar horários, modalidades e personals da unidade desejada
    const horarios = await fetchHorarios();
    const modalidades = await fetchModalidades();
    const personais = await fetchPersonais(unidadeId);

    // Obtém os elementos <select> do HTMLcom base nos IDs passados como parâmetro
    const horarioSelect = document.getElementById(horarioSelectId);
    const modalidadeSelect = modalidadeSelectId ? document.getElementById(modalidadeSelectId) : null;
    const personalSelect = document.getElementById(personalSelectId);

    // Define o conteúdo inicial dos selects com uma opção padrão desabilitada e selecionada
    horarioSelect.innerHTML = '<option value="" disabled selected>Selecione um Horário</option>';
    if (modalidadeSelect) {
        modalidadeSelect.innerHTML = '<option value="" disabled selected>Selecione uma Modalidade</option>';
    }
    personalSelect.innerHTML = '<option value="" disabled selected>Selecione um Personal</option>';

    // Para cada horário recebido, cria uma <option> e adiciona ao <select>
    horarios.forEach(horario => {
        const option = document.createElement('option'); // Cria elemento <option>
        option.value = horario.id; // Define o valor com o ID do horário
        option.text = `${formatLocalTime(horario.horaInicio)} - ${formatLocalTime(horario.horaFim)} (${capitalizeFirstLetter(horario.turno)})`; // Exibe o horário formatado com início, fim e turno capitalizado
        horarioSelect.appendChild(option); // Adiciona ao <select>
    });

    // Verifica se há horário e seleciona o primeiro horário como valor padrão
    if (horarios.length > 0) {
        horarioSelect.value = horarios[0].id;
    }

    // Verifica se o campo modalidade está presente e preenche as modalidades
    if (modalidadeSelect) {
        // Para cada modalidade recebida, cria uma <option> e adiciona ao <select>
        modalidades.forEach(modalidade => {
            const option = document.createElement('option'); // Cria elemento <option>
            option.value = modalidade.id; // Define o valor com o ID da modalidade
            option.text = modalidade.nome; // Define o texto visível como o nome da modalidade
            modalidadeSelect.appendChild(option); // Adiciona ao <select>
        });

        // Verifica se há modalidade e seleciona a primeira modalidade como valor padrão
        if (modalidades.length > 0) {
            modalidadeSelect.value = modalidades[0].id;
        }
    }

    // Vericia se há horário, extrai o turno e aciona populatePersonalSelect() para preencher os personals
    if (horarios.length > 0) {
        const turno = horarios[0].turno.toLowerCase();
        populatePersonalSelect(turno, unidadeId, personais, personalSelectId);
    }
}

// Função para preencher os selects dos formulários em massa
async function populateMassaSelects(turno, unidadeId, formType) {
    // Aciona fetchModalidades para receber modalidades
    const modalidades = await fetchModalidades();
    // Aciona fetchPersonais para preencher personals por unidade
    const personais = await fetchPersonais(unidadeId);

    // Loga as informações recebidas
    console.log(`Populando selects para turno: ${turno}, unidadeId: ${unidadeId}, tipo: ${formType}`);

    // Verifica se o formulário é de adição em massa e preenche os selects
    if (formType === 'add') {
        // Referencia os selects do formulário de adição em massa
        const modalidadeSelect = document.getElementById('add-massa-modalidade');
        const personalSelect = document.getElementById('add-massa-personal');

        // Define a opção padrão nos selects
        modalidadeSelect.innerHTML = '<option value="" disabled selected>Selecione uma Modalidade</option>';
        personalSelect.innerHTML = '<option value="" disabled selected>Selecione um Personal</option>';

        // Preenche o select de modalidades com as modalidades recebidas
        modalidades.forEach(modalidade => {
            const option = document.createElement('option'); // Cria elemento <option>
            option.value = modalidade.id; // Define o valor com o ID da modalidade
            option.text = modalidade.nome; // Define o texto visível como o nome da modalidade
            modalidadeSelect.appendChild(option); // Adiciona ao <select>
        });

        // Verifica se existe modalidade e seleciona a primeira como padrão
        if (modalidades.length > 0) {
            modalidadeSelect.value = modalidades[0].id;
        }

        // Aciona populatePersonalSelect para preencher os personals por turno e unidade
        populatePersonalSelect(turno, unidadeId, personais, 'add-massa-personal');
    } else if (formType === 'remove') { // Verifica se o formulário é de remoção em massa e preenche o select
        // Referencia o select do formulário de remoção em massa
        const personalSelect = document.getElementById('remove-massa-personal');
        // Define a opção padrão
        personalSelect.innerHTML = '<option value="" disabled selected>Selecione um Personal</option>';
        // Aciona populatePersonalSelect para preencher os personals por turno e unidade
        populatePersonalSelect(turno, unidadeId, personais, 'remove-massa-personal');
    }
}

// Função para carregar agendamentos no intervalo de datas (usando filtros superiores)
async function loadAgendamentos(showAlert = true) {
    // Aciona as funções que ocultam os formulários
    hideAddAgendamentoForm();
    hideRemoveAgendamentoForm();
    hideAddAgendamentoMassaForm();
    hideRemoveAgendamentoMassaForm();

    // Referencia os campos dos selects e obtém os valores
    const unidadeId = document.getElementById('unidade-filter').value;
    const dataInicio = document.getElementById('data-inicio').value;
    const dataFim = document.getElementById('data-fim').value;
    const personalId = document.getElementById('personal-filter').value;

    // Verifica os campos obrigatórios
    if (!unidadeId || !dataInicio || !dataFim || !personalId) {
        if (showAlert) {
            alert('Por favor, selecione a unidade, as datas inicial e final e um personal.');
        }
        return;
    }

    // Valida o intervalo de no máximo 7 dias selecionado
    const startDate = new Date(dataInicio);
    const endDate = new Date(dataFim);
    const diffDays = (endDate - startDate) / (1000 * 60 * 60 * 24);
    if (diffDays > 7) {
        alert('O intervalo de datas não pode exceder 7 dias.');
        return;
    }

    try {
        // Faz uma requisição GET ao endpoint da API com a data de início, fim, personal e unidade
        const response = await fetch(`http://localhost:8080/api/agendamentos?dataInicio=${dataInicio}&dataFim=${dataFim}&personalId=${personalId}&unidadeId=${unidadeId}`);

        // Verifica se a resposta foi bem-sucedida, se não, loga o código do status do erro
        if (!response.ok) {
            throw new Error('Erro ao carregar agendamentos: ' + response.status);
        }

        // Converte a resposta para JSON e loga os dados recebidos
        const agendamentos = await response.json();
        console.log('Agendamentos recebidos:', agendamentos);

        // Aciona fetchHorarios() para buscar todos os horários disponíveis
        const horarios = await fetchHorarios();
        // Limpa e configura o cabeçalho e corpo da tabela de agendamentos
        const tableHead = document.getElementById('agendamento-table-head');
        const tableBody = document.getElementById('agendamento-table-body');
        tableHead.innerHTML = '<tr><th>Horário</th></tr>';
        tableBody.innerHTML = '';

        // Geração dinamicamente as colunas de datas com base no intervalo
        const dates = [];
        let currentDate = new Date(dataInicio);
        const endDateParsed = new Date(dataFim);
        // Cria o(s) cabeçalho(s) com as datas do início ao fim
        while (currentDate <= endDateParsed) {
            const dateStr = currentDate.toISOString().split('T')[0]; // Formato AAAA-MM-DD
            dates.push(dateStr);
            // Cria o cabeçalho da data atual formatada (DD-MM-AAAA)
            const th = document.createElement('th');
            th.textContent = formatDateToPtBr(dateStr);
            tableHead.querySelector('tr').appendChild(th);
            // Avança para o dia seguinte
            currentDate.setDate(currentDate.getDate() + 1);
        }

        // Preenche a tabela com horários e agendamentos
        horarios.forEach(horario => {
            // Cria as linhas da tabela
            const tr = document.createElement('tr');
            // Primeira coluna da linha = horário formatado
            tr.innerHTML = `<td>${formatLocalTime(horario.horaInicio)} - ${formatLocalTime(horario.horaFim)}</td>`;
            // Para cada data, busca o agendamento correspondente ao horário
            dates.forEach(date => {
                const agendamento = agendamentos.find(a => a.horario.id === horario.id && a.data === date);
                const td = document.createElement('td');
                // Verifica e trata o status do agendamento para aplicar estilo e texto
                if (!agendamento) {
                    // Nenhum agendamento encontrado = horário livre (adiciona texto e css)
                    td.textContent = 'Livre';
                    td.classList.add('table-status-livre');
                } else if (agendamento.status === 'em_aberto') {
                    // Agendamento encontrado sem alunos vinculados adiciona o texto, css e a legenda
                    td.textContent = 'Disponível';
                    td.classList.add('table-status-disponivel');
                    td.title = 'Nenhum aluno inscrito';
                } else if (agendamento.status === 'reservado' || agendamento.status === 'concluido') {
                    // Agendamento encontrado com aluno(s) vinculado(s) ou concluído adiciona o texto, css e a legenda
                    const numAlunos = agendamento.alunos ? agendamento.alunos.length : 0;
                    const modalidadeMultipla = agendamento.modalidade?.agendamentosMultiplos || false;
                    td.textContent = 'Reservado';
                    td.classList.add('table-status-reservado');
                    td.title = modalidadeMultipla 
                        ? `${numAlunos} aluno(s) inscrito(s)`
                        : '1 aluno inscrito';
                } else {
                    // Trata o status desconhecido adicionado texto, css e legenda (exceção)
                    td.textContent = 'Indefinido';
                    td.classList.add('status-indefinido');
                    td.title = 'Status desconhecido';
                }
                // Adiciona a linha na coluna atual
                tr.appendChild(td);
            });
            // Adiciona a coluna na tabela
            tableBody.appendChild(tr);
        });

        // Verifica se não há horários cadastrados e exibe mensagem na tabela (exceção)
        if (horarios.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="' + (dates.length + 1) + '">Nenhum horário encontrado.</td></tr>';
        }
    } catch (error) {
        // Loga qualquer erro ocorrido durante o processo
        console.error('Erro ao carregar agendamentos:', error);
        alert('Erro ao carregar agendamentos: ' + error.message);
    }
}

// Função para mostrar o formulário de adição de agendamento
async function showAddAgendamentoForm() {
    // Referencia os formulários do HTML e mostra somente o de adição de agendamentos
    document.getElementById('add-agendamento-form').style.display = 'block';
    document.getElementById('remove-agendamento-form').style.display = 'none';
    document.getElementById('add-agendamento-massa-form').style.display = 'none';
    document.getElementById('remove-agendamento-massa-form').style.display = 'none';
    // Preenche os selects com unidade padrão ("Selecione uma unidade")
    const unidadeId = document.getElementById('add-unidade').value || (await fetchUnidades())[0]?.id;
    // Aciona populateSelects() para preencher os selects de acordo com a unidade
    await populateSelects(unidadeId, 'add-horario', 'add-modalidade', 'add-personal');
    // Adiciona evento de mudança no select de unidade e preenche novamente os selects
    const addUnidadeSelect = document.getElementById('add-unidade');
    addUnidadeSelect.addEventListener('change', async () => {
        const unidadeId = addUnidadeSelect.value;
        if (unidadeId) {
            await populateSelects(unidadeId, 'add-horario', 'add-modalidade', 'add-personal');
        }
    });
    // Adiciona evento de mudança no select de horário para preencher personals de acordo com o turno
    const addHorarioSelect = document.getElementById('add-horario');
    addHorarioSelect.addEventListener('change', async () => {
        const unidadeId = document.getElementById('add-unidade').value;
        if (unidadeId) {
            const horarios = await fetchHorarios();
            const personais = await fetchPersonais(unidadeId);
            const turno = horarios.find(h => h.id === parseInt(addHorarioSelect.value))?.turno.toLowerCase() || 'manha';
            populatePersonalSelect(turno, unidadeId, personais, 'add-personal');
        }
    });
}

// Função para mostrar o formulário de remoção de agendamentos
async function showRemoveAgendamentoForm() {
    // Referencia os formulários do HTML e mostra somente o de remoção de agendamento
    document.getElementById('remove-agendamento-form').style.display = 'block';
    document.getElementById('add-agendamento-form').style.display = 'none';
    document.getElementById('add-agendamento-massa-form').style.display = 'none';
    document.getElementById('remove-agendamento-massa-form').style.display = 'none';
    // Preenche os selects com unidade padrão ("Selecione uma unidade")
    const unidadeId = document.getElementById('remove-unidade').value || (await fetchUnidades())[0]?.id;
    await populateSelects(unidadeId, 'remove-horario', null, 'remove-personal');
    // Adiciona evento de mudança no select de unidade e preenche novamente os selects
    const removeUnidadeSelect = document.getElementById('remove-unidade');
    removeUnidadeSelect.addEventListener('change', async () => {
        const unidadeId = removeUnidadeSelect.value;
        if (unidadeId) {
            await populateSelects(unidadeId, 'remove-horario', null, 'remove-personal');
        }
    });
    // Adiciona evento de mudança no select de horário para preencher personals de acordo com o turno
    const removeHorarioSelect = document.getElementById('remove-horario');
    removeHorarioSelect.addEventListener('change', async () => {
        const unidadeId = document.getElementById('remove-unidade').value;
        if (unidadeId) {
            const horarios = await fetchHorarios();
            const personais = await fetchPersonais(unidadeId);
            const turno = horarios.find(h => h.id === parseInt(removeHorarioSelect.value))?.turno.toLowerCase() || 'manha';
            populatePersonalSelect(turno, unidadeId, personais, 'remove-personal');
        }
    });
}

// Função para mostrar o formulário de adição de agendamentos em massa
async function showAddAgendamentoMassaForm() {
    // Referencia os formulários do HTML e mostra somente o de adição de agendamentos em massa
    document.getElementById('add-agendamento-massa-form').style.display = 'block';
    document.getElementById('add-agendamento-form').style.display = 'none';
    document.getElementById('remove-agendamento-form').style.display = 'none';
    document.getElementById('remove-agendamento-massa-form').style.display = 'none';
    // Preenche o select com unidade padrão ("Selecione uma unidade")
    const unidadeId = document.getElementById('add-massa-unidade').value || (await fetchUnidades())[0]?.id;
    // Preenche o select com unidade padrão ("Manhã")
    const turno = document.getElementById('add-massa-turno').value || 'manha';
    // Define o valor do turno
    document.getElementById('add-massa-turno').value = turno;
    // Aciona populateMassaSelects() para preencher os selects de modalidade e personal com base no turno e unidade informados
    await populateMassaSelects(turno, unidadeId, 'add');
    // Adiciona evento de mudança no select de unidade para preencher demais selects novamente
    const addMassaUnidadeSelect = document.getElementById('add-massa-unidade');
    addMassaUnidadeSelect.addEventListener('change', async () => {
        const unidadeId = addMassaUnidadeSelect.value;
        const turno = document.getElementById('add-massa-turno').value || 'manha';
        if (unidadeId) {
            await populateMassaSelects(turno, unidadeId, 'add');
        }
    });
    // Adiciona evento de mudança no select de turno para preencher select de personal novamente
    const addMassaTurnoSelect = document.getElementById('add-massa-turno');
    addMassaTurnoSelect.addEventListener('change', async () => {
        const turno = addMassaTurnoSelect.value;
        const unidadeId = document.getElementById('add-massa-unidade').value;
        if (turno && unidadeId) {
            await populateMassaSelects(turno, unidadeId, 'add');
        }
    });
}

// Função para mostrar o formulário de remoção de agendamentos em massa
async function showRemoveAgendamentoMassaForm() {
    // Referencia os formulários do HTML e mostra somente o de remoção de agendamentos em massa
    document.getElementById('remove-agendamento-massa-form').style.display = 'block';
    document.getElementById('add-agendamento-form').style.display = 'none';
    document.getElementById('remove-agendamento-form').style.display = 'none';
    document.getElementById('add-agendamento-massa-form').style.display = 'none';
    // Preenche o select com unidade padrão ("Selecione uma unidade")
    const unidadeId = document.getElementById('remove-massa-unidade').value || (await fetchUnidades())[0]?.id;
    // Preenche o select com unidade padrão ("Manhã")
    const turno = document.getElementById('remove-massa-turno').value || 'manha';
    // Define o valor do turno
    document.getElementById('remove-massa-turno').value = turno;
    // Aciona populateMassaSelects() para preencher o select personal com base no turno e unidade informados
    await populateMassaSelects(turno, unidadeId, 'remove');
    // Adiciona evento de mudança no select de unidade para preencher demais selects novamente
    const removeMassaUnidadeSelect = document.getElementById('remove-massa-unidade');
    removeMassaUnidadeSelect.addEventListener('change', async () => {
        const unidadeId = removeMassaUnidadeSelect.value;
        const turno = document.getElementById('remove-massa-turno').value || 'manha';
        if (unidadeId) {
            await populateMassaSelects(turno, unidadeId, 'remove');
        }
    });
    // Adiciona evento de mudança no select de turno para preencher select de personal novamente
    const removeMassaTurnoSelect = document.getElementById('remove-massa-turno');
    removeMassaTurnoSelect.addEventListener('change', async () => {
        const turno = removeMassaTurnoSelect.value;
        const unidadeId = document.getElementById('remove-massa-unidade').value;
        if (turno && unidadeId) {
            await populateMassaSelects(turno, unidadeId, 'remove');
        }
    });
}

// Função para adicionar agendamentos
async function addAgendamentos() {
    // Referencia os campos do HTML para obter dados do agendamento
    const unidadeId = document.getElementById('add-unidade').value;
    const horarioId = document.getElementById('add-horario').value;
    const modalidadeId = document.getElementById('add-modalidade').value;
    const personalId = document.getElementById('add-personal').value;
    const data = document.getElementById('add-data').value;

    // Valida os campos obrigatórios
    if (!unidadeId || !horarioId || !modalidadeId || !personalId || !data) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
    }

    // Cria o objeto com os dados
    const agendamentoData = {
        unidadeId: parseInt(unidadeId),
        horarioId: parseInt(horarioId),
        modalidadeId: parseInt(modalidadeId),
        personalId: parseInt(personalId),
        data: data
    };

    // Obtém a lista de horários disponíveis para validar o horário selecionado
    const horarios = await fetchHorarios();
    const horarioSelecionado = horarios.find(h => h.id === parseInt(horarioId));

    // Verifica se o horário é válido para a data selecionada
    if (!horarioSelecionado || !isValidScheduleDateTime(data, horarioSelecionado.horaInicio)) {
        alert('Não é possível agendar para horários passados.');
        return;
    }

    // Loga os dados do agendamento
    console.log('Dados a serem enviados para criar agendamento:', JSON.stringify(agendamentoData, null, 2));

    try {
        // Faz uma requisição POST ao endpoint de agendamentos da API
        const response = await fetch('http://localhost:8080/api/agendamentos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(agendamentoData)
        });

        // Verifica se a resposta foi bem-sucedida, se não, loga o código do status do erro
        if (!response.ok) {
            throw new Error('Erro ao criar agendamento: ' + response.status);
        }

        // Alerta o sucesso e esconde o formulário de adição de agendamento
        alert('Agendamento criado com sucesso!');
        hideAddAgendamentoForm();
        loadAgendamentos(false);
    } catch (error) {
        // Loga qualquer erro ocorrido durante o processo
        console.error('Erro ao criar agendamento:', error);
        alert('Erro ao criar agendamento: ' + error.message);
    }
}

// Função para adicionar agendamentos em massa
async function addAgendamentosMassa() {
    // Referencia os campos do HTML para obter dados do agendamento
    const unidadeId = document.getElementById('add-massa-unidade').value;
    const turno = document.getElementById('add-massa-turno').value;
    const modalidadeId = document.getElementById('add-massa-modalidade').value;
    const personalId = document.getElementById('add-massa-personal').value;
    const dataInicio = document.getElementById('add-massa-data-inicio').value;
    const dataFim = document.getElementById('add-massa-data-fim').value;

    // Valida os campos obrigatórios
    if (!unidadeId || !turno || !modalidadeId || !personalId || !dataInicio || !dataFim) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
    }

    // Verifica se o intervalo não é maior que 7 dias e se a data de início é anterior a data de fim
    const startDate = new Date(dataInicio);
    const endDate = new Date(dataFim);
    const diffDays = (endDate - startDate) / (1000 * 60 * 60 * 24);
    if (diffDays > 7) {
        alert('O intervalo de datas não pode exceder 7 dias.');
        return;
    }
    if (startDate > endDate) {
        alert('A data de início deve ser anterior ou igual à data de fim.');
        return;
    }

    try {
        // Busca todos os horários disponíveis
        const horarios = await fetchHorarios();
        // Filtra os horários com base no turno selecionado
        const filteredHorarios = horarios.filter(horario => horario.turno.toLowerCase() === turno);

        // Verifica se nenhum horário foi encontrado para o turno (exceção)
        if (filteredHorarios.length === 0) {
            alert('Nenhum horário disponível para o turno selecionado.');
            return;
        }

        // Gera um array de datas entre a data de início e de fim
        const dates = [];
        let currentDate = new Date(dataInicio);
        while (currentDate <= endDate) {
            dates.push(currentDate.toISOString().split('T')[0]);
            currentDate.setDate(currentDate.getDate() + 1);
        }

        // Filtra apenas as datas futuras
        const validDates = dates.filter(date => isFutureDate(date));
        if (validDates.length === 0) {
            alert('Agendamentos em massa podem ser realizados no mínimo para o dia seguinte.');
            return;
        }

        // Inicializa contadores de sucesso e lista de erros
        let successCount = 0;
        let errorMessages = [];

        // Percorre as datas e os horários filtrados
        for (const date of validDates) {
            for (const horario of filteredHorarios) {
                // Cria objeto com os dados do agendamento
                const agendamentoData = {
                    unidadeId: parseInt(unidadeId),
                    horarioId: horario.id,
                    modalidadeId: parseInt(modalidadeId),
                    personalId: parseInt(personalId),
                    data: date
                };

                try {
                    // Faz uma requisição POST ao endpoint de agendamentos da API
                    const response = await fetch('http://localhost:8080/api/agendamentos', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(agendamentoData)
                    });

                    // Se a requisição falhar, salva a mensagem de erro
                    if (!response.ok) {
                        const errorText = await response.text();
                        errorMessages.push(`Erro ao criar agendamento para ${formatDateToPtBr(date)} às ${horario.horaInicio}: ${errorText}`);
                        continue;
                    }

                    // Incrementa o contador de sucesso
                    successCount++;
                } catch (error) {
                    // Captura erro de rede ou outro tipo de falha (exceção)
                    errorMessages.push(`Erro ao criar agendamento para ${formatDateToPtBr(date)} às ${horario.horaInicio}: ${error.message}`);
                }
            }
        }

        // Verifica se algum agendamento foi criado e alerta a quantidade de sucessos
        if (successCount > 0) {
            alert(`${successCount} agendamento(s) criado(s) com sucesso!`);
        }
        // Verifica se algum agendamento não foi criado e alerta os erros acumulados
        if (errorMessages.length > 0) {
            alert(`Ocorreram erros ao criar alguns agendamentos:\n${errorMessages.join('\n')}`);
        }

        // Esconde o formulário de adição de agendamentos em massa
        hideAddAgendamentoMassaForm();
        loadAgendamentos(false);
    } catch (error) {
        // Loga qualquer erro ocorrido durante o processo
        console.error('Erro ao criar agendamentos em massa:', error);
        alert('Erro ao criar agendamentos em massa: ' + error.message);
    }
}

// Função para remover agendamentos
async function removeAgendamentos() {
    // Referencia os campos do HTML para obter dados do agendamento
    const unidadeId = document.getElementById('remove-unidade').value;
    const horarioId = document.getElementById('remove-horario').value;
    const personalId = document.getElementById('remove-personal').value;
    const data = document.getElementById('remove-data').value;

    // Valida os campos obrigatórios
    if (!unidadeId || !horarioId || !personalId || !data) {
        alert('Por favor, preencha todos os campos.');
        return;
    }

    // Obtém a lista de horários disponíveis para validar o horário selecionado
    const horarios = await fetchHorarios();
    const horarioSelecionado = horarios.find(h => h.id === parseInt(horarioId));

    // Verifica se o horário é válido para a data selecionada
    if (!horarioSelecionado || !isValidScheduleDateTime(data, horarioSelecionado.horaInicio)) {
        alert('Não é possível remover agendamentos de horários passados.');
        return;
    }

    // Busca agendamentos para validar a presença de alunos
    try {
        // Faz uma requisição GET ao endpoint de agendamentos da API com os parâmetros obtidos
        const response = await fetch(`http://localhost:8080/api/agendamentos?dataInicio=${data}&dataFim=${data}&personalId=${personalId}&unidadeId=${unidadeId}&horarioId=${horarioId}`);

        // Verifica se a resposta foi bem-sucedida, se não, loga o código do status do erro
        if (!response.ok) {
            throw new Error('Erro ao verificar agendamentos: ' + response.status);
        }

        // Converte a resposta para JSON e loga os dados recebidos
        const agendamentos = await response.json();
        console.log('Agendamentos encontrados para remoção:', agendamentos);

        const agendamentoEspecifico = agendamentos.find(a => a.horario.id === parseInt(horarioId));

        if (!agendamentoEspecifico) {
            alert('Nenhum agendamento encontrado para o horário selecionado.');
            return;
        }

        // Verifica se o agendamento específico tem alunos
        if (agendamentoEspecifico.alunos && agendamentoEspecifico.alunos.length > 0) {
            alert('Não é possível remover o agendamento pois ele possui alunos inscritos.');
            return;
        }

        // Verifica a confirmação da ação
        if (!confirm('Tem certeza que deseja remover o agendamento para o personal, horário, unidade e data selecionados?')) {
            return;
        }

        // Faz uma requisição DELETE ao endpoint de agendamentos da API com os parâmetros obtidos
        const deleteResponse = await fetch(`http://localhost:8080/api/agendamentos?horarioId=${horarioId}&personalId=${personalId}&unidadeId=${unidadeId}&data=${data}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // Verifica se a resposta foi bem-sucedida, se não, loga o código do status do erro
        if (!deleteResponse.ok) {
            const errorText = await deleteResponse.text();
            throw new Error(errorText || 'Erro ao remover agendamento');
        }

        // Alerta o sucesso e esconde o formulário de remoção de agendamentos
        alert('Agendamento removido com sucesso!');
        hideRemoveAgendamentoForm();
        loadAgendamentos(false);
    } catch (error) {
        console.error('Erro ao remover agendamento:', error);
        alert('Erro ao remover agendamento: ' + error.message);
    }
}

// Função para remover agendamentos em massa
async function removeAgendamentosMassa() {
    // Referencia os campos do HTML para obter dados dos agendamentos
    const unidadeId = document.getElementById('remove-massa-unidade').value;
    const turno = document.getElementById('remove-massa-turno').value;
    const personalId = document.getElementById('remove-massa-personal').value;
    const dataInicio = document.getElementById('remove-massa-data-inicio').value;
    const dataFim = document.getElementById('remove-massa-data-fim').value;

    // Valida os campos obrigatórios
    if (!unidadeId || !turno || !personalId || !dataInicio || !dataFim) {
        alert('Por favor, preencha todos os campos.');
        return;
    }

    // Verifica se o intervalo não é maior que 7 dias e se a data de início é anterior a data de fim
    const startDate = new Date(dataInicio);
    const endDate = new Date(dataFim);
    const diffDays = (endDate - startDate) / (1000 * 60 * 60 * 24);
    if (diffDays > 7) {
        alert('O intervalo de datas não pode exceder 7 dias.');
        return;
    }
    if (startDate > endDate) {
        alert('A data de início deve ser anterior ou igual à data de fim.');
        return;
    }

    try {
        // Busca todos os horários disponíveis
        const horarios = await fetchHorarios();
        // Filtra os horários com base no turno selecionado
        const filteredHorarios = horarios.filter(horario => horario.turno.toLowerCase() === turno);

        // Verifica se nenhum horário foi encontrado para o turno (exceção)
        if (filteredHorarios.length === 0) {
            alert('Nenhum horário disponível para o turno selecionado.');
            return;
        }

        // Gera um array de datas entre a data de início e de fim
        const dates = [];
        let currentDate = new Date(dataInicio);
        while (currentDate <= endDate) {
            dates.push(currentDate.toISOString().split('T')[0]);
            currentDate.setDate(currentDate.getDate() + 1);
        }

        // Filtra apenas as datas futuras
        const validDates = dates.filter(date => isFutureDate(date));
        if (validDates.length === 0) {
            alert('Agendamentos em massa podem ser removidos apenas para dias seguintes.');
            return;
        }

        // Faz uma requisição GET ao endpoint de agendamentos da API com os parâmetros obtidos para validar a presença de alunos
        const response = await fetch(`http://localhost:8080/api/agendamentos?dataInicio=${dataInicio}&dataFim=${dataFim}&personalId=${personalId}&unidadeId=${unidadeId}`)

        // Verifica se a resposta foi bem-sucedida, se não, loga o código do status do erro
        if (!response.ok) {
            throw new Error('Erro ao verificar agendamentos: ' + response.status);
        }

        // Converte a resposta para JSON e loga os dados recebidos
        const agendamentos = await response.json();
        console.log('Agendamentos encontrados para remoção em massa:', agendamentos);

        // Filtra os agendamentos que pertencem aos horários do turno selecionado
        const agendamentosFiltrados = agendamentos.filter(a => 
            filteredHorarios.some(h => h.id === a.horario.id)
        );

        // Verifica se os parâmetros possuem agendamento correspondente
        if (agendamentosFiltrados.length === 0) {
            alert('Nenhum agendamento encontrado para os critérios selecionados.');
            return;
        }

        // Verifica a confirmação da ação
        if (!confirm('Tem certeza que deseja remover todos os agendamentos para o personal, turno, unidade e intervalo de datas selecionados?')) {
            return;
        }

        // Inicializa contadores de sucesso e lista de erros
        let successCount = 0;
        let errorMessages = [];

        // Itera sobre os agendamentos a serem removidos
        for (const agendamento of agendamentosFiltrados) {
            const horario = filteredHorarios.find(h => h.id === agendamento.horario.id);
            const data = agendamento.data;
            const horarioId = agendamento.horario.id;

            // Verificar se o agendamento tem alunos vinculados
            const hasAlunos = agendamento.alunos && agendamento.alunos.length > 0;
            if (hasAlunos) {
                errorMessages.push(`Horário ${formatLocalTime(horario.horaInicio)}-${formatLocalTime(horario.horaFim)} em ${formatDateToPtBr(data)} não pode ser removido devido a alunos inscritos.`);
                console.log(`Agendamento bloqueado: horarioId=${horarioId}, data=${data}, numAlunos=${agendamento.alunos.length}`);
                continue;
            }

            // Faz uma requisição DELETE ao endpoint de agendamentos da API com os parâmetros obtidos
            try {
                const deleteResponse = await fetch(`http://localhost:8080/api/agendamentos?horarioId=${horarioId}&personalId=${personalId}&unidadeId=${unidadeId}&data=${data}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                // Se a requisição falhar, salva a mensagem de erro
                if (!deleteResponse.ok) {
                    const errorText = await deleteResponse.text();
                    errorMessages.push(`Erro ao remover agendamento para ${formatDateToPtBr(data)} às ${formatLocalTime(horario.horaInicio)}: ${errorText}`);
                    console.log(`Erro ao remover: horarioId=${horarioId}, data=${data}, erro=${errorText}`);
                    continue;
                }

                // Incrementa o contador de sucessos e os dados do agendamento removido
                successCount++;
                console.log(`Agendamento removido: horarioId=${horarioId}, data=${data}`);
            } catch (error) {
                // Em caso de erro na requisição, loga o erro
                errorMessages.push(`Erro ao remover agendamento para ${formatDateToPtBr(data)} às ${formatLocalTime(horario.horaInicio)}: ${error.message}`);
                console.log(`Erro ao remover: horarioId=${horarioId}, data=${data}, erro=${error.message}`);
            }
        }

        // Monta as mensagens finais para exibição ao usuário
        const messages = [];
        if (successCount > 0) {
            messages.push(`${successCount} agendamento(s) removido(s) com sucesso!`);
        }
        if (errorMessages.length > 0) {
            messages.push(`Ocorreram os seguintes erros:\n${errorMessages.join('\n')}`);
        }
        if (messages.length === 0) {
            messages.push('Nenhum agendamento foi removido.');
        }

        // Exibe alerta final com os resultados e esconde o formulário de remoção de agendamentos em massa
        alert(messages.join('\n'));
        hideRemoveAgendamentoMassaForm();
        loadAgendamentos(false);
    } catch (error) {
        // Loga qualquer erro ocorrido durante o processo
        console.error('Erro ao remover agendamentos em massa:', error);
        alert('Erro ao remover agendamentos em massa: ' + error.message);
    }
}