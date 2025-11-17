// =================================================================================
// VARIÁVEIS GLOBAIS E DADOS DOS FILTROS
// =================================================================================

let downloadStatusCache = {};

// --- INÍCIO DA MODIFICAÇÃO: Textos mais convincentes e didáticos ---
const filterExplanations = {
    '1': { 
        title: '<i class="fas fa-gamepad"></i> Excelente Escolha, Gamer!',
        content: `
            <p>Você selecionou a categoria forjada para a vitória. Estes sistemas transformam seu PC em uma máquina de combate, focada em uma única missão: entregar a <strong>maior taxa de FPS possível</strong> e eliminar o <strong>input lag</strong> que te custa a partida.</p>
            
            <h4>Benefícios-Chave:</h4>
            <ul class="benefit-list">
                <li><i class="fas fa-fighter-jet"></i> FPS nas Alturas</li>
                <li><i class="fas fa-bolt"></i> Zero Input Lag</li>
                <li><i class="fas fa-feather-alt"></i> Sistema Ultra Leve</li>
            </ul>

            <h4>Requisitos Mínimos:</h4>
            <ul class="specs-list">
                <li><i class="fas fa-memory"></i><div><strong>RAM:</strong><br>6 GB DDR3 ou superior</div></li>
                <li><i class="fas fa-microchip"></i><div><strong>Processador:</strong><br>Qualquer x64 de 1.7 GHz+</div></li>
                <li><i class="fas fa-desktop"></i><div><strong>Placa de Vídeo:</strong><br>2 GB (dedicada ou integrada)</div></li>
                <li><i class="fas fa-hdd"></i><div><strong>Armazenamento:</strong><br>SSD recomendado</div></li>
                <li><i class="fas fa-save"></i><div><strong>Espaço em Disco:</strong><br>Apenas 10-15 GB</div></li>
            </ul>
        `
    },
    '2': { 
        title: '<i class="fas fa-briefcase"></i> Decisão Inteligente para Negócios!',
        content: `
            <p>Você acaba de selecionar a categoria que transforma computadores em ativos de produtividade. Estes sistemas são a escolha certa para empresas que buscam <strong>eficiência, segurança e, acima de tudo, economia</strong>, dando vida nova a máquinas antigas.</p>

            <h4>Benefícios-Chave:</h4>
            <ul class="benefit-list">
                <li><i class="fas fa-tasks"></i> Multitarefa Real, Sem Travar</li>
                <li><i class="fas fa-piggy-bank"></i> Economia Inteligente</li>
                <li><i class="fas fa-shield-alt"></i> Segurança Focada</li>
            </ul>

            <h4>Requisitos Mínimos:</h4>
            <ul class="specs-list">
                <li><i class="fas fa-memory"></i><div><strong>RAM:</strong><br>4 GB para multitarefa fluida</div></li>
                <li><i class="fas fa-microchip"></i><div><strong>Processador:</strong><br>Qualquer Dual Core x64</div></li>
                <li><i class="fas fa-desktop"></i><div><strong>Placa de Vídeo:</strong><br>Qualquer uma (integrada)</div></li>
                <li><i class="fas fa-hdd"></i><div><strong>Armazenamento:</strong><br>Funciona em HD, voa em SSD</div></li>
                <li><i class="fas fa-save"></i><div><strong>Espaço em Disco:</strong><br>Apenas 8-12 GB</div></li>
            </ul>
        `
    },
    '3': { 
        title: '<i class="fas fa-home"></i> Perfeito para o Conforto de Casa!',
        content: `
            <p>Você escolheu a solução ideal para revitalizar o PC da família. Navegar na internet, assistir a filmes e ajudar nos trabalhos escolares se tornam experiências <strong>rápidas, leves e sem frustrações</strong>. É a forma mais econômica de dar um upgrade naquele notebook encostado.</p>

            <h4>Benefícios-Chave:</h4>
            <ul class="benefit-list">
                <li><i class="fas fa-magic"></i> Revitaliza PCs Antigos</li>
                <li><i class="fas fa-mouse-pointer"></i> Navegação Instantânea</li>
                <li><i class="fas fa-shield-alt"></i> Simples e Seguro</li>
            </ul>

            <h4>Requisitos Mínimos:</h4>
            <ul class="specs-list">
                <li><i class="fas fa-memory"></i><div><strong>RAM:</strong><br>2 GB (Sim, apenas 2 GB!)</div></li>
                <li><i class="fas fa-microchip"></i><div><strong>Processador:</strong><br>Qualquer x64 de 1.0 GHz+</div></li>
                <li><i class="fas fa-desktop"></i><div><strong>Placa de Vídeo:</strong><br>Qualquer uma (integrada)</div></li>
                <li><i class="fas fa-hdd"></i><div><strong>Armazenamento:</strong><br>Perfeito para HDs antigos</div></li>
                <li><i class="fas fa-save"></i><div><strong>Espaço em Disco:</strong><br>Apenas 8-10 GB</div></li>
            </ul>
        `
    },
    '4': { 
        title: '<i class="fas fa-drafting-compass"></i> Escolha de Mestre, Profissional!',
        content: `
            <p>Você selecionou os sistemas para quem constrói o futuro. Projetados para máxima estabilidade, eles liberam todo o potencial do seu hardware para softwares pesados como <strong>AutoCAD, Revit e Lumion</strong>, garantindo que sua criatividade nunca seja interrompida por um travamento.</p>

            <h4>Benefícios-Chave:</h4>
            <ul class="benefit-list">
                <li><i class="fas fa-cogs"></i> Estabilidade Absoluta</li>
                <li><i class="fas fa-clock"></i> Renderização Mais Rápida</li>
                <li><i class="fas fa-check-double"></i> Foco Total no Projeto</li>
            </ul>

            <h4>Requisitos Mínimos:</h4>
            <ul class="specs-list">
                <li><i class="fas fa-memory"></i><div><strong>RAM:</strong><br>8 GB DDR3 ou superior</div></li>
                <li><i class="fas fa-microchip"></i><div><strong>Processador:</strong><br>Core i5 / Ryzen 5+</div></li>
                <li><i class="fas fa-desktop"></i><div><strong>Placa de Vídeo:</strong><br>4 GB (dedicada)</div></li>
                <li><i class="fas fa-hdd"></i><div><strong>Armazenamento:</strong><br>SSD é essencial</div></li>
                <li><i class="fas fa-save"></i><div><strong>Espaço em Disco:</strong><br>Apenas 10-15 GB</div></li>
            </ul>
        `
    }
};
// --- FIM DA MODIFICAÇÃO ---

// =================================================================================
// RENDERIZAÇÃO E FILTRAGEM DE PRODUTOS (LÓGICA UNIFICADA)
// =================================================================================

function carregarProdutos() {
    aplicarFiltrosEPesquisa();
}

/**
 * ATUALIZADO: Função central que aplica filtros, sem a pesquisa.
 */
function aplicarFiltrosEPesquisa() {
    const productGrid = document.getElementById('product-grid');
    if (!productGrid) return;

    // Salva a posição de rolagem e a altura da grade para evitar saltos na tela
    const scrollY = window.scrollY;
    const gridHeight = productGrid.offsetHeight;
    if (gridHeight > 0) { // Só aplica a altura se a grade já tiver conteúdo
        productGrid.style.minHeight = `${gridHeight}px`;
    }

    // Limpa o conteúdo da grade (incluindo o loader inicial) antes de renderizar
    productGrid.innerHTML = '';

    const activeFilterPill = document.querySelector('.filter-pill.active');
    const activeFilterKey = activeFilterPill ? activeFilterPill.dataset.filterKey : 'todos';
    
    let produtosFiltrados = window.produtos || [];

    // 1. Aplica o filtro de categoria (pill)
    if (activeFilterKey !== 'todos') {
        produtosFiltrados = produtosFiltrados.filter(produto => 
            Array.isArray(produto.filtro) && (produto.filtro.includes(activeFilterKey) || produto.filtro.includes('AIO'))
        );
    }

    // 2. Renderiza o resultado final
    if (produtosFiltrados.length > 0) {
        produtosFiltrados.forEach(produto => {
            const productCard = criarProductCard(produto);
            productGrid.appendChild(productCard);
        });
        reattachEventListeners(productGrid);
        
        if (currentUser && typeof window.cart !== 'undefined' && window.cart.length > 0) {
            window.cart.forEach(item => atualizarBotoesAddCarrinho(item.code));
        }
    } else {
        productGrid.innerHTML = '<div class="placeholder-message">Nenhum produto encontrado com os critérios selecionados.</div>';
    }

    // Restaura a posição de rolagem para garantir uma atualização suave.
    window.scrollTo(0, scrollY);
    // Remove a altura mínima para que a grade se ajuste ao novo conteúdo
    productGrid.style.minHeight = '';
}


function criarProductCard(produto) {
    const productCard = document.createElement('div');
    productCard.className = 'product-card';
    
    if (isVIP) {
        productCard.classList.add('vip-product');
    }
    
    if (produto.code.toString() === '360') {
        productCard.classList.add('vip-subscription-card');
    }

    productCard.dataset.id = produto.code;
    productCard.dataset.filtro = Array.isArray(produto.filtro) ? produto.filtro.join(',') : '';

    const imagemCapa = produto.imagem || 'assets/placeholder.jpg';
    const qtdImagens = (produto.imagensAdicionais?.length || 0) + (produto.imagem ? 1 : 0);

    let nomeProduto = produto.nome;
    let versaoProduto = produto.versao || '';
    
    const isGratuito = produto.valorAvulso !== undefined && (parseFloat(produto.valorAvulso) <= 0 && parseFloat(produto.valorPromocao) <= 0);
    
    const displayPreco = getPrecoDisplay(produto, isGratuito);
    const isPromocao = produto.temPromocao && parseFloat(produto.valorPromocao) > 0;
    let promocaoBadge = '';

    if (isVIP && !isGratuito) {
        promocaoBadge = `<div class="vip-discount-badge"><div class="vip-discount-badge-content"><span class="vip-discount-text">DESCONTO VIP</span></div></div>`;
    } else if (!isVIP && isPromocao) {
        const valorAvulsoNum = parseFloat(produto.valorAvulso);
        const valorPromocaoNum = parseFloat(produto.valorPromocao);
        let porcentagemDesconto = 0;

        if (valorAvulsoNum > 0 && valorPromocaoNum > 0) {
            porcentagemDesconto = calcularPorcentagemDesconto(valorAvulsoNum, valorPromocaoNum);
        }
        if (porcentagemDesconto > 0) {
            promocaoBadge = `<div class="promocao-badge"><div class="promocao-badge-content"><span class="promocao-text">PROMOÇÃO</span><span class="promocao-percent">-${porcentagemDesconto}%</span></div></div>`;
        } else {
            promocaoBadge = `<div class="promocao-badge"><div class="promocao-badge-content"><span class="promocao-text">PROMOÇÃO</span></div></div>`;
        }
    }

    let botoesHTML = '';
    
    if (currentUser) {
        if (isGratuito) {
            botoesHTML = `
                <button class="details-label" data-code="${produto.code}"><i class="fas fa-info-circle"></i> Detalhes</button>
                <button class="rescue-btn" data-id="${produto.code}" id="rescue-btn-${produto.code}"><span><i class="fas fa-gift"></i> Resgatar</span><div class="spinner"></div></button>
            `;
        } else if (produto.code.toString() === '360') {
            botoesHTML = `
                <button class="details-label" data-code="${produto.code}"><i class="fas fa-info-circle"></i> Detalhes</button>
                <button class="subscribe-vip" data-id="${produto.code}" id="subscribe-btn-${produto.code}"><span><i class="fas fa-crown"></i> Assinar</span><div class="spinner"></div></button>
            `;
        } else {
            botoesHTML = `
                <button class="details-label" data-code="${produto.code}"><i class="fas fa-info-circle"></i> Detalhes</button>
                <button class="add-to-cart" data-id="${produto.code}"><i class="fas fa-cart-plus"></i> Adicionar</button>
            `;
        }
    } else { 
        botoesHTML = `
            <button class="details-label" data-code="${produto.code}"><i class="fas fa-info-circle"></i> Detalhes</button>
            <button class="add-to-cart" onclick="redirectToLogin()"><i class="fas fa-sign-in-alt"></i> Login</button>
        `;
    }

    productCard.innerHTML = `
        <div class="product-img-container">
            <img src="${imagemCapa}" alt="${produto.nome}" class="product-img">
            ${promocaoBadge}
            ${qtdImagens > 1 ? `<div class="gallery-icon" title="${qtdImagens} imagens disponíveis"><i class="fas fa-images"></i> Ver galeria</div>` : ''}
        </div>
        <div class="product-info">
            <h3 class="product-title">${nomeProduto}</h3>
            ${versaoProduto ? `<div class="product-version">${versaoProduto}</div>` : ''}
            <div class="product-price-container">${displayPreco}</div>
            <div class="product-buttons">${botoesHTML}</div>
        </div>
    `;

    return productCard;
}


function getPrecoDisplay(produto, isGratuito = false) {
    if (!currentUser) {
        if (produto.valorAvulso === undefined) {
             return '<span class="product-price-login-prompt">Faça login para ver preços</span>';
        }
    }

    const valorAvulso = parseFloat(produto.valorAvulso) || 0;
    const valorPromocao = parseFloat(produto.valorPromocao) || 0;
    const valorAssinante = parseFloat(produto.valorAssinante) || 0;
    const temPromocao = produto.temPromocao || (valorPromocao > 0);
    let htmlPreco = '';

    if (isGratuito) {
        const precoAntigoHTML = valorAvulso > 0 ? `<span class="product-price-old">${formatarMoeda(valorAvulso)}</span>` : '';
        htmlPreco = `${precoAntigoHTML}<span class="product-price-highlight">Grátis</span>`;
    } else if (isVIP && valorAssinante > 0) {
        htmlPreco = `<span class="product-price-old">${formatarMoeda(valorAvulso)}</span><span class="product-price-highlight vip-price">${formatarMoeda(valorAssinante)}</span>`;
    } else if (temPromocao) {
        htmlPreco = `<span class="product-price-old">${formatarMoeda(valorAvulso)}</span><span class="product-price-highlight">${formatarMoeda(valorPromocao)}</span>`;
    } else {
        htmlPreco = `<span class="product-price">${formatarMoeda(valorAvulso)}</span>`;
    }
    return htmlPreco;
}


function calcularPorcentagemDesconto(valorOriginal, valorPromocional) {
    if (!valorOriginal || !valorPromocional || valorOriginal <= 0) return 0;
    const desconto = ((valorOriginal - valorPromocional) / valorOriginal) * 100;
    return Math.round(desconto);
}

// =================================================================================
// RENDERIZAÇÃO DE PRODUTOS COMPRADOS
// =================================================================================

function criarProdutoCompradoCard(produto, dataCompra, numeroPedido) {
    const productCard = document.createElement('div');
    productCard.className = 'product-card purchased-product';
    productCard.dataset.id = produto.code;
    productCard.dataset.categoria = produto.categoria || 'comprado';
    
    if (produto.code.toString() === '360') {
        productCard.classList.add('vip-subscription-card');
    }

    const imagemCapa = produto.imagem || 'assets/placeholder.jpg';
    let nomeProduto = produto.nome;
    let versaoProduto = produto.versao || ''; 

    if (produto.code.toString() === '360') {
        if (versaoProduto) {
            nomeProduto = versaoProduto; 
            versaoProduto = ''; 
        }
    } else {
        if (!versaoProduto) {
            const matchVersions = produto.nome.match(/(Windows|Office)\s+(\d+)(\s|\w|\d)+/i);
            if (matchVersions) {
                const indexSeparacao = produto.nome.indexOf(matchVersions[2]) + matchVersions[2].length;
                nomeProduto = produto.nome.substring(0, indexSeparacao).trim();
                versaoProduto = produto.nome.substring(indexSeparacao).trim();
            }
        }
    }

    const botaoDownloadHTML = produto.downloadDisponivel
        ? `<button class="download-btn" data-code="${produto.code}"><i class="fas fa-download"></i> Download</button>`
        : `<button class="download-btn" data-code="${produto.code}" disabled><i class="fas fa-clock"></i> Acesso Expirado</button>`;

    productCard.innerHTML = `
        <div class="product-img-container">
            <img src="${imagemCapa}" alt="${produto.nome}" class="product-img">
            <div class="purchase-date-badge"><div class="purchase-date-content"><span class="purchase-date-text">COMPRADO EM</span><span class="purchase-date">${dataCompra}</span></div></div>
            <div class="gallery-icon" title="Ver imagem ampliada"><i class="fas fa-images"></i> Ver galeria</div>
        </div>
        <div class="product-info">
            <h3 class="product-title">${nomeProduto}</h3>
            ${versaoProduto ? `<div class="product-version">${versaoProduto}</div>` : ''}
            <div class="product-price-container"><span class="product-pedido-number">Pedido: #${numeroPedido}</span></div>
            <div class="product-buttons">
                <button class="details-label" data-code="${produto.code}"><i class="fas fa-info-circle"></i> Detalhes</button>
                ${botaoDownloadHTML}
            </div>
        </div>
    `;

    return productCard;
}


// =================================================================================
// FILTRAGEM E EVENT LISTENERS
// =================================================================================

function pesquisarProdutos() {
    aplicarFiltrosEPesquisa();
}

function displayFilterExplanation(filterKey) {
    const explanationContainer = document.getElementById('filter-explanation-container');
    if (!explanationContainer) return;

    const currentBox = explanationContainer.querySelector('.filter-explanation-box');
    if (currentBox) {
        currentBox.classList.remove('active');
    }
    
    setTimeout(() => {
        const explanationData = filterExplanations[filterKey];
        
        if (explanationData) {
            explanationContainer.innerHTML = `
                <div class="filter-explanation-box">
                    <h3>${explanationData.title}</h3>
                    ${explanationData.content}
                </div>
            `;
            setTimeout(() => {
                const newBox = explanationContainer.querySelector('.filter-explanation-box');
                if(newBox) newBox.classList.add('active');
            }, 10);
        } else {
            explanationContainer.innerHTML = '';
        }
    }, 250);
}

// --- MODIFICAÇÃO: Lógica para múltiplos Guias Interativos e estado inicial para usuários logados ---
function initFilters() {
    const filterGuides = document.querySelectorAll('.filter-guide');
    const justLoggedIn = sessionStorage.getItem('justLoggedIn') === 'true';

    // Se o usuário acabou de fazer login, resetamos o estado salvo dos guias.
    // Isso garante que o estado de "visitante" (guia expandido) não persista.
    if (justLoggedIn) {
        Object.keys(sessionStorage).forEach(key => {
            if (key.startsWith('filterGuideState-')) {
                sessionStorage.removeItem(key);
            }
        });
        sessionStorage.removeItem('justLoggedIn');
    }
    
    filterGuides.forEach(guide => {
        const guideHeader = guide.querySelector('.filter-guide-header');
        const guideId = guide.id;
        const storageKey = `filterGuideState-${guideId}`;
        const hasSessionState = sessionStorage.getItem(storageKey) !== null;

        // A lógica original agora funciona corretamente, pois o estado conflitante foi removido.
        if (hasSessionState) {
            if (sessionStorage.getItem(storageKey) === 'collapsed') {
                guide.classList.add('collapsed');
            } else {
                guide.classList.remove('collapsed');
            }
        } else {
            // Aplica a lógica padrão se não houver estado salvo na sessão.
            if (guide.id === 'filter-guide-main') {
                if (currentUser) {
                    guide.classList.add('collapsed');
                } else {
                    guide.classList.remove('collapsed');
                }
            } else {
                // Todos os outros guias começam recolhidos por padrão.
                guide.classList.add('collapsed');
            }
        }

        guideHeader?.addEventListener('click', () => {
            guide.classList.toggle('collapsed');
            // Salva o novo estado (recolhido ou expandido) na sessão.
            if (guide.classList.contains('collapsed')) {
                sessionStorage.setItem(storageKey, 'collapsed');
            } else {
                sessionStorage.setItem(storageKey, 'expanded');
            }
        });
    });

    // Adiciona listener para o link interno da aba "Conhecer"
    document.querySelectorAll('.guide-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation(); // Impede que o guia se feche ao clicar no link
            const tabId = this.getAttribute('data-tab');
            // Encontra o botão de navegação correspondente (desktop ou mobile) e o clica
            const targetTabButton = document.querySelector(`.header-nav-btn[data-tab="${tabId}"], .bottom-nav-item[data-tab="${tabId}"]`);
            if (targetTabButton) {
                targetTabButton.click();
            }
        });
    });
    
    const filterPills = document.querySelectorAll('.filter-pill');
    filterPills.forEach(pill => {
        pill.addEventListener('click', function() {
            filterPills.forEach(p => p.classList.remove('active'));
            this.classList.add('active');
            
            const filterKey = this.dataset.filterKey;
            displayFilterExplanation(filterKey);
            aplicarFiltrosEPesquisa();
        });
    });

    displayFilterExplanation('todos');
}

function reattachEventListeners(container) {
    const isPedidos = container.closest('#pedidos-list');
    
    container.querySelectorAll('.details-label').forEach(button => {
        const code = button.getAttribute('data-code');
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            if(typeof window.openProductDetails === 'function') {
                window.openProductDetails(code, isPedidos ? 'pedido' : 'loja');
            }
        });
    });

    if (isPedidos) {
        container.querySelectorAll('.download-btn').forEach(button => {
            if (button.disabled) {
                button.addEventListener('click', (e) => {
                    e.stopPropagation();
                    mostrarModalErroDownload('Seu acesso de 24 horas expirou. Apenas membros VIP têm acesso ilimitado aos downloads.');
                });
                return;
            };

            const code = button.getAttribute('data-code');
            button.addEventListener('click', function(e) {
                e.stopPropagation();
                
                const originalText = this.innerHTML;
                this.innerHTML = '<span><i class="fas fa-spinner fa-spin"></i> Verificando...</span>';
                this.disabled = true;

                fetchAPI(`${scriptURL}?action=getDownloadLink&email=${encodeURIComponent(currentUser)}&code=${code}`)
                    .then(res => {
                        if (res.sucesso && res.link) {
                            mostrarNotificacao('Acesso liberado! Abrindo link...', 'sucesso');
                            window.open(res.link, '_blank');
                        } else {
                            mostrarModalErroDownload(res.mensagem || 'Não foi possível obter o link.');
                        }
                    })
                    .catch(err => {
                        console.error('Erro ao buscar link de download:', err);
                        mostrarNotificacao('Erro de rede. Tente novamente.', 'erro');
                    })
                    .finally(() => {
                        this.innerHTML = originalText;
                        this.disabled = false;
                    });
            });
        });
    } else {
        container.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', function(e) {
                e.stopPropagation();
                handleAddToCart(this.getAttribute('data-id'));
            });
        });

        container.querySelectorAll('.rescue-btn').forEach(button => {
            button.addEventListener('click', function(e) {
                e.stopPropagation();
                handleResgatarProduto(this.getAttribute('data-id'));
            });
        });

        container.querySelectorAll('.subscribe-vip').forEach(button => {
            button.addEventListener('click', function(e) {
                e.stopPropagation();
                if (typeof checkoutDiretoVIP === 'function') {
                    if (!currentUser) {
                        redirectToLogin();
                        return;
                    }
                    checkoutDiretoVIP(this.getAttribute('data-id'), this.id);
                } else {
                    console.error("Função checkoutDiretoVIP não encontrada.");
                    mostrarNotificacao("Erro ao processar assinatura.", "erro");
                }
            });
        });
    }

    container.querySelectorAll('.product-img, .gallery-icon').forEach(element => {
        const card = element.closest('.product-card');
        if(card) {
            const code = card.dataset.id;
            element.addEventListener('click', function(e) {
                e.stopPropagation();
                if (typeof window.abrirGaleriaUnificada === 'function') {
                    window.abrirGaleriaUnificada(code);
                }
            });
        }
    });
}

function handleAddToCart(code) {
    if (!currentUser) {
        redirectToLogin();
        return;
    }
    if (typeof window.adicionarAoCarrinho === 'function') {
        window.adicionarAoCarrinho(code);
    }
}