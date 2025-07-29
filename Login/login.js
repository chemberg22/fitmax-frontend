// Adiciona um ouvinte de evento ao formulário de login para pegar o envio
document.getElementById('login-form').addEventListener('submit', async function(event) {
    event.preventDefault(); // Impede que o formulário recarregue a página ao ser enviado

    // Obtém e-mail e senha inseridos
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        // Faz uma requisição POST ao endpoint da API com os dados de login
        const response = await fetch('http://localhost:8080/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                senha: password
            })
        });

        // Verifica se a resposta foi bem-sucedida, se não, loga o código de status do erro
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // Converte a resposta para JSON
        const resultado = await response.json();

        // Mostra uma mensagem (ex: "Login com sucesso", "Usuário não encontrado", etc.)
        alert(resultado.mensagem);

        // Se o login foi bem-sucedido, salva dados no localStorage e redireciona para a tela inicial do sistema
        if (resultado.mensagem === 'Login com sucesso') {
            // Armazena o email e o perfil no localStorage
            localStorage.setItem('userEmail', email);
            localStorage.setItem('perfil', resultado.perfil);

            // Redireciona o usuário com base no perfil recebido
            switch (resultado.perfil) {
                case 'gerente':
                    window.location.href = '/Gerente/index.html';
                    break;
                case 'aluno':
                    window.location.href = '/Aluno/index.html';
                    break;
                case 'personal':
                    window.location.href = '/Personal/index.html';
                    break;
                default:
                    // Caso o perfil não seja reconhecido, mostra alerta
                    alert('Perfil desconhecido: ' + resultado.perfil);
            }
        }
    } catch (error) {
        // Em caso de falha de rede ou outro erro, mostra uma mensagem de erro
        alert('Erro ao tentar fazer login. Tente novamente. Detalhes: ' + error.message);
        console.error('Erro:', error);
    }
});