// Função para verificar o perfil do usuário logado
function checkRole() {
    // Recupera e loga o perfil do localStorage
    const perfil = localStorage.getItem('perfil')?.toLowerCase();
    console.log('Perfil no localStorage:', perfil);

    // Verifica se o perfil existe e é de personal
    if (!perfil || perfil !== 'personal') {
        // Loga a falha na validação do perfil
        console.log('Perfil inválido ou não encontrado. Redirecionando para login...');
        // Exibe alerta de acesso não autorizado
        alert('Acesso não autorizado. Faça login como personal.');
        // Redireciona para a página de login
        window.location.href = '../Login/index.html';
        return false; // Retorna false para indicar falha na validação
    }

    // Loga que o perfil é válido
    console.log('Perfil válido. Prosseguindo...');
    return true; // Retorna true para indicar sucesso na validação
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

// Função para formatar a data no formato DD/MM/YYYY
function formatDate(dateString) {
    if (!dateString) return 'Data não disponível';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
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

function formatAlunosNomes(alunos) {
    if (!alunos || alunos.length === 0) return 'Não reservado';
    return alunos.map(aluno => {
        const nomeCompleto = aluno.nomeCompleto || aluno.aluno?.nomeCompleto || 'Desconhecido';
        const partes = nomeCompleto.trim().split(' ');
        const primeiroNome = partes[0];
        const sobrenomeInicial = partes.length > 1 ? partes[1].charAt(0) + '.' : '';
        return `${primeiroNome} ${sobrenomeInicial}`;
    }).join(', ');
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

// Função para obter o ID do agendamento da URL
function getAgendamentoIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

// Função para obter a data da URL
function getDateFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const date = urlParams.get('date');
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        console.log('Data inválida na URL:', date);
        return null;
    }
    return date;
}