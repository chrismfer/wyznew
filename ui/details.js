// =================================================================================
// CACHE DE DETALHES E FORMATAÇÃO
// =================================================================================

// Este cache será populado UMA ÚNICA VEZ após a carga inicial dos dados da loja.
const detalhesCache = {};

function formatarMoedaSegura(valor) {
    const numero = Number(valor) || 0;
    return numero.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Função para popular o cache de detalhes a partir dos dados já carregados.
// Esta função deve ser chamada em `core.js` após a chamada `getInitialStoreData`.
function popularDetalhesCache(produtosDaLoja, produtosComprados) {
    // Processa produtos da loja
    if (Array.isArray(produtosDaLoja)) {
        produtosDaLoja.forEach(produto => {
            if (produto && produto.code) {
                detalhesCache[produto.code] = {
                    descricao: produto.descricao || 'Descrição não disponível.',
                    imagens: [produto.imagem, ...(produto.imagensAdicionais || [])].filter(Boolean)
                };
            }
        });
    }

    // Processa produtos já comprados
    if (Array.isArray(produtosComprados)) {
        produtosComprados.forEach(pedido => {
            if (pedido && Array.isArray(pedido.itens)) {
                pedido.itens.forEach(item => {
                    if (item && item.code && !detalhesCache[item.code]) { // Adiciona apenas se não existir
                        detalhesCache[item.code] = {
                            descricao: item.descricao || 'Descrição não disponível.',
                            imagens: [item.imagem, ...(item.imagensAdicionais || [])].filter(Boolean)
                        };
                    }
                });
            }
        });
    }
    console.log("Cache de detalhes populado com os dados iniciais.");
}


// =================================================================================
// FUNCIONALIDADE PRINCIPAL DE DETALHES (SEM API CALLS)
// =================================================================================

function openProductDetails(code, source = 'loja') {
    let produto;
    let isPurchased = source === 'pedido' || source === 'pedidos';

    // Busca o produto nos arrays globais que já foram carregados
    if (isPurchased) {
        const todosOsItens = (window.produtosComprados || []).flatMap(p => 
            (p.itens || []).map(item => ({...item, numeroPedido: p.numero, dataCompra: p.data }))
        );
        produto = todosOsItens.find(p => p.code === code);
    } else {
        produto = (window.produtos || []).find(p => p.code === code);
    }
    
    if (!produto) {
        console.error(`❌ Produto ${code} não encontrado nos dados locais.`);
        mostrarNotificacao('Erro ao carregar detalhes do produto.', 'erro');
        return;
    }

    abrirModalDetalhes(produto, isPurchased);
}


function abrirModalDetalhes(produto, isPurchased) {
    const modal = document.getElementById('product-detail-modal');
    const modalTitle = document.getElementById('product-detail-title');
    const modalDescription = document.getElementById('product-detail-description');
    const originalPrice = document.getElementById('product-detail-original-price');
    const currentPrice = document.getElementById('product-detail-current-price');
    const metadata = document.getElementById('product-metadata');
    const addToCartBtn = document.getElementById('add-to-cart-detail');
    const productImage = document.getElementById('product-detail-image');
    const productBackground = document.getElementById('product-detail-background');
    
    if (!modal || !modalTitle || !modalDescription || !addToCartBtn || !productImage || !productBackground) {
        console.error("Elementos do modal de detalhes não encontrados");
        return;
    }

    modalTitle.textContent = produto.nome;
    
    const imageSrc = produto.imagem || 'assets/placeholder.jpg';
    productImage.src = imageSrc;
    productImage.alt = produto.nome;
    productBackground.src = imageSrc;
    
    // LÊ a descrição do cache local, sem fazer requisição.
    const descricaoDoCache = detalhesCache[produto.code]?.descricao || 'Detalhes não disponíveis.';
    formatProductDescription(descricaoDoCache, modalDescription);
    
    setupProductMetadata(produto, metadata, isPurchased);
    
    if (isPurchased) {
        originalPrice.style.display = 'none';
        currentPrice.textContent = 'Produto adquirido';
        addToCartBtn.style.display = 'none';
    } else {
        setupProductPricing(produto, originalPrice, currentPrice);
        addToCartBtn.style.display = 'flex';
        const itemInCart = (window.cart || []).find(item => item.code === produto.code);
        setupAddToCartButton(produto, addToCartBtn, itemInCart);
    }

    modal.style.display = 'flex';
    document.body.classList.add('no-scroll');
}

// =================================================================================
// GALERIA DE IMAGENS (LENDO DO CACHE)
// =================================================================================

function abrirGaleriaUnificada(code, imageIndex = 0) {
    // As imagens agora vêm DIRETAMENTE do cache populado na carga inicial.
    const imagensDoProduto = detalhesCache[code]?.imagens || [document.querySelector(`.product-card[data-id="${code}"] .product-img`)?.src || 'assets/placeholder.jpg'];
    
    if (!imagensDoProduto || imagensDoProduto.length === 0) {
        mostrarNotificacao("Nenhuma imagem disponível para este produto.", "erro");
        return;
    }
    
    window.currentProductImages = imagensDoProduto;
    window.currentImageIndex = imageIndex >= 0 && imageIndex < imagensDoProduto.length ? imageIndex : 0;
    
    const imageViewerModal = document.getElementById('image-viewer-modal');
    if (imageViewerModal) {
        imageViewerModal.style.display = 'block';
        document.body.classList.add('no-scroll');
        atualizarImageViewer(); // Esta chamada agora funcionará
    }
}

// =================================================================================
// FUNÇÕES RESTAURADAS: CONTROLES DA GALERIA DE IMAGENS
// =================================================================================

function atualizarImageViewer(direcao = null) {
    const mainImage = document.getElementById('viewer-main-image');
    const imageCounter = document.getElementById('image-counter');
    const thumbnailsContainer = document.getElementById('image-thumbnails');

    if (!mainImage || !imageCounter || !thumbnailsContainer) return;

    mainImage.className = direcao === 'next' ? 'slide-left' : direcao === 'prev' ? 'slide-right' : '';

    setTimeout(() => {
        if (window.currentProductImages && window.currentProductImages.length > window.currentImageIndex && window.currentImageIndex >= 0) {
            mainImage.src = window.currentProductImages[window.currentImageIndex];
        }
        if (window.currentProductImages) {
            imageCounter.textContent = `${window.currentImageIndex + 1} / ${window.currentProductImages.length}`;
        }
        
        thumbnailsContainer.innerHTML = ''; // Limpa as miniaturas antigas
        const thumbnailsWrapper = document.createElement('div');
        thumbnailsWrapper.className = 'thumbnails-center-wrapper';
        thumbnailsContainer.appendChild(thumbnailsWrapper);
        
        window.currentProductImages.forEach((imgSrc, idx) => {
            const thumbnail = document.createElement('img');
            thumbnail.src = imgSrc;
            thumbnail.alt = `Miniatura ${idx + 1}`;
            thumbnail.className = `image-thumbnail ${idx === window.currentImageIndex ? 'active' : ''}`;
            thumbnail.dataset.index = idx;
            thumbnail.onclick = function() {
                window.currentImageIndex = parseInt(this.dataset.index);
                atualizarImageViewer();
            };
            thumbnailsWrapper.appendChild(thumbnail);
        });
        
        // Garante que a miniatura ativa esteja visível
        const activeThumb = thumbnailsWrapper.querySelector('.image-thumbnail.active');
        if (activeThumb) {
            activeThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
    }, direcao ? 100 : 0);
}

function navegarImagens(direcao) {
    if (!window.currentProductImages || window.currentProductImages.length <= 1) return;
    let novoIndice = (window.currentImageIndex + direcao + window.currentProductImages.length) % window.currentProductImages.length;
    window.currentImageIndex = novoIndice;
    atualizarImageViewer(direcao > 0 ? 'next' : 'prev');
}

function closeImageViewer() {
    const imageViewerModal = document.getElementById('image-viewer-modal');
    if (imageViewerModal) imageViewerModal.style.display = 'none';
    document.body.classList.remove('no-scroll');
    window.currentImageIndex = 0;
}

// =================================================================================
// FUNÇÕES RESTAURADAS: MANIPULADORES DE EVENTOS DA GALERIA
// =================================================================================

function handleKeyNavigation(e) {
    const imageViewerModal = document.getElementById('image-viewer-modal');
    if (imageViewerModal && imageViewerModal.style.display === 'block') {
        if (window.keyNavigationInProgress) return;
        window.keyNavigationInProgress = true;
        
        switch(e.key) {
            case 'ArrowLeft': navegarImagens(-1); break;
            case 'ArrowRight': navegarImagens(1); break;
            case 'Escape': closeImageViewer(); break;
        }
        
        setTimeout(() => { window.keyNavigationInProgress = false; }, 150);
    }
}

function setupTouchListeners() {
    const container = document.querySelector('.image-viewer-container');
    if (!container) return;

    let startX = 0, isDragging = false;
    
    container.addEventListener('touchstart', e => {
        isDragging = true;
        startX = e.touches[0].clientX;
    });

    container.addEventListener('touchend', e => {
        if (!isDragging) return;
        const endX = e.changedTouches[0].clientX;
        const diffX = endX - startX;
        if (Math.abs(diffX) > 50) { // Limite mínimo para o gesto de deslizar
            navegarImagens(diffX > 0 ? -1 : 1);
        }
        isDragging = false;
    });
}


// =================================================================================
// FUNÇÕES DE CONFIGURAÇÃO DA UI DO MODAL
// =================================================================================

function setupProductPricing(produto, originalPriceEl, currentPriceEl) {
    // Verifica se os dados de preço existem (para o caso de visitantes)
    if (produto.valorAvulso === undefined) {
        originalPriceEl.style.display = 'none';
        currentPriceEl.innerHTML = '<span class="product-price-login-prompt" style="font-size: 1rem;">Faça login para ver o preço</span>';
        return;
    }
    
    const valorAvulso = parseFloat(produto.valorAvulso) || 0;
    const valorPromocao = parseFloat(produto.valorPromocao) || 0;
    const valorAssinante = parseFloat(produto.valorAssinante) || 0;
    const temPromocao = produto.temPromocao && valorPromocao > 0;
    const isVIP = window.isVIP !== undefined ? window.isVIP : false;

    originalPriceEl.style.display = 'none';
    currentPriceEl.classList.remove('vip-price');

    if (isVIP && valorAssinante > 0) {
        originalPriceEl.textContent = formatarMoedaSegura(valorAvulso);
        originalPriceEl.style.display = 'inline';
        currentPriceEl.textContent = formatarMoedaSegura(valorAssinante);
        currentPriceEl.classList.add('vip-price'); 
    } else if (temPromocao) {
        originalPriceEl.textContent = formatarMoedaSegura(valorAvulso);
        originalPriceEl.style.display = 'inline';
        currentPriceEl.textContent = formatarMoedaSegura(valorPromocao);
    } else {
        currentPriceEl.textContent = formatarMoedaSegura(valorAvulso);
    }
}

function formatProductDescription(description, descriptionContainer) {
    if (!description) {
        descriptionContainer.innerHTML = `<p>Descrição não disponível.</p>`;
        return;
    }
    
    const formattedContainer = document.createElement('div');
    formattedContainer.className = 'formatted-description';
    let formattedText = description.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/__(.+?)__/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/_(.+?)_/g, '<em>$1</em>')
        .replace(/==(.+?)==/g, '<span class="highlight">$1</span>')
        .replace(/^(#{1,3}) (.+)$/gm, (match, hashes, content) => `<h${hashes.length + 2}>${content}</h${hashes.length + 2}>`)
        .replace(/^[*-] (.+)$/gm, '<li>$1</li>');

    formattedText = formattedText.replace(/(<li>.+?<\/li>)+/gs, '<ul>$&</ul>');
    formattedContainer.innerHTML = formattedText.split('\n\n').map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('');
    
    descriptionContainer.innerHTML = '';
    descriptionContainer.appendChild(formattedContainer);
}

function setupProductMetadata(produto, metadataContainer, isPurchased) {
    metadataContainer.innerHTML = '';
    
    if (isPurchased) {
        const dataCompra = produto.dataCompra || produto.data;
        if (dataCompra) {
             const dataFormatada = new Date(dataCompra).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
             metadataContainer.innerHTML += `<div class="metadata-item"><i class="fas fa-calendar-check"></i> Comprado em: ${dataFormatada}</div>`;
        }
        if (produto.numeroPedido) {
            metadataContainer.innerHTML += `<div class="metadata-item"><i class="fas fa-receipt"></i> Pedido: #${produto.numeroPedido}</div>`;
        }
    } else {
        if (produto.data) metadataContainer.innerHTML += `<div class="metadata-item"><i class="fas fa-calendar-alt"></i> Data: ${produto.data}</div>`;
        if (produto.versao) metadataContainer.innerHTML += `<div class="metadata-item"><i class="fas fa-code-branch"></i> Versão: ${produto.versao}</div>`;
        if (produto.tempo) metadataContainer.innerHTML += `<div class="metadata-item"><i class="fas fa-clock"></i> Duração: ${produto.tempo}</div>`;
    }
    
    if (metadataContainer.children.length === 0) {
        metadataContainer.innerHTML = `<div class="metadata-item"><i class="fas fa-info-circle"></i> ${isPurchased ? 'Produto adquirido' : 'Produto disponível'}</div>`;
    }
}

function setupAddToCartButton(produto, button, itemInCart) {
    const isVipProduct = produto.code.toString() === '360';
    
    button.onclick = null; // Limpa listener antigo
    
    if (isVipProduct) {
        button.innerHTML = '<span><i class="fas fa-crown"></i> Assinar Agora</span><div class="spinner"></div>';
        button.classList.remove('in-cart');
        button.disabled = false;
        button.onclick = function() {
            if (typeof window.checkoutDiretoVIP === 'function') {
                window.checkoutDiretoVIP(produto.code, this.id);
            }
        };
    } else {
        if (itemInCart) {
            button.innerHTML = '<i class="fas fa-check"></i> No Carrinho';
            button.classList.add('in-cart');
            button.disabled = true;
        } else {
            button.innerHTML = '<i class="fas fa-cart-plus"></i> Adicionar ao Carrinho';
            button.classList.remove('in-cart');
            button.disabled = false;
            button.onclick = function() {
                if (typeof window.adicionarAoCarrinho === 'function') {
                    window.adicionarAoCarrinho(produto.code);
                    closeProductDetails();
                }
            };
        }
    }
}

function closeProductDetails() {
    const modal = document.getElementById('product-detail-modal');
    if (modal) modal.style.display = 'none';
    document.body.classList.remove('no-scroll');
}

// =================================================================================
// INICIALIZAÇÃO DO MÓDULO (com os listeners corretos)
// =================================================================================

function initializeProductDetails() {
    document.getElementById('modal-close-btn')?.addEventListener('click', closeProductDetails);
    
    const modal = document.getElementById('product-detail-modal');
    if (modal) {
        modal.addEventListener('click', e => { if (e.target === modal) closeProductDetails(); });
    }
    
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            if (document.getElementById('product-detail-modal')?.style.display === 'flex') closeProductDetails();
            if (document.getElementById('image-viewer-modal')?.style.display === 'block') closeImageViewer();
        }
    });
    
    // Listeners para os botões da galeria
    document.querySelector('.close-image-viewer')?.addEventListener('click', closeImageViewer);
    document.querySelector('.prev-image')?.addEventListener('click', () => navegarImagens(-1));
    document.querySelector('.next-image')?.addEventListener('click', () => navegarImagens(1));
    
    // Configura os listeners de teclado e toque para a galeria
    document.addEventListener('keydown', handleKeyNavigation);
    setupTouchListeners();
    
    // Exporta as funções para o escopo global
    window.openProductDetails = openProductDetails;
    window.abrirGaleriaUnificada = abrirGaleriaUnificada;
    window.popularDetalhesCache = popularDetalhesCache;
}

document.addEventListener('DOMContentLoaded', initializeProductDetails);