// Função para preencher os dados do comprovante do pagamento
function carregarDadosPagamento() {
    // Recupera os parâmetros da URL
    const params = new URLSearchParams(window.location.search);
    const mes = params.get("mes");
    const ano = params.get("ano");
    const dataPagamento = params.get("dataPagamento");

    // Se algum dado estiver ausente, mostra alerta e redireciona ára a página anterior
    if (!mes || !ano || !dataPagamento) {
        alert("Dados insuficientes para carregar o comprovante.");
        window.location.href = "payments.html";
        return;
    }

    // Preenche os elementos da tela com os dados da URL
    document.getElementById("mes").textContent = mes;
    document.getElementById("ano").textContent = ano;
    // Formata a data do pagamento
    document.getElementById("data-pagamento").textContent = formatDateToPtBr(dataPagamento);
}

// Função para voltar para a página anterior
function voltar() {
    window.history.back();
}