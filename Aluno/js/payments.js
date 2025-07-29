async function carregarTabelaPagamentos(email) {
    try {
        // Faz uma requisição GET ao endpoint da API com o email
        const response = await fetch(`http://localhost:8080/api/pagamentos/status?email=${encodeURIComponent(email)}`);

        // Verifica se a resposta foi bem-sucedida, se não, loga o código do status do erro
        if (!response.ok) {
            throw new Error('Erro ao buscar dados do usuário: ' + response.status);
        }

        // Converte a resposta para JSON e loga os dados recebidos
        const data = await response.json();
        console.log("Pagamentos recebidos:", data);

        // Referencia e limpa a tabela de pagamentos do usuário
        const tbody = document.getElementById("tabela-pagamentos");
        tbody.innerHTML = '';

        // Itera sobre cada item de pagamento retornado pela API
        data.forEach(item => {
            const tr = document.createElement("tr"); // Cria uma nova linha da tabela

            // Cria a célula da vigência no formato "Mês/Ano"
            const vigencia = `${item.mes}/${item.ano}`;
            const tdVigencia = document.createElement("td");
            tdVigencia.textContent = vigencia;

            // Cria a célula do status do pagamento
            const tdStatus = document.createElement("td");
            const spanStatus = document.createElement("span");
            spanStatus.classList.add("badge");

            // Recupera mês e ano atual para comparação
            const dataAtual = new Date();
            const mesAtual = dataAtual.getMonth() + 1;
            const anoAtual = dataAtual.getFullYear();

            // Converte o mês textual para número usando uma função auxiliar
            const mesItemNumero = obterNumeroMes(item.mes);
            const anoItem = item.ano;

            // Define status de pagamento (Pago, Atrasado, ou À vencer), estiliza os badges de status do pagamento
            if (item.pago) {
                spanStatus.classList.add("uptodate");
                spanStatus.textContent = "Pago";
            } else {
                const mesEhPassado = anoItem < anoAtual || (anoItem === anoAtual && mesItemNumero < mesAtual);

                if (mesEhPassado) {
                    spanStatus.classList.add("late");
                    spanStatus.textContent = "Atrasado";
                } else {
                    spanStatus.classList.add("upfront");
                    spanStatus.textContent = "À vencer";
                }
            }
            // Adiciona o status à célula
            tdStatus.appendChild(spanStatus);

            // Cria a célula das ações (botões), estiliza os botões
            const tdAcoes = document.createElement("td");
            const button = document.createElement("button");
            button.classList.add("edit-button");

            // Define o texto e comportamento do botão com base no status de pagamento
            if (item.pago) {
                button.textContent = "Comprovante";
                // Ao clicar no botão, passa o mês, ano e data do pagamento via URL
                button.onclick = () => {
                    const url = `payment-view.html?mes=${encodeURIComponent(item.mes)}&ano=${item.ano}&dataPagamento=${item.dataPagamento}`;
                    window.location.href = url;
                };
            } else {
                // Chama função de pagamento
                button.textContent = "Pagar";
                button.onclick = () => pagarMes(email, item.idMes);
            }
            // Adiciona botão à célula
            tdAcoes.appendChild(button);

            // Adiciona as células à linha
            tr.appendChild(tdVigencia);
            tr.appendChild(tdStatus);
            tr.appendChild(tdAcoes);
            // Adiciona as células à linha
            tbody.appendChild(tr);
        });
    } catch (error) {
        // Loga qualquer erro ocorrido durante o processo
        console.error("Erro ao carregar tabela de pagamentos:", error);
        alert("Erro ao carregar tabela de pagamentos.");
    }
}

async function pagarMes(email, idMes) {
    // Verifica a confirmação da ação
    if (!confirm("Confirmar pagamento?")) return;

    try {
        // Faz uma requisição POST ao endpoint da API com o email do usuário e o ID do mês
        const response = await fetch(`http://localhost:8080/api/pagamentos/registrar?email=${encodeURIComponent(email)}&idMes=${idMes}`, {
            method: 'POST'
        });

        // Verifica se a resposta foi bem-sucedida, se não, loga o código do status do erro
        if (!response.ok) {
            const errorMessage = await response.text();
            throw new Error(errorMessage || `Erro ao buscar dados do usuário: ' + ${response.status}`);
        }

        // Alerta o sucesso e recarrega a tabela atualizada
        alert("Pagamento registrado com sucesso!");
        carregarTabelaPagamentos(email);
    } catch (error) {
        // Loga qualquer erro ocorrido durante o processo
        console.error("Erro ao registrar pagamento:", error);
        alert(error.message);
    }
}