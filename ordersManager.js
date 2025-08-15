// =================================================================================
// VARIÁVEIS GLOBAIS E CACHE LOCAL
// =================================================================================

let pedidosLocaisCache = [];
let isSyncing = false;

// =================================================================================
// FUNÇÕES DE RENDERIZAÇÃO DA UI
// =================================================================================

function _renderizarListaDePedidos(itensParaExibir) {
    const pedidosList = document.getElementById('pedidos-list');
    if (!pedidosList) return;

    pedidosList.innerHTML = '';
    pedidosList.className = 'product-grid';

    if (!itensParaExibir || itensParaExibir.length === 0) {
        pedidosList.innerHTML = '<div class="placeholder-message">Você ainda não realizou nenhuma compra.</div>';
        return;
    }

    itensParaExibir.forEach(item => {
        let dataFormatada = 'Data indisponível';
        try {
            const data = new Date(item.dataCompra);
            if (!isNaN(data.getTime())) {
                dataFormatada = `${data.getDate().toString().padStart(2, '0')}/${(data.getMonth() + 1).toString().padStart(2, '0')}/${data.getFullYear()} às ${data.getHours().toString().padStart(2, '0')}:${data.getMinutes().toString().padStart(2, '0')}`;
            }
        } catch (dateError) {
            console.error("Erro ao formatar data do item:", dateError);
        }
        
        const productCard = criarProdutoCompradoCard(item, dataFormatada, item.numeroPedido);
        if (productCard) {
            pedidosList.appendChild(productCard);
        }
    });
    
    reattachEventListeners(pedidosList);
}

// =================================================================================
// LÓGICA PRINCIPAL DE CARREGAMENTO E SINCRONIZAÇÃO
// =================================================================================

function carregarPedidos() {
    const pedidosList = document.getElementById('pedidos-list');
    if (!pedidosList) return;

    if (pedidosLocaisCache.length > 0) {
        _renderizarListaDePedidos(pedidosLocaisCache);
    } else {
        pedidosList.innerHTML = '<div class="placeholder-message">Sincronizando e carregando seus produtos...</div>';
    }

    _sincronizarPedidosEmSegundoPlano();
}

async function _sincronizarPedidosEmSegundoPlano() {
    if (isSyncing) {
        console.log("Sincronização já em andamento.");
        return;
    }
    isSyncing = true;
    
    const syncIndicator = document.getElementById('sync-status-indicator');
    if (syncIndicator) syncIndicator.classList.add('show');

    try {
        await sincronizarStatusDoBackend();

        const response = await fetch(`${scriptURL}?action=listarPedidos&email=${encodeURIComponent(currentUser)}`);
        if (!response.ok) throw new Error(`Resposta do servidor: ${response.status}`);
        
        const res = await response.json();
        if (!res.sucesso) throw new Error(res.mensagem || 'Erro ao buscar produtos.');

        const todosOsItensNovos = _processarPedidosDaAPI(res.pedidos);

        const cacheAtualString = JSON.stringify(pedidosLocaisCache.map(p => p.code).sort());
        const novosItensString = JSON.stringify(todosOsItensNovos.map(p => p.code).sort());

        if (cacheAtualString !== novosItensString) {
            console.log("Alterações detectadas. Atualizando a lista de produtos comprados.");
            pedidosLocaisCache = todosOsItensNovos;
            _renderizarListaDePedidos(pedidosLocaisCache);
        } else {
            console.log("Nenhuma alteração nos produtos. A UI permanece a mesma.");
        }

    } catch (err) {
        console.error('Erro na sincronização em segundo plano:', err);
        mostrarNotificacao('Falha ao sincronizar com o servidor.', 'erro');
    } finally {
        if (syncIndicator) syncIndicator.classList.remove('show');
        isSyncing = false;
    }
}

function _processarPedidosDaAPI(pedidosAPI) {
    if (!pedidosAPI || pedidosAPI.length === 0) {
        return [];
    }
    
    let todosOsItens = [];
    pedidosAPI.forEach(pedidoJson => {
        try {
            const pedido = typeof pedidoJson === 'string' ? JSON.parse(pedidoJson) : pedidoJson;
            if (!pedido || !pedido.itens) return;
            const itens = typeof pedido.itens === 'string' ? JSON.parse(pedido.itens) : pedido.itens;
            
            itens.forEach(item => {
                if (item && item.nome) {
                    todosOsItens.push({ ...item, dataCompra: pedido.data, numeroPedido: pedido.numero });
                }
            });
        } catch (error) {
            console.error('Erro ao processar um pedido específico:', error, pedidoJson);
        }
    });

    const itemVip = todosOsItens.find(item => item.code.toString() === '360');
    const outrosItens = todosOsItens.filter(item => item.code.toString() !== '360');
    outrosItens.sort((a, b) => new Date(b.dataCompra || 0) - new Date(a.dataCompra || 0));
    
    const itensParaExibir = [];
    if (itemVip) itensParaExibir.push(itemVip);
    itensParaExibir.push(...outrosItens);

    return itensParaExibir;
}


// =================================================================================
// FUNÇÃO DE SINCRONIZAÇÃO DE ESTADO
// =================================================================================

function sincronizarStatusDoBackend() {
    return new Promise((resolve, reject) => {
        const currentUser = sessionStorage.getItem('currentUser');
        if (!currentUser) {
            return reject('Usuário não logado.');
        }

        fetch(`${scriptURL}?action=sincronizarStatusUsuario&email=${encodeURIComponent(currentUser)}`)
            .then(res => res.json())
            .then(res => {
                if (res.sucesso) {
                    const eraVIP = sessionStorage.getItem('isVIP') === 'true';
                    if (res.isVIP !== eraVIP) {
                        console.log("Status VIP alterado! Atualizando estado global.");
                        sessionStorage.setItem('isVIP', res.isVIP.toString());
                        if (typeof updateUserInterface === 'function') updateUserInterface();
                        if (typeof carregarProdutosDaPlanilha === 'function') carregarProdutosDaPlanilha();
                    }
                    resolve();
                } else {
                    console.error("Falha na sincronização:", res.mensagem);
                    reject(res.mensagem);
                }
            })
            .catch(err => {
                console.error('Erro de rede ao sincronizar status:', err);
                reject(err);
            });
    });
}