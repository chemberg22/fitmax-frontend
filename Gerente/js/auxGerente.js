// Função para verificar se o usuário tem o perfil de gerente
function checkRole() {
    // Recupera e loga o perfil do localStorage
    const perfil = localStorage.getItem('perfil');
    console.log('Perfil no localStorage:', perfil);

    // Verifica se o perfil existe e é de gerente
    if (!perfil || perfil !== 'gerente') {
        // Loga a falha na validação do perfil
        console.log('Perfil inválido ou não encontrado. Redirecionando para login...');
        // Exibe alerta de acesso não autorizado
        alert('Acesso não autorizado. Faça login como gerente.');
        // Redireciona para a página de login
        window.location.href = '../Login/index.html';
        return false; // Retorna false para indicar falha na validação
    }

    // Loga que o perfil é válido
    console.log('Perfil válido. Prosseguindo...');
    return true; // Retorna true para indicar sucesso na validação
}

// Função para realizar logout do usuário
function logout() {
    // Remove o email e o perfil do usuário do localStorage
    localStorage.removeItem('userEmail');
    localStorage.removeItem('perfil');
    // Redireciona para a página de login
    window.location.href = '../Login/index.html';
}

// Função para formatar o CPF no formato XXX.XXX.XXX-XX
function formatCPF(cpf) {  
    // Aplica a formatação xxx.xxx.xxx-xx usando regex
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

// Função para formatar a data no formato DD/MM/YYYY
function formatDate(dateString) {
    // Verifica se a string de data está vazia ou indefinida
    if (!dateString) return 'Data não disponível';
    // Cria um objeto Date a partir da string fornecida
    const date = new Date(dateString);
    // Extrai o dia, garantindo dois dígitos (ex: 01, 09, 23)
    const day = String(date.getDate()).padStart(2, '0');
    // Extrai o mês (começando em janeiro) e garante dois dígitos
    const month = String(date.getMonth() + 1).padStart(2, '0');
    // Extrai o ano com quatro dígitos
    const year = date.getFullYear();
    // Retorna a data formatada como "DD/MM/YYYY"
    return `${day}/${month}/${year}`;
}

// Função para formatar o telefone no formato (XX) XXXXX-XXXX
function formatTelefone(telefone) {
    // Aplica a formtação (xx) xxxxx-xxxx usando regex
    return telefone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
}

// Função para capitalizar a primeira letra de uma string
function capitalizeFirstLetter(string) {
    // Verifica se a entrada é inválida (nula, vazia ou não é uma string)
    if (!string || typeof string !== 'string') return 'Não disponível';
    // Retorna a string com a primeira letra em maiúsculo e o restante igual
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Função para formatar o gênero para exibição
function formatGenero(genero) {
    // Verifica se a entrada é inválida (nula, vazia ou não é uma string)
    if (!genero || typeof genero !== 'string') return 'Não disponível';
    // Retorna formatado de acordo com o case
    switch (genero) {
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

// Função para formatar LocalTime como HH:mm
function formatLocalTime(time) {
    if (!time || typeof time !== 'string') return 'Não disponível';
    return time.slice(0, 5); // Ex.: "06:00:00" -> "06:00"
}

// Função para formatar data como DD/MM/AAAA
function formatDateToPtBr(dateStr) {
    if (!dateStr) return 'Não disponível';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
}

// Função auxiliar para validar datas futuras
function isFutureDate(dateStr) {
    const now = new Date();
    const date = new Date(dateStr);
    return date > now;
}

// Função auxiliar para validar horários futuros
function isValidScheduleDateTime(dateStr, horaInicioStr) {
    const now = new Date();
    const [year, month, day] = dateStr.split('-').map(Number);
    const [hora, minuto] = horaInicioStr.split(':').map(Number);
    const agendamentoDate = new Date(year, month - 1, day, hora, minuto, 0);
    return agendamentoDate > now;
}

// Função para esconder o formulário de adição de agendamentos
function hideAddAgendamentoForm() {
    document.getElementById('add-agendamento-form').style.display = 'none';
}

// Função para esconder o formulário de remoção de agendamentos
function hideRemoveAgendamentoForm() {
    document.getElementById('remove-agendamento-form').style.display = 'none';
}

// Função para esconder o formulário de remoção de agendamentos em massa
function hideAddAgendamentoMassaForm() {
    document.getElementById('add-agendamento-massa-form').style.display = 'none';
}

// Função para esconder o formulário de remoção de agendamentos em massa
function hideRemoveAgendamentoMassaForm() {
    document.getElementById('remove-agendamento-massa-form').style.display = 'none';
}

// Função para formatar nomes de alunos (PrimeiroNome S.)
function formatAlunosNomes(alunos) {
    if (!alunos || alunos.length === 0) return 'Não reservado';
    return alunos.map(aluno => {
        const nomeCompleto = aluno.aluno?.nomeCompleto || 'Desconhecido';
        const partes = nomeCompleto.trim().split(' ');
        if (partes.length === 0) return 'Desconhecido';
        const primeiroNome = partes[0];
        const sobrenomeInicial = partes.length > 1 ? partes[1].charAt(0) + '.' : '';
        return `${primeiroNome} ${sobrenomeInicial}`.trim();
    }).join(', ');
}

// Função para formatar nome do aluno como "Primeiro Nome + Primeira Letra do Sobrenome"
function formatAlunoNome(nomeCompleto) {
    if (!nomeCompleto || typeof nomeCompleto !== 'string') return 'Não disponível';
    const partes = nomeCompleto.trim().split(' ');
    if (partes.length < 2) return partes[0] || 'Não disponível';
    const primeiroNome = partes[0];
    const sobrenomeInicial = partes[1].charAt(0).toUpperCase() + '.';
    return `${primeiroNome} ${sobrenomeInicial}`;
}

// Função para visualizar o feedback
function visualizarFeedback(agendamentoId) {
    // Loga o ID do agendamento e redireciona para o feedback
    console.log('Redirecionando para visualizar feedback do agendamentoId:', agendamentoId);
    window.location.href = `view-feedback.html?id=${agendamentoId}`;
}

// Formata um valor como moeda em reais brasileiros
function formatCurrency(value) {
    // Loga o valor recebido como entrada
    console.log('Formatando valor:', value);
    // Retorna o valor em reais
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

// Valida os filtros do relatório
function validarFiltrosRelatorio() {
    // Loga o início da validação
    console.log('Validando filtros do relatório');

    // Obtém o valor selecionado no campo de tipo de relatório
    const reportType = document.getElementById('report-type')?.value;
    // Converte os valores das datas inicial e final para objetos Date
    const startDate = new Date(document.getElementById('start-date')?.value);
    const endDate = new Date(document.getElementById('end-date')?.value);
    // Cria um objeto Date com a data atual para comparação
    const today = new Date();

    // Verifica se o tipo de relatório foi selecionado
    if (!reportType) {
        // Loga  e alerta o erro
        console.error('Tipo de relatório não selecionado');
        alert('Selecione um tipo de relatório.');
        return false;
    }

    // Verifica se as datas informadas são válidas
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        // Loga e alerta o erro
        console.error('Entradas de data inválidas');
        alert('Preencha ambas as datas.');
        return false;
    }

    // Verifica se a data inicial é posterior à data final
    if (startDate > endDate) {
        // Loga e alerta o erro
        console.error('Data de início posterior à data de término');
        alert('A data de início deve ser anterior à data de término.');
        return false;
    }

    // Verifica se alguma das datas está no futuro em relação à data atual
    if (startDate > today || endDate > today) {
        // Loga e alerta o erro
        console.error('Datas no futuro');
        alert('As datas não podem estar no futuro.');
        return false;
    }

    // Calcula a diferença de dias entre as datas
    const diffInDays = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24));
    // Verifica se o intervalo entre as datas é de pelo menos 2 dias, se não, loga e alerta o erro
    if (diffInDays < 1) {
        console.error('Intervalo de datas muito curto');
        alert('O intervalo deve ter pelo menos 2 dias.');
        return false;
    }

    // Se todas as validações passarem, loga o sucesso
    console.log('Filtros validados com sucesso');
    return true;
}