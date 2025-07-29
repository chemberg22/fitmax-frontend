// Instâncias globais de gráficos para gerenciar objetos Chart.js
let alunosModalidadesChartInstance = null;
let alunosPlanosChartInstance = null;
let mediaPorAssuntoChartInstance = null;
let mediaPorPersonalChartInstance = null;
let personalAgendaChartInstance = null;
let modalidadesAgendaChartInstance = null;

// Função para buscar e popular a lista de unidades no filtro de unidades
async function fetchUnidades() {
    // Loga o início da função
    console.log('Buscando unidades');
    try {
        // Faz uma requisição GET ao endpoint de unidades da API
        const response = await fetch('http://localhost:8080/api/unidades');
        
        // Verifica se a resposta foi bem-sucedida, se não, loga o código do status do erro
        if (!response.ok) {
            throw new Error(`Erro ao buscar unidades: ${response.status}`);
        }

        // Converte a resposta para JSON e loga os dados recebidos
        const unidades = await response.json();
        console.log('Unidades recebidas:', unidades);

        // Seleciona o elemento select onde a lista de unidades será inserida
        const unidadeSelect = document.getElementById('unidade-select');
        
        // Verifica se o elemento select foi encontrado, se não, loga o erro
        if (!unidadeSelect) {
            console.error('Elemento unidade-select não encontrado');
            return;
        }

        // Adiciona a opção padrão "Todas as unidades" no início do select
        unidadeSelect.innerHTML = '<option value="">Todas as unidades</option>';
        // Para cada unidade recebida, cria uma opção e adiciona ao select
        unidades.forEach(unidade => {
            const option = document.createElement('option'); // Cria um elemento option
            option.value = unidade.id; // Define o valor da opção como o ID da unidade
            option.textContent = unidade.nome; // Define o texto da opção como o nome da unidade
            unidadeSelect.appendChild(option); // Adiciona a opção ao select
        });
    } catch (error) {
        // Em caso de erro loga a mensagem do erro
        console.error('Erro:', error.message);
    }
}

// Função para buscar e exibir estatísticas gerais
async function fetchGeneralStatistics() {
    // Loga o início da requisição ao backend
    console.log('Buscando estatísticas gerais');
    try {
        // Faz requisições GET aos endpoints de usuários e modalidades da API
        const [usuariosResponse, modalidadesResponse] = await Promise.all([
            fetch('http://localhost:8080/api/usuarios'),
            fetch('http://localhost:8080/api/modalidades')
        ]);

        // Verifica se a resposta dos usuários foi bem-sucedida, se não, loga o código do status do erro
        if (!usuariosResponse.ok) {
            throw new Error(`Erro ao buscar usuários: ${usuariosResponse.status}`);
        }
        // Verifica se a resposta das modalidades foi bem-sucedida, se não, loga o código do status do erro
        if (!modalidadesResponse.ok) {
            throw new Error(`Erro ao buscar modalidades: ${modalidadesResponse.status}`);
        }

        // Converte as respostas para JSON e loga os dados recebidos
        const usuarios = await usuariosResponse.json();
        const modalidades = await modalidadesResponse.json();
        console.log('Usuários recebidos:', usuarios.length);
        console.log('Modalidades recebidas:', modalidades.length);

        // Filtra e loga os usuários com perfil de aluno e status ativos para contagem
        const totalAlunos = usuarios.filter(u => 
            u.perfil?.toLowerCase() === 'aluno' && u.status?.toLowerCase() === 'ativo'
        ).length;
        console.log('Total de alunos ativos:', totalAlunos);

        // Filtra e loga as modalidades com status ativo, monta uma string com seus nomes
        const modalidadesAtivas = modalidades
            .filter(m => m.status?.toLowerCase() === 'ativo')
            .map(m => m.nome)
            .join(', ');
        console.log('Modalidades ativas:', modalidadesAtivas);

        // Define os preços dos planos para calcular a receita mensal, caclula e loga a receita mensal
        const planoPrecos = { black: 70, gold: 100, premium: 130 };
        const receitaMensal = usuarios
            .filter(u => u.perfil?.toLowerCase() === 'aluno' && u.status?.toLowerCase() === 'ativo')
            .reduce((total, aluno) => total + (planoPrecos[aluno.plano?.toLowerCase()] || 0), 0);
        console.log('Receita mensal:', receitaMensal);

        // Referencia os elementos do HTML onde os dados serão exibidos
        const totalAlunosElement = document.getElementById('total-alunos');
        const tipoAulasElement = document.getElementById('tipo-aulas');
        const receitaMensalElement = document.getElementById('receita-mensal');

        // Verifica se os elementos estão presentes no HTML
        if (!totalAlunosElement || !tipoAulasElement || !receitaMensalElement) {
            console.error('Elementos do DOM não encontrados');
            throw new Error('Elementos total-alunos, tipo-aulas ou receita-mensal não encontrados');
        }

        // Exibe os dados nos elementos HTML
        totalAlunosElement.textContent = totalAlunos;
        tipoAulasElement.textContent = modalidadesAtivas || 'Nenhuma modalidade ativa';
        receitaMensalElement.textContent = formatCurrency(receitaMensal);
        // Loga o preenchimento com sucesso dos dados
    } catch (error) {
        // Loga qualquer erro ocorrido durante o processo
        console.error('Erro:', error.message);
        alert('Erro ao carregar estatísticas gerais. Tente novamente.');
    }
}

// Função para buscar e exibir dados do relatório com base no tipo selecionado
async function fetchReportData() {
    // Loga o início da função (clique no "Novo Relatório")
    console.log('Buscando dados do relatório');
    // Recupera o tipo de relatório selecionado no select dos relatórios
    const reportType = document.getElementById('report-type')?.value;

    // Verifica se o tipo de relatório não for 'alunos-planos', valida os filtros
    if (reportType !== 'alunos-planos' && !validarFiltrosRelatorio()) {
        console.error('Validação falhou');
        return;
    }

    // Lista dos IDs dos containers de gráficos a serem ocultados
    const containers = [
        'report-chart-container',
        'report-planos-chart-container',
        'report-feedbacks-chart-container',
        'report-personals-chart-container',
        'report-modalidades-chart-container'
    ];
    // Percorre os containers e esconde todos
    containers.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.style.display = 'none';
    });

    // Lista das instâncias dos gráficos ativos no momento
    const chartInstances = [
        alunosModalidadesChartInstance,
        alunosPlanosChartInstance,
        mediaPorAssuntoChartInstance,
        mediaPorPersonalChartInstance,
        personalAgendaChartInstance,
        modalidadesAgendaChartInstance
    ];

    // Destroi cada gráfico existente (se houver) e limpa as referências
    chartInstances.forEach((instance, index) => {
        if (instance) {
            instance.destroy();
            console.log(`[fetchReportData] Gráfico ${index} destruído`);
        }
    });

    // Zera todas as variáveis globais de instância de gráfico
    alunosModalidadesChartInstance = null;
    alunosPlanosChartInstance = null;
    mediaPorAssuntoChartInstance = null;
    mediaPorPersonalChartInstance = null;
    personalAgendaChartInstance = null;
    modalidadesAgendaChartInstance = null;

    try {
        // Executa a função correspondente ao tipo de relatório selecionado
        switch (reportType) {
            case 'alunos-modalidades':
                await fetchAlunosModalidadesData();
                break;
            case 'alunos-planos':
                await fetchAlunosPlanosData();
                break;
            case 'alunos-feedbacks':
                await fetchFeedbacksData();
                break;
            case 'personals-agenda':
                await fetchPersonalsAgendaData();
                break;
            case 'modalidades-agenda':
                await fetchModalidadesAgendaData();
                break;
            default:
                // Loga erro caso o relatório não exista (exceção)
                console.error('Tipo de relatório não implementado:', reportType);
                alert('Relatório ainda não implementado.');
        }
    } catch (error) {
        // Em caso de erro, loga o erro ao buscar/exibir o relatório
        console.error('[fetchReportData] Erro:', error.message);
        alert('Erro ao carregar relatório.');
    }
}

// Busca e exibe o gráfico Alunos x Modalidades
async function fetchAlunosModalidadesData() {
    // Loga o início da função
    console.log('Buscando dados Alunos x Modalidades');
    try {
        // Realiza a requisição à API que retorna os dados do relatório
        const response = await fetch('http://localhost:8080/api/relatorios/alunos-modalidades');

        // Verifica se a resposta foi bem-sucedida, caso não, loga o erro
        if (!response.ok) throw new Error(`Erro ao buscar dados: ${response.status}`);

        // Converte a resposta em JSON
        const data = await response.json();
        
        // Loga os dados recebidos
        console.log('Dados recebidos:', data);

        // Obtém o contexto 2D do canvas onde o gráfico será desenhado
        const ctx = document.getElementById('alunosModalidadesChart')?.getContext('2d');
        // Verifica se o canvas foi encontrado, caso não, loga o erro
        if (!ctx) throw new Error('Elemento canvas alunosModalidadesChart não encontrado');

        // Se já houver um gráfico anterior desenhado, destrói antes de criar o novo
        if (alunosModalidadesChartInstance) {
            alunosModalidadesChartInstance.destroy();
            console.log('Gráfico existente destruído');
        }

        // Cria uma nova instância do gráfico utilizando Chart.js
        alunosModalidadesChartInstance = new Chart(ctx, {
            type: 'pie', // Tipo do gráfico: pizza
            data: {
                labels: ['Com Agendamento', 'Sem Agendamento'], // Rótulos
                datasets: [{
                    label: 'Quantidade de Alunos', // Legenda do conjunto de dados
                    data: [data.comAgendamento, data.semAgendamento], // Dados da API
                    backgroundColor: ['#36A2EB', '#FF6384']
                }]
            },
            options: {
                responsive: true, // Adapta o gráfico ao tamanho do container
                maintainAspectRatio: false, // Permite altura/largura flexíveis
                plugins: {
                    legend: {
                        // Mostra a legenda, posiciona na parte inferior do gráfico e formata o texto
                        display: true, 
                        position: 'bottom',
                        labels: {
                            font: {
                                family: 'Montserrat',
                                weight: 'bold',
                                size: 20                              
                            }
                        }
                    },
                    datalabels: {
                        color: '#000',
                        font: {
                            family: 'Montserrat',
                            weight: 'bold',
                            size: 30
                        },
                        formatter: (value, context) => {
                            // Calcula o total dos dados
                            const total = context.dataset.data.reduce((sum, val) => sum + val, 0);
                            // Calcula a porcentagem
                            const percentage = ((value / total) * 100).toFixed(1);
                            // Retorna o valor e a porcentagem formatados
                            return `${value} (${percentage}%)`;
                        }
                    }
                }
            },
            plugins: [ChartDataLabels]
        });

        // Exibe o container do gráfico na interface
        const container = document.getElementById('report-chart-container');
        if (container) container.style.display = 'block';

        // Exibe os insights dos dados abaixo do gráfico
        const explanation = document.getElementById('chart-explanation');
        if (explanation) {
            explanation.textContent = 'Alunos sem agendamento podem indicar baixa adesão ao sistema ou risco de evasão.';
            explanation.style.marginTop = '12px';
            explanation.style.marginBottom = '16px';
            explanation.style.fontSize = '20px';
            explanation.style.textAlign = 'center';
            explanation.style.fontWeight = 'bold';
        }
        // Loga sucesso ao exibir o gráfico
        console.log('Gráfico exibido com sucesso');
    } catch (error) {
        // Loga o erro ao carregar o gráfico
        console.error('Erro:', error.message);
        alert('Erro ao carregar o gráfico.');
    }
}

// Busca e exibe o gráfico Alunos x Planos
async function fetchAlunosPlanosData() {
    // Loga o início da função
    console.log('Buscando dados Alunos x Planos');
    try {
        // Realiza a requisição à API que retorna os dados do relatório
        const response = await fetch('http://localhost:8080/api/relatorios/alunos-planos');
        // Verifica se a resposta foi bem-sucedida, caso não, loga o erro
        if (!response.ok) throw new Error(`Erro ao buscar dados: ${response.status}`);
        // Converte a resposta em JSON
        const data = await response.json();
        // Loga os dados recebidos
        console.log('Dados recebidos:', data);

        // Obtém o contexto 2D do canvas onde o gráfico será desenhado
        const ctx = document.getElementById('alunosPlanosChart')?.getContext('2d');
        // Verifica se a resposta foi bem-sucedida, caso não, loga o erro
        if (!ctx) throw new Error('Elemento canvas alunosPlanosChart não encontrado');

        // Se já houver um gráfico anterior desenhado, destrói antes de criar o novo
        if (alunosPlanosChartInstance) {
            alunosPlanosChartInstance.destroy();
            console.log('Gráfico existente destruído');
        }

        // Cria uma nova instância do gráfico utilizando Chart.js
        alunosPlanosChartInstance = new Chart(ctx, {
            type: 'pie', // Tipo do gráfico: pizza
            data: {
                labels: ['Black (R$70,00)', 'Gold (R$100,00)', 'Premium (R$130,00)'], // Rótulos
                datasets: [{
                    label: 'Quantidade de Alunos', // Legenda do conjunto de dados
                    data: [data.black, data.gold, data.premium], // Dados da API
                    backgroundColor: ['#4e73df', '#f6c23e', '#1cc88a']
                }]
            },
            options: {
                responsive: true, // Adapta o gráfico ao tamanho do container
                maintainAspectRatio: false, // Permite altura/largura flexíveis
                plugins: {
                    // Mostra a legenda, posiciona na parte inferior do gráfico e formata o texto
                    legend: {
                        display: true,
                        position: 'bottom',
                        labels: {
                            font: {
                                family: 'Montserrat',
                                weight: 'bold',
                                size: 20
                            }
                        }
                    },
                    datalabels: {
                        color: '#000',
                        font: {
                            family: 'Montserrat',
                            weight: 'bold',
                            size: 30
                        },
                        formatter: (value, context) => {
                            const total = context.dataset.data.reduce((sum, val) => sum + val, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${value} (${percentage}%)`;
                        }
                    }
                }                
            },
            plugins: [ChartDataLabels]
        });

        // Exibe o container do gráfico na interface
        const container = document.getElementById('report-planos-chart-container');
        if (container) container.style.display = 'block';

        // Exibe os insights dos dados abaixo do gráfico
        const explanation = document.getElementById('planos-chart-explanation');
        if (explanation) {
            explanation.textContent = 'Distribuição dos alunos por plano identifica o perfil do público (mais econômico ou mais premium) e também identifica quais planos geram mais renda.';
            explanation.style.marginTop = '12px';
            explanation.style.marginBottom = '16px';
            explanation.style.fontSize = '20px';
            explanation.style.textAlign = 'center';
            explanation.style.fontWeight = 'bold';
        }
        // Loga sucesso ao exibir o gráfico
        console.log('Gráfico exibido com sucesso');
    } catch (error) {
        // Loga o erro ao carregar o gráfico
        console.error('[fetchAlunosPlanosData] Erro:', error.message);
        alert('Erro ao carregar o gráfico de planos.');
    }
}

// Busca e exibe gráficos de feedbacks por assunto e personal
async function fetchFeedbacksData() {
    // Loga o início da função
    console.log('Buscando dados de feedbacks');
    try {
        // Busca os valores dos filtros de data e unidade selecionados
        const startDate = document.getElementById('start-date')?.value;
        const endDate = document.getElementById('end-date')?.value;
        const unidadeId = document.getElementById('unidade-select')?.value || '';

        // Faz requisições GET ao endpoint da API para buscar feedbacks por assunto e por personal
        const [resAssunto, resPersonal] = await Promise.all([
            fetch(`http://localhost:8080/api/relatorios/feedbacks/assunto?start=${startDate}&end=${endDate}&unidadeId=${unidadeId}`),
            fetch(`http://localhost:8080/api/relatorios/feedbacks/personal?start=${startDate}&end=${endDate}&unidadeId=${unidadeId}`)
        ]);

        // Verifica se ambas as respostas foram bem-sucedidas
        if (!resAssunto.ok || !resPersonal.ok) {
            throw new Error(`Erro ao buscar dados dos feedbacks: ${resAssunto.status || resPersonal.status}`);
        }

        // Converte os dados das respostas para JSON
        const dataAssunto = await resAssunto.json();
        const dataPersonal = await resPersonal.json();
        // Loga os dados recebidos
        console.log('Dados de feedbacks recebidos:', { dataAssunto, dataPersonal });

        // Obtém os contextos 2D dos dois canvas onde os gráficos serão desenhados
        const ctx1 = document.getElementById('mediaPorAssuntoChart')?.getContext('2d');
        const ctx2 = document.getElementById('mediaPorPersonalChart')?.getContext('2d');
         // Verifica se os canvas foram encontrados no DOM
        if (!ctx1 || !ctx2) throw new Error('Elementos canvas para mediaPorAssuntoChart ou mediaPorPersonalChart não encontrados');

        // Destroi o gráfico anterior de média por assunto, se já existir
        if (mediaPorAssuntoChartInstance) {
            mediaPorAssuntoChartInstance.destroy();
            console.log('Gráfico mediaPorAssunto destruído');
        }
        // Cria uma nova instância do gráfico das médias por assunto, utilizando Chart.js
        mediaPorAssuntoChartInstance = new Chart(ctx1, {
            type: 'bar',
            data: {
                labels: Object.keys(dataAssunto),
                datasets: [{
                    label: 'Nota Média',
                    data: Object.values(dataAssunto),
                    backgroundColor: '#36A2EB'
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false },
                    datalabels: {
                        color: '#000',
                        font: {
                            family: 'Montserrat',
                            weight: 'bold',
                            size: 25
                        },
                        formatter: function(value) {
                            return value.toFixed(2);
                        },
                        anchor: 'center',
                        align: 'center'
                    }
                },
                scales: {
                    y: { 
                        beginAtZero: true,
                        max: 10,
                        ticks: {
                            stepSize: 1,
                            font: {
                                family: 'Montserrat',
                                weight: 'bold',
                                size: 20
                            }
                        }
                    },
                    x: {
                        ticks: {
                            font: {
                                family: 'Montserrat',
                                weight: 'bold',
                                size: 15
                            }
                        }
                    }
                }
            },
            plugins: [ChartDataLabels]
        });


        // Destroi o gráfico anterior de média por personal, se já existir
        if (mediaPorPersonalChartInstance) {
            mediaPorPersonalChartInstance.destroy();
            console.log('[fetchFeedbacksData] Gráfico mediaPorPersonal destruído');
        }

        // Cria uma nova instância do gráfico das médias por assunto, utilizando Chart.js
        mediaPorPersonalChartInstance = new Chart(ctx2, {
            type: 'bar', // Tipo do gráfico: barras
            data: {
                labels: Object.keys(dataPersonal), // Legenda dos assuntos
                datasets: [{
                    label: 'Nota Média',
                    data: Object.values(dataPersonal), // Valores das notas
                    backgroundColor: '#FF6384'
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false },
                    datalabels: {
                        color: '#000',
                        font: {
                            family: 'Montserrat',
                            weight: 'bold',
                            size: 25
                        },
                        formatter: function(value) {
                            return value.toFixed(2);
                        },
                        anchor: 'center',
                        align: 'center'
                    }
                },
                scales: {
                    y: { 
                        beginAtZero: true,
                        max: 10,
                        ticks: {
                            stepSize: 1,
                            font: {
                                family: 'Montserrat',
                                weight: 'bold',
                                size: 20
                            }
                        }
                    },
                    x: {
                        ticks: {
                            font: {
                                family: 'Montserrat',
                                weight: 'bold',
                                size: 15
                            }
                        }
                    }
                }
            },
            plugins: [ChartDataLabels]
        });

        // Exibe o container do gráfico na interface
        const container = document.getElementById('report-feedbacks-chart-container');
        if (container) container.style.display = 'block';

        // Exibe os insights dos dados abaixo do gráfico
        const explanation = document.getElementById('feedbacks-chart-explanation');
        if (explanation) {
            explanation.textContent = 'Notas por assunto revelam pontos fortes e fracos da academia, notas por personal mostram quem se destaca e quem precisa de melhoria e o filtro por data permite avaliar impacto de mudanças ao longo do tempo.';
            explanation.style.marginTop = '16px';
            explanation.style.marginBottom = '16px';
            explanation.style.fontSize = '20px';
            explanation.style.textAlign = 'center';
            explanation.style.fontWeight = 'bold';
        }
        // Loga sucesso ao exibir os gráficos
        console.log('Gráficos de feedbacks exibidos com sucesso');
    } catch (error) {
        // Loga o erro ao carregar os gráficos
        console.error('[fetchFeedbacksData] Erro:', error.message);
        alert('Erro ao carregar os gráficos de feedbacks.');
    }
}

// Busca e exibe o gráfico Personals x Agenda
async function fetchPersonalsAgendaData() {
    // Loga o início da função
    console.log('Buscando dados Personals x Agenda');
    try {
        // Busca os valores dos filtros de data e unidade selecionados
        const startDate = document.getElementById('start-date')?.value;
        const endDate = document.getElementById('end-date')?.value;
        let unidadeId = document.getElementById('unidade-select')?.value || '';
        unidadeId = unidadeId.replace(':', '').trim();
        const queryUnidade = unidadeId ? `&unidadeId=${unidadeId}` : '';

        // Realiza a requisição à API que retorna os dados do relatório
        const response = await fetch(`http://localhost:8080/api/relatorios/personals-agenda?start=${startDate}&end=${endDate}${queryUnidade}`);
        // Em caso de erro loga o código de status
        if (!response.ok) throw new Error(`Erro ao buscar dados: ${response.status}`);
        // Converte a resposta em JSON
        const data = await response.json();
        // Loga os dados recebidos
        console.log('Dados recebidos:', data);

        // Obtém o contexto 2D do canvas onde o gráfico será desenhado
        const ctx = document.getElementById('personalsAgendaChart')?.getContext('2d');
        // Verifica se a resposta foi bem-sucedida, caso não, loga o erro
        if (!ctx) throw new Error('Elemento canvas personalsAgendaChart não encontrado');

        // Se já houver um gráfico anterior desenhado, destrói antes de criar o novo
        if (personalAgendaChartInstance) {
            personalAgendaChartInstance.destroy();
            console.log('Gráfico existente destruído');
        }

        // Cria uma nova instância do gráfico utilizando Chart.js
        personalAgendaChartInstance = new Chart(ctx, {
            type: 'bar', // Tipo do gráfico: barras
            data: {
                labels: Object.keys(data),
                datasets: [{
                    label: '% de tempo ocupado por personal', // Legenda do conjunto de dados
                    data: Object.values(data), // Valores recebidos da API
                    backgroundColor: Object.values(data).map(value => {
                        if (value <= 50) return 'rgba(54, 162, 235, 0.6)'; // Azul para <= 50%
                        if (value <= 75) return 'rgba(246, 194, 62, 0.6)'; // Amarelo para 50% a 75%
                        return 'rgba(255, 99, 132, 0.6)'; // Vermelho para 75% a 100%
                    }),
                    borderColor: Object.values(data).map(value => {
                        if (value <= 50) return 'rgba(54, 162, 235, 1)';
                        if (value <= 75) return 'rgba(246, 194, 62, 1)';
                        return 'rgba(255, 99, 132, 1)';
                    }),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false },
                    datalabels: {
                        color: '#000',
                        font: {
                            family: 'Montserrat',
                            weight: 'bold',
                            size: 25
                        },
                        formatter: function(value) {
                            return value.toFixed(2);
                        },
                        anchor: 'center',
                        align: 'center'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true, // Eixo Y inicia no zero
                        max: 100, // Limita a barra a 100%
                        ticks: {
                            font: {
                                family: 'Montserrat',
                                weight: 'bold',
                                size: 20
                            },
                            // Define o "%" após o valor
                            callback: value => value + '%'
                        }
                    },
                    x: {
                        ticks: {
                            font: {
                                family: 'Montserrat',
                                weight: 'bold',
                                size: 15
                            }
                        }
                    }
                }
            },
            plugins: [ChartDataLabels]
        });

        // Exibe o container do gráfico na interface
        const container = document.getElementById('report-personals-chart-container');
        if (container) container.style.display = 'block';

        // Exibe os insights dos dados abaixo do gráfico
        const explanation = document.getElementById('personals-chart-explanation');
        if (explanation) {
            explanation.textContent = 'Revela quais profissionais estão mais ativos ou subutilizados, auxiliando no balanceamento de carga e otimização da equipe.';
            explanation.style.marginTop = '16px';
            explanation.style.marginBottom = '16px';
            explanation.style.fontSize = '20px';
            explanation.style.textAlign = 'center';
            explanation.style.fontWeight = 'bold';
        }
        // Loga sucesso ao exibir o gráfico
        console.log('Gráfico exibido com sucesso');
    } catch (error) {
        // Loga o erro ao carregar o gráfico
        console.error('[fetchPersonalsAgendaData] Erro:', error.message);
        alert('Erro ao carregar o gráfico de Personals x Agenda.');
    }
}

// Busca e exibe o gráfico Modalidades x Agenda
async function fetchModalidadesAgendaData() {
    // Loga o início da função
    console.log('Buscando dados Modalidades x Agenda');
    try {
        // Busca os valores dos filtros de data e unidade selecionados
        const startDate = document.getElementById('start-date')?.value;
        const endDate = document.getElementById('end-date')?.value;
        const unidadeId = document.getElementById('unidade-select')?.value || '';
        const queryUnidade = unidadeId ? `&unidadeId=${unidadeId}` : '';

        // Realiza a requisição à API que retorna os dados do relatório
        const response = await fetch(`http://localhost:8080/api/relatorios/modalidades-agenda?start=${startDate}&end=${endDate}${queryUnidade}`);
        // Em caso de erro loga o código de status
        if (!response.ok) throw new Error(`Erro ao buscar dados: ${response.status}`);
        // Converte a resposta em JSON
        const data = await response.json();
        // Loga os dados recebidos
        console.log('Dados recebidos:', data);

        // Obtém o contexto 2D do canvas onde o gráfico será desenhado
        const ctx = document.getElementById('modalidadesAgendaChart')?.getContext('2d');
        // Verifica se a resposta foi bem-sucedida, caso não, loga o erro
        if (!ctx) throw new Error('Elemento canvas modalidadesAgendaChart não encontrado');

        // Se já houver um gráfico anterior desenhado, destrói antes de criar o novo
        if (modalidadesAgendaChartInstance) {
            modalidadesAgendaChartInstance.destroy();
            console.log('Gráfico existente destruído');
        }

        // Cria uma nova instância do gráfico utilizando Chart.js
        modalidadesAgendaChartInstance = new Chart(ctx, {
            type: 'bar', // Tipo do gráfico: barras
            data: {
                labels: Object.keys(data), // Legenda do conjunto de dados
                datasets: [{
                    label: 'Porcentagem de Ocupação (%)',
                    data: Object.values(data), // Valores recebidos da API
                    backgroundColor: Object.values(data).map(value => {
                        if (value <= 50) return 'rgba(54, 162, 235, 0.6)'; // Azul para <= 50%
                        if (value <= 75) return 'rgba(246, 194, 62, 0.6)'; // Amarelo para 50% a 75%
                        return 'rgba(255, 99, 132, 0.6)'; // Vermelho para 75% a 100%
                    }),
                    borderColor: Object.values(data).map(value => {
                        if (value <= 50) return 'rgba(54, 162, 235, 1)';
                        if (value <= 75) return 'rgba(246, 194, 62, 1)';
                        return 'rgba(255, 99, 132, 1)';
                    }),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false },
                    datalabels: {
                        color: '#000',
                        font: {
                            family: 'Montserrat',
                            weight: 'bold',
                            size: 25
                        },
                        formatter: function(value) {
                            return value.toFixed(2);
                        },
                        anchor: 'center',
                        align: 'center'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true, // Eixo Y inicia no zero
                        max: 100, // Limita a barra a 100%
                        ticks: {
                            font: {
                                family: 'Montserrat',
                                weight: 'bold',
                                size: 20
                            },
                            callback: value => value + '%'
                        } // Define o "%" após o valor
                    },
                    x: {
                        ticks: {
                            font: {
                                family: 'Montserrat',
                                weight: 'bold',
                                size: 15
                            }
                        }
                    }
                }
            },
            plugins: [ChartDataLabels]
        });

        // Exibe o container do gráfico na interface
        const container = document.getElementById('report-modalidades-chart-container');
        if (container) container.style.display = 'block';

        // Exibe os insights dos dados abaixo do gráfico
        const explanation = document.getElementById('modalidades-chart-explanation');
        if (explanation) {
            explanation.textContent = 'Revela quais modalidades têm maior ocupação, ajudando a identificar as mais procuradas e as com baixa adesão.';
            explanation.style.marginTop = '16px';
            explanation.style.marginBottom = '16px';
            explanation.style.fontSize = '20px';
            explanation.style.textAlign = 'center';
            explanation.style.fontWeight = 'bold';
        }
        // Loga sucesso ao exibir o gráfico
        console.log('Gráfico exibido com sucesso');
    } catch (error) {
        // Loga o erro ao carregar o gráfico
        console.error('Erro:', error.message);
        alert('Erro ao carregar o gráfico de Modalidades x Agenda.');
    }
}

// Inicialização após o carregamento do DOM
document.addEventListener('DOMContentLoaded', () => {
    // Loga o início da função
    console.log('Inicializando dashboard');
    // Verifica o checkRole
    if (!checkRole()) return;

    // Preenche os dados do usuário
    fetchLoggedUser();
    // Preenche as estatísticas gerais
    fetchGeneralStatistics();
    // Preenche o select das unidades
    fetchUnidades();

    // Obtém referências aos elementos do HTML usados na geração de relatórios
    const generateReportButton = document.getElementById('generate-report');
    const reportTypeSelect = document.getElementById('report-type');
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');
    const unidadeSelect = document.getElementById('unidade-select');

    // Verifica se todos os elementos necessários estão presentes na tela
    if (!generateReportButton || !reportTypeSelect || !startDateInput || !endDateInput || !unidadeSelect) {
        // Loga o erro em caso de erro
        console.error('Elementos necessários do DOM não encontrados');
        return;
    }

    // Adiciona evento de clique ao botão para gerar o relatório com base nos filtros
    generateReportButton.addEventListener('click', fetchReportData);
    // Loga a adição
    console.log('Evento de clique adicionado ao botão generate-report');

    // Adiciona evento para reagir à mudança do tipo de relatório selecionado
    reportTypeSelect.addEventListener('change', () => {
        // Loga o relatório selecionado
        console.log('Tipo de relatório alterado:', reportTypeSelect.value);
        const selected = reportTypeSelect.value;
        // Desativa os inputs de data para o relatório "alunos-planos"
        const disableDates = selected === 'alunos-planos';
        // Desativa o input de unidade para os relatórios "alunos-modalidades" e "alunos-planos"
        const disableUnidade = selected === 'alunos-modalidades' || selected === 'alunos-planos';

        // Aplica os estados aos inputs
        startDateInput.disabled = disableDates;
        endDateInput.disabled = disableDates;
        unidadeSelect.disabled = disableUnidade;
        // Loga os novos estados dos campos
        console.log('Estados dos inputs atualizados - Datas:', disableDates, 'Unidade:', disableUnidade);
    });

    // Define os estados iniciais dos inputs com base no valor atual do select de relatório
    const selected = reportTypeSelect.value;
    const disableDates = selected === 'alunos-planos';
    const disableUnidade = selected === 'alunos-modalidades' || selected === 'alunos-planos';

    startDateInput.disabled = disableDates;
    endDateInput.disabled = disableDates;
    unidadeSelect.disabled = disableUnidade;
    // Loga os estados iniciais definidos
    console.log('Estados iniciais dos inputs - Datas:', disableDates, 'Unidade:', disableUnidade);
});