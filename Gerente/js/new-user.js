// Função para formatar o CPF enquanto o usuário digita
function formatCPF(input) {
    let value = input.value.replace(/\D/g, ''); // Remove tudo que não for número

    // Limita o número de dígitos a 11
    if (value.length > 11) {
        value = value.substring(0, 11);
    }

    // Aplica a formatação incremental
    if (value.length > 9) {
        input.value = `${value.substring(0, 3)}.${value.substring(3, 6)}.${value.substring(6, 9)}-${value.substring(9)}`;
    } else if (value.length > 6) {
        input.value = `${value.substring(0, 3)}.${value.substring(3, 6)}.${value.substring(6)}`;
    } else if (value.length > 3) {
        input.value = `${value.substring(0, 3)}.${value.substring(3)}`;
    } else {
        input.value = value;
    }
}


//Função para formatar o telefone enquanto o usuário digita
function formatTelefone(input) {
    let value = input.value.replace(/\D/g, ''); // Remove tudo que não for número

    // Limita o número de dígitos a 11 (DDD + número com 9 dígitos)
    if (value.length > 11) {
        value = value.substring(0, 11);
    }

    // Aplica a formatação incremental
    if (value.length > 6) {
        input.value = `(${value.substring(0, 2)}) ${value.substring(2, 7)}-${value.substring(7)}`;
    } else if (value.length > 2) {
        input.value = `(${value.substring(0, 2)}) ${value.substring(2)}`;
    } else {
        input.value = value;
    }
}

// Função para validar o CPF
function isCPFValido(cpf) {
    cpf = cpf.replace(/\D/g, '');

    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) {
        return false;
    }

    const calcularDV = (base, pesoInicial) => {
        let soma = 0;
        for (let i = 0; i < base.length; i++) {
            soma += parseInt(base[i]) * (pesoInicial - i);
        }
        const resto = soma % 11;
        return resto < 2 ? 0 : 11 - resto;
    };

    const base = cpf.slice(0, 9);
    const dv1 = calcularDV(base, 10);
    const dv2 = calcularDV(base + dv1, 11);

    return cpf === base + dv1.toString() + dv2.toString();
}

// Função para carregar unidades disponíveis
async function fetchUnidades() {
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

        // Limpa o select de unidades e preenche com as opções retornadas
        const unidadeSelect = document.getElementById('unidade');
        unidadeSelect.innerHTML = '';
        // Para cada unidade retornada, cria um option e adiciona para seleção
        unidades.forEach(unidade => {
            const option = document.createElement('option'); // Cria elemento <option>
            option.value = unidade.id; // Define o valor da opção como o ID da unidade
            option.textContent = unidade.nome; // Define o texto visível da opção
            unidadeSelect.appendChild(option); // Adiciona a opção ao <select>
        });
    } catch (error) {
        // Loga qualquer erro ocorrido durante o processo
        console.error('Erro ao carregar unidades:', error);
        alert('Erro ao carregar unidades: ' + error.message);
    }
}

// Função para alternar a visibilidade dos campos específicos por perfil
function toggleProfileFields() {
    // Obtém o valor selecionado no campo de perfil e converte para minúsculas
    const perfil = document.getElementById('perfil').value.toLowerCase();
    // Referências aos containers específicos
    const planoContainer = document.getElementById('plano-container');
    const turnoContainer = document.getElementById('turno-container');
    const unidadeContainer = document.getElementById('unidade-container');
    // Referências aos selects específicos
    const planoElement = document.getElementById('plano');
    const turnoElement = document.getElementById('turno');
    const unidadeElement = document.getElementById('unidade');

    // Loga o perfil atual selecionado
    console.log('toggleProfileFields chamado, perfil:', perfil);

    // Plano (visível apenas para aluno)
    if (perfil === 'aluno') {
        planoContainer.style.display = 'block'; // Mostra o campo
        planoElement.value = 'black'; // Define valor padrão
    } else {
        planoContainer.style.display = 'none'; // Oculta o campo
        planoElement.value = ''; // Limpa o valor
    }

    // Turno e Unidade (visíveis apenas para personal)
    if (perfil === 'personal') {
        turnoContainer.style.display = 'block'; // Mostra o campo turno
        unidadeContainer.style.display = 'block'; // Mostra o campo unidade
        turnoElement.value = 'manha'; // Valor padrão do turno
        unidadeElement.value = unidadeElement.options[0]?.value || ''; // Define o valor da unidade como a primeira opção disponível
    } else {
        turnoContainer.style.display = 'none'; // Oculta o campo turno
        unidadeContainer.style.display = 'none'; // Oculta o campo unidade
        turnoElement.value = '';  // Limpa o valor do turno
        unidadeElement.value = ''; // Limpa o valor da unidade
    }

    // Gerente (nenhum campo adicional)
    if (perfil === 'gerente') {
        // Loga o perfil de gerente sem adição de campos
        console.log('Nenhum campo adicional para gerente');
    }
}

// Função para criar um novo usuário
async function saveNewUser() {
    // Captura os dados do formulário
    const nomeCompleto = document.getElementById('nome-completo').value.trim();
    const cpf = document.getElementById('cpf').value.replace(/\D/g, '');
    const dataNascimento = document.getElementById('data-nascimento').value;
    const genero = document.getElementById('genero').value.toLowerCase();
    const email = document.getElementById('email').value.toLowerCase().trim();
    const telefone = document.getElementById('telefone').value.replace(/\D/g, '');
    const endereco = document.getElementById('endereco').value.trim();
    const perfil = document.getElementById('perfil').value.toLowerCase();
    const status = document.getElementById('status').value.toLowerCase();
    const plano = perfil === 'aluno' ? document.getElementById('plano').value.toLowerCase() : null;
    const turno = perfil === 'personal' ? document.getElementById('turno').value.toLowerCase() : null;
    const unidadeId = perfil === 'personal' ? document.getElementById('unidade').value : null;
    const senha = document.getElementById('senha').value;

    // Valida os campos obrigatórios
    if (!nomeCompleto) {
        alert('Nome completo é obrigatório.');
        return;
    }
    if (!nomeCompleto.match(/^[A-Za-zÀ-ÿ\s]+$/)) {
        alert('Nome completo deve conter apenas letras e espaços.');
        return;
    }

    if (!cpf || cpf.length !== 11 || !isCPFValido(cpf)) {
        alert('CPF inválido.');
        return;
    }

    if (!dataNascimento) {
        alert('Data de nascimento é obrigatória.');
        return;
    }
    
    const dataNascimentoDate = new Date(dataNascimento);
    const hoje = new Date();
    
    if (dataNascimentoDate >= hoje) {
        alert('Data de nascimento deve ser no passado.');
        return;
    }
    
    // Cálcula a idade (entre 14 e 80)
    const idade = hoje.getFullYear() - dataNascimentoDate.getFullYear();
    const m = hoje.getMonth() - dataNascimentoDate.getMonth();
    const idadeFinal = (m < 0 || (m === 0 && hoje.getDate() < dataNascimentoDate.getDate())) ? idade - 1 : idade;
    
    if (idadeFinal < 14 || idadeFinal > 80) {
        alert('A idade mímina é 14 anos e a máxima é 80 anos.');
        return;
    }

    if (!['masculino', 'feminino', 'nao_informado'].includes(genero)) {
        alert('Gênero inválido.');
        return;
    }

    if (!email) {
        alert('E-mail é obrigatório.');
        return;
    }
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        alert('E-mail inválido.');
        return;
    }

    if (!telefone) {
        alert('Telefone é obrigatório.');
        return;
    }
    if (!telefone.match(/^[0-9]+$/)) {
        alert('Telefone deve conter apenas dígitos.');
        return;
    }

    if (!endereco) {
        alert('Endereço é obrigatório.');
        return;
    }

    if (!['gerente', 'personal', 'aluno'].includes(perfil)) {
        alert('Perfil inválido.');
        return;
    }

    if (!['ativo', 'inativo'].includes(status)) {
        alert('Status inválido.');
        return;
    }

    if (perfil === 'aluno' && !['black', 'gold', 'premium'].includes(plano)) {
        alert('Plano é obrigatório para alunos.');
        return;
    }

    if (perfil === 'personal') {
        if (!['manha', 'tarde'].includes(turno)) {
            alert('Turno é obrigatório para personals.');
            return;
        }
        if (!unidadeId) {
            alert('Unidade é obrigatória para personals.');
            return;
        }
    }

    if (!senha) {
        alert('Senha é obrigatória.');
        return;
    }

    // Cria o objeto com os novos dados
    const newUserData = {
        nomeCompleto: nomeCompleto,
        cpf: cpf,
        dataNascimento: dataNascimento,
        genero: genero,
        email: email,
        telefone: telefone,
        endereco: endereco,
        perfil: perfil,
        status: status,
        plano: plano,
        turno: turno,
        senhaHash: senha,
        unidade: perfil === 'personal' ? { id: parseInt(unidadeId) } : null
    };

    // Loga os dados do novo usuário
    console.log('Dados a serem enviados para o backend:', JSON.stringify(newUserData, null, 2));

    try {
        // Faz uma requisição POST ao endpoint da API com os dados do novo usuário
        const response = await fetch('http://localhost:8080/api/usuarios', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newUserData)
        });

        // Verifica se a resposta da requisição não foi bem-sucedida
        if (!response.ok) {
            // Lê o corpo da resposta negativa como texto para obter a mensagem de erro enviada pelo backend
            const errorMessage = await response.text();
            // Loga o texto do erro no console
            throw new Error(errorMessage);
        }

        // Converte a resposta para JSON e loga os novos dados
        const responseData = await response.json();
        console.log('Usuário criado:', responseData);

        // Alerta o sucesso e redireciona para a tela anterior
        alert('Usuário criado com sucesso!');
        window.location.href = 'manager.html';
    } catch (error) {
        // Loga qualquer erro ocorrido durante o processo
        console.error('Erro ao criar usuário:', error);
        alert('Erro ao criar novo usuário: ' + error.message);
    }
}

// Função para redirecionar para a página anterior
function cancelEdit() {
    window.location.href = 'manager.html';
}

// Função para verificar o perfil do usuário logado
function checkRole() {
    const perfil = localStorage.getItem('perfil');
    console.log('Perfil no localStorage:', perfil);
    if (!perfil || perfil.toLowerCase() !== 'gerente') {
        console.log('Perfil inválido ou não encontrado. Redirecionando para login...');
        alert('Acesso não autorizado. Faça login como gerente.');
        window.location.href = '../Login/index.html';
        return false;
    }
    console.log('Perfil válido. Prosseguindo...');
    return true;
}

// Função para logout
function logout() {
    localStorage.removeItem('userEmail');
    localStorage.removeItem('perfil');
    window.location.href = '../Login/index.html';
}