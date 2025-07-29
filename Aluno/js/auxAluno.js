// Função para verificar o perfil do usuário logado
function checkRole() {
    // Recupera e loga o perfil do localStorage
    const perfil = localStorage.getItem('perfil')?.toLowerCase();
    console.log('Perfil no localStorage:', perfil);

    // Verifica se o perfil existe e é de aluno
    if (!perfil || perfil !== 'aluno') {
        // Loga a falha na validação do perfil
        console.log('Perfil inválido ou não encontrado. Redirecionando para login...');
        // Exibe alerta de acesso não autorizado
        alert('Acesso não autorizado. Faça login como aluno.');
        // Redireciona para a página de login
        window.location.href = '../Login/index.html';
        return false; // Retorna false para indicar falha na validação
    }

    // Loga que o perfil é válido
    console.log('Perfil válido. Prosseguindo...');
    return true; // Retorna true para indicar sucesso na validação
}

// Função para verificar se o usuário tem agendamento no dia acessado
async function checkAppointmentToday() {
    // Loga o início da requisição ao backend
    console.log('Fazendo requisição para o backend...');
    try {
        // Busca o ID do aluno no localStorage
        const alunoId = localStorage.getItem('alunoId');

        // Faz uma requisição GET ao endpoint de agendamentos da API com o ID do aluno
        const response = await fetch(`http://localhost:8080/api/agendamentos/aluno/${alunoId}/tem-agendamento-hoje`);

        // Verifica se a resposta foi bem-sucedida, se não, loga o código do status do erro
        if (!response.ok) {
            throw new Error('Erro ao verificar agendamento do aluno: ' + response.status);
        }

        // Converte e loga a resposta para JSON
        const temAgendamento = await response.json();
        console.log('Aluno tem agendamento hoje?', temAgendamento);

        // Verifica se o aluno possui agendamento no dia e adiciona o item no menu, se não, esconde o item no menu
        if (temAgendamento) {
            // Referencia o elemento HTML do menu
            const atividadesMenu = document.getElementById('atividades-dia-menu');
            if (atividadesMenu) {
                const hoje = new Date().toISOString().slice(0, 10); // AAAA-MM-DD
                atividadesMenu.querySelector('a').href = `data-view.html?date=${hoje}`;
                atividadesMenu.classList.remove('hidden');
            }
        }
    } catch (error) {
        // Loga qualquer erro ocorrido durante o processo
        console.error('Erro ao verificar agendamento do aluno:', error);
    }
}

// Função para logout
function logout() {
    localStorage.removeItem('userEmail');
    localStorage.removeItem('perfil');
    window.location.href = '../Login/index.html';
}

// Função para capitalizar a primeira letra de uma string
function capitalizeFirstLetter(string) {
    if (!string || typeof string !== 'string') return 'Não disponível';
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Função para formatar o CPF no formato XXX.XXX.XXX-XX
function formatCPF(cpf) {  
    // Aplica a formatação xxx.xxx.xxx-xx usando regex
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

// Função para formatar a data no formato DD/MM/AAAA
function formatDate(dateString) {
    if (!dateString) return 'Data não disponível';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

// Função para formatar LocalTime como HH:mm
function formatLocalTime(time) {
    if (!time || typeof time !== 'string') return 'Não disponível';
    return time.slice(0, 5); // Ex.: "06:00:00" -> "06:00"
}

// Função para formatar data como DD/MM/YYYY
function formatDateToPtBr(dateStr) {
    if (!dateStr) return 'Não disponível';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
}

// Função para formatar o telefone no formato (XX) XXXXX-XXXX
function formatTelefone(telefone) {
    // Aplica a formtação (xx) xxxxx-xxxx usando regex
    return telefone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
}

// Função para formatar o gênero para exibição
function formatGenero(genero) {
    if (!genero || typeof genero !== 'string') return 'Não disponível';
    switch (genero.toLowerCase()) {
        case 'masculino':
            return 'Masculino';
        case 'feminino':
            return 'Feminino';
        case 'nao_informado':
            return 'Não informado';
        default:
            return 'Não disponível';
    }
}

// Função para enviar feedback
function enviarFeedback(agendamentoId) {
    console.log('Redirecionando para enviar feedback: id=', agendamentoId);
    window.location.href = `feedback.html?id=${agendamentoId}`;
}

// Função para visualizar feedback
function visualizarFeedback(agendamentoId) {
    console.log('Redirecionando para visualizar feedback: id=', agendamentoId);
    window.location.href = `view-feedback.html?id=${agendamentoId}`;
}

// Função para selecionar um personal
function selecionarPersonal(element, personalId) {
    // Loga o ID do personal que está sendo selecionado
    console.log('Selecionando personal com ID:', personalId);
    // Remove a classe selected de todos os cards, garantindo que apenas um fique selecionado
    document.querySelectorAll('.card-personal').forEach(card => card.classList.remove('selected'));
    // Adiciona a classe selected ao card clicado, destacando visualmente a seleção
    element.classList.add('selected');
    // Atualiza a variável global com o ID do personal selecionado
    selectedPersonalId = personalId;
    // Preenche os horários disponíveis para o personal selecionado
    fetchHorarios();
}

// Função para inicializar o FullCalendar
function initializeCalendar() {
    const calendarEl = document.getElementById('calendar');
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        locale: 'pt-br',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: ''
        },
        dateClick: function(info) {
            console.log('Data clicada:', info.dateStr);
            window.location.href = `data-view.html?date=${info.dateStr}`;
        }
    });
    calendar.render();
}

// Função para obter o ID do agendamento da URL
function getAgendamentoIdFromUrl() {
    // Cria um objeto que facilita a manipulação dos parâmetros da URL
    const urlParams = new URLSearchParams(window.location.search);
    // Retorna o valor do parâmetro ID da URL
    return urlParams.get('id');
}

// Função para obter a data da URL
function getDateFromUrl() {
    // Cria um objeto que facilita a manipulação dos parâmetros da URL
    const urlParams = new URLSearchParams(window.location.search);
    const date = urlParams.get('date');
    // Verifica se a data é válida, se não, retorna null
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        console.log('Data inválida na URL:', date);
        return null;
    }
    return date;
}

// Função para obter o mês (ex Junho = 6)
function obterNumeroMes(nomeMes) {
    const meses = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];
    return meses.indexOf(nomeMes) + 1;
}

// Função para obter o ID do mês via URL
function getIdMesFromUrl() {
    // Cria um objeto que facilita a manipulação dos parâmetros da URL
    const params = new URLSearchParams(window.location.search);
    // Retorna o valor do parâmetro ID da URL
    return params.get("idMes");
}