// ='ordersManager.js' - Gerenciador da aba "Meus Produtos"

// =================================================================================
// VARIÁVEIS GLOBAIS
// =================================================================================

// A variável `pedidosLocaisCache` não é mais necessária, pois os dados são
// carregados de forma definitiva na variável global `window.produtosComprados`.
let isSyncing = false; // Mantida para evitar renderizações múltiplas acidentais

// =================================================================================
// FUNÇÕES DE RENDERIZAÇÃO DA UI
// =================================================================================

/**
 * AJUSTE: A antiga função 'carregarPedidos' foi renomeada e simplificada.
 * Ela agora apenas RENDERIZA os dados da variável global `window.produtosComprados`,
 * que foi populada pela chamada única de API na inicialização da aplicação.
 * Não há mais chamadas de API neste arquivo.
 */
function renderizarPedidos() {
    const pedidosList = document.getElementById('pedidos-list');
    if (!pedidosList || isSyncing) {
        return;
    }

    isSyncing = true;
    pedidosList.innerHTML = ''; // Limpa a lista antes de renderizar
    pedidosList.className = 'product-grid';

    // --- INÍCIO DA MODIFICAÇÃO: Card de informações otimizado ---
    const infoCard = document.createElement('div');
    infoCard.className = 'orders-info-card';
    infoCard.innerHTML = `
        <p class="info-line">
            <i class="fas fa-exclamation-triangle icon-warning"></i>
            <span><strong>Regra de Acesso (24h):</strong> Para membros padrão, o link de download fica ativo por <strong>24 horas</strong>. Salve-o em local seguro! O acesso ao sistema é vitalício, mas o link expira. A assinatura VIP (opcional) garante acesso ilimitado.</span>
        </p>
        <p class="info-line">
            <i class="fas fa-desktop icon-tip"></i>
            <span><strong>Dica de Download:</strong> Para uma melhor experiência, utilize um <strong>computador</strong> e fique atento para que seu navegador não bloqueie a abertura da nova aba (pop-up) de download.</span>
        </p>
        <div class="info-footer">
            <a href="#" class="manual-link"><i class="fas fa-book-open"></i> Dúvidas? Consulte o manual completo</a>
        </div>
    `;

    infoCard.querySelector('.manual-link').addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const manualTabButton = document.querySelector('#menu-instructions, .header-nav-btn[data-tab="manual"]');
        if (manualTabButton) {
            manualTabButton.click();
        }
    });
    pedidosList.appendChild(infoCard);
    // --- FIM DA MODIFICAÇÃO ---

    // A variável global `window.produtosComprados` já contém a lista de pedidos e seus itens.
    if (!window.produtosComprados || window.produtosComprados.length === 0) {
        const placeholder = document.createElement('div');
        placeholder.className = 'placeholder-message';
        placeholder.textContent = 'Você ainda não realizou nenhuma compra.';
        placeholder.style.gridColumn = '1 / -1';
        pedidosList.appendChild(placeholder);
        
        isSyncing = false;
        return;
    }

    // Transforma a estrutura de [pedido > itens] em uma lista plana de [itens],
    // adicionando as informações do pedido a cada item.
    const todosOsItensComprados = window.produtosComprados.flatMap(pedido => 
        (pedido.itens || []).map(item => ({
            ...item,
            dataCompra: pedido.data,
            numeroPedido: pedido.numero
        }))
    );
    
    // Ordena os itens para exibição: Assinatura VIP primeiro, depois os mais recentes.
    const itemVip = todosOsItensComprados.find(item => item.code.toString() === '360');
    const outrosItens = todosOsItensComprados.filter(item => item.code.toString() !== '360');
    outrosItens.sort((a, b) => new Date(b.dataCompra || 0) - new Date(a.dataCompra || 0));
    
    const itensParaExibir = [];
    if (itemVip) {
        itensParaExibir.push(itemVip);
    }
    itensParaExibir.push(...outrosItens);


    if (itensParaExibir.length === 0) {
         const placeholder = document.createElement('div');
        placeholder.className = 'placeholder-message';
        placeholder.textContent = 'Você ainda não realizou nenhuma compra.';
        placeholder.style.gridColumn = '1 / -1';
        pedidosList.appendChild(placeholder);

        isSyncing = false;
        return;
    }

    // Itera sobre a lista plana de itens e cria um card para cada um
    itensParaExibir.forEach(item => {
        let dataFormatada = 'Data indisponível';
        try {
            const data = new Date(item.dataCompra);
            if (!isNaN(data.getTime())) {
                dataFormatada = `${data.getDate().toString().padStart(2, '0')}/${(data.getMonth() + 1).toString().padStart(2, '0')}/${data.getFullYear()}`;
            }
        } catch (dateError) {
            console.error("Erro ao formatar data do item comprado:", dateError, item);
        }
        
        // A função criarProdutoCompradoCard (de productManager.js) já foi ajustada
        // para usar a flag `item.downloadDisponivel` para montar o botão de download.
        const productCard = criarProdutoCompradoCard(item, dataFormatada, item.numeroPedido);
        if (productCard) {
            pedidosList.appendChild(productCard);
        }
    });
    
    // Reatribui os event listeners para os novos cards criados
    if(typeof reattachEventListeners === 'function') {
        reattachEventListeners(pedidosList);
    }

    isSyncing = false;
}