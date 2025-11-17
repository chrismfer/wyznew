// =================================================================================
// CACHE MANAGER (INTEGRADO)
// =================================================================================

const CACHE_VERSION = "1.0";
const CACHE_PREFIX = "skullstore_";
let imagensProdutosCache = {};

function initImageCache() {
    const cacheInfo = localStorage.getItem(`${CACHE_PREFIX}cache_info`);
    
    if (!cacheInfo || JSON.parse(cacheInfo).version !== CACHE_VERSION) {
        clearImageCache();
        
        localStorage.setItem(`${CACHE_PREFIX}cache_info`, JSON.stringify({
            version: CACHE_VERSION,
            created: new Date().toISOString(),
            lastUpdate: new Date().toISOString()
        }));
    }
    
    try {
        const cachedImages = localStorage.getItem(`${CACHE_PREFIX}images_cache`);
        if (cachedImages) {
            imagensProdutosCache = JSON.parse(cachedImages);
            console.log("Cache de imagens carregado: ", Object.keys(imagensProdutosCache).length, "imagens em cache");
        }
    } catch (error) {
        console.error("Erro ao carregar cache de imagens:", error);
        clearImageCache();
    }
}

function clearImageCache() {
    Object.keys(localStorage).forEach(key => {
        if (key.startsWith(CACHE_PREFIX)) {
            localStorage.removeItem(key);
        }
    });
    
    imagensProdutosCache = {};
}

function saveImageCache() {
    try {
        const cacheStr = JSON.stringify(imagensProdutosCache);
        const cacheSize = cacheStr.length * 2;
        
        if (cacheSize > 4.5 * 1024 * 1024) {
            const keys = Object.keys(imagensProdutosCache);
            const keysToRemove = keys.slice(0, keys.length - 100);
            
            keysToRemove.forEach(key => {
                delete imagensProdutosCache[key];
            });
            
            console.log(`Cache reduzido: ${keys.length} → ${Object.keys(imagensProdutosCache).length} imagens`);
        }
        
        localStorage.setItem(`${CACHE_PREFIX}images_cache`, JSON.stringify(imagensProdutosCache));
        
        const cacheInfo = JSON.parse(localStorage.getItem(`${CACHE_PREFIX}cache_info`) || '{}');
        cacheInfo.lastUpdate = new Date().toISOString();
        localStorage.setItem(`${CACHE_PREFIX}cache_info`, JSON.stringify(cacheInfo));
        
    } catch (error) {
        console.error("Erro ao salvar cache de imagens:", error);
        clearImageCache();
    }
}

function addImageToCache(url, status = true) {
    if (!url) return;
    
    imagensProdutosCache[url] = {
        cached: status,
        timestamp: new Date().getTime()
    };
    
    if (Object.keys(imagensProdutosCache).length % 10 === 0) {
        saveImageCache();
    }
}

function isImageCached(url) {
    if (!url) return false;
    return imagensProdutosCache[url]?.cached === true;
}

function preCarregarImagens(imagens) {
    if (!imagens || !Array.isArray(imagens) || imagens.length === 0) return;
    
    const preloadContainer = document.getElementById('preload-container');
    if (!preloadContainer) return;
    
    preloadContainer.innerHTML = '';

    const batchSize = 5;
    const totalBatches = Math.ceil(imagens.length / batchSize);
    
    function loadBatch(batchIndex) {
        if (batchIndex >= totalBatches) {
            saveImageCache();
            return;
        }
        
        const startIndex = batchIndex * batchSize;
        const endIndex = Math.min(startIndex + batchSize, imagens.length);
        
        for (let i = startIndex; i < endIndex; i++) {
            const url = imagens[i];
            if (!url || isImageCached(url)) continue;
            
            const img = new Image();
            img.onload = () => {
                addImageToCache(url, true);
                img.remove();
            };
            img.onerror = () => {
                addImageToCache(url, false);
                img.remove();
            };
            img.src = url;
            preloadContainer.appendChild(img);
        }
        
        setTimeout(() => loadBatch(batchIndex + 1), 300);
    }
    
    loadBatch(0);
}

// =================================================================================
// LÓGICA CENTRAL E UTILITÁRIOS
// =================================================================================

let apiToken = null;

async function getApiToken() {
  try {
    const response = await fetch(`${scriptURL}?action=getApiToken`);
    const data = await response.json();
    if (data.sucesso && data.token) {
      apiToken = data.token;
      console.log("Token de sessão obtido e armazenado.");
    } else {
      console.error("Falha ao obter token da API.");
      apiToken = null;
    }
  } catch (error) {
    console.error("Erro de rede ao obter token da API:", error);
    apiToken = null;
  }
}

async function fetchAPI(url, options = {}) {
  if (!apiToken) {
    console.error("Tentativa de chamada à API sem token.");
    mostrarNotificacao("Erro de segurança. A página será recarregada.", "erro");
    setTimeout(() => window.location.reload(), 2000);
    throw new Error("Token de API ausente.");
  }

  const urlComToken = `${url}&token=${apiToken}`;

  try {
    const response = await fetch(urlComToken, options);
    if (!response.ok) {
        throw new Error(`Erro de rede: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erro na chamada da API:", error);
    throw error;
  }
}

const scriptURL = getConfig('api.scriptURL');
const DATA_CACHE_KEY = 'skullstore_data_cache';

let currentUser = null;
let currentUserName = null;
let isVIP = false;

function formatarMoeda(valor) {
    const numero = Number(valor) || 0;
    return numero.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function showLoading(buttonId) {
    const button = document.getElementById(buttonId);
    if (button) button.classList.add('loading');
}

function hideLoading(buttonId) {
    const button = document.getElementById(buttonId);
    if (button) button.classList.remove('loading');
}

function mostrarNotificacao(mensagem, tipo) {
    const notificacoesExistentes = document.querySelectorAll('.notificacao-flutuante');
    notificacoesExistentes.forEach(n => n.remove());

    const notificacao = document.createElement('div');
    notificacao.className = `notificacao-flutuante notificacao-${tipo}`;

    const icone = document.createElement('i');
    icone.className = tipo === 'sucesso' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle';
    notificacao.appendChild(icone);

    const textoSpan = document.createElement('span');
    textoSpan.textContent = mensagem;
    notificacao.appendChild(textoSpan);

    document.body.appendChild(notificacao);
    void notificacao.offsetWidth;
    notificacao.classList.add('show');

    setTimeout(() => {
        notificacao.classList.remove('show');
        notificacao.classList.add('hide');
        setTimeout(() => {
            if (notificacao.parentNode) {
                notificacao.parentNode.removeChild(notificacao);
            }
        }, 500);
    }, 3000);
}

function redirectToLogin() {
    sessionStorage.setItem('bypassLanding', 'true');
    window.location.href = 'authentic/auth.html';
}

// =================================================================================
// ARQUITETURA DE DADOS E SINCRONIZAÇÃO
// =================================================================================

function carregarDadosDoCache() {
    const cachedDataString = localStorage.getItem(DATA_CACHE_KEY);
    if (!cachedDataString) return false;
    try {
        const cachedData = JSON.parse(cachedDataString);
        if (cachedData.user === (currentUser || 'guest')) {
            window.produtos = cachedData.produtos || [];
            window.produtosComprados = cachedData.pedidos || [];
            isVIP = cachedData.isVIP || false;
            console.log("Dados carregados instantaneamente do cache local.");
            return true;
        }
        return false;
    } catch (error) {
        console.error("Erro ao ler o cache de dados:", error);
        return false;
    }
}

function salvarDadosNoCache(storeData) {
    try {
        const cachePayload = {
            user: currentUser || 'guest',
            produtos: storeData.produtos,
            pedidos: storeData.pedidos,
            isVIP: storeData.isVIP,
            timestamp: new Date().getTime()
        };
        localStorage.setItem(DATA_CACHE_KEY, JSON.stringify(cachePayload));
    } catch (error) {
        console.error("Não foi possível salvar os dados no cache:", error);
    }
}

async function sincronizarComServidor() {
    console.log("Sincronizando com o servidor em segundo plano...");
    try {
        const apiUrl = currentUser 
            ? `${scriptURL}?action=getInitialStoreData&email=${encodeURIComponent(currentUser)}`
            : `${scriptURL}?action=getInitialStoreData`;
        const freshData = await fetchAPI(apiUrl);
        if (freshData.sucesso) {
            const dadosAntigos = { produtos: window.produtos, pedidos: window.produtosComprados, isVIP: window.isVIP };
            const dadosNovos = { produtos: freshData.produtos, pedidos: freshData.pedidos, isVIP: freshData.isVIP };
            if (JSON.stringify(dadosAntigos) !== JSON.stringify(dadosNovos)) {
                console.log("Mudanças detectadas. Atualizando interface silenciosamente.");
                window.produtos = freshData.produtos || [];
                window.produtosComprados = freshData.pedidos || [];
                isVIP = freshData.isVIP || false;
                if (currentUser) sessionStorage.setItem('isVIP', isVIP);
                
                updateUserInterface();
                populateAndRenderActiveTab();
                
                iniciarPreCarregamentoGlobal();
            } else {
                console.log("Nenhuma mudança detectada. A interface já está atualizada.");
            }
            salvarDadosNoCache(freshData);
        }
    } catch (err) {
        console.error("Falha na sincronização em segundo plano:", err);
    }
}

function iniciarPreCarregamentoGlobal() {
    if (!window.produtos && !window.produtosComprados) {
        console.log("Dados de produtos não disponíveis para pré-carregamento.");
        return;
    }

    const imagensDaLoja = (window.produtos || []).flatMap(p => [p.imagem, ...(p.imagensAdicionais || [])]);
    const imagensCompradas = (window.produtosComprados || []).flatMap(p => 
        (p.itens || []).flatMap(item => [item.imagem, ...(item.imagensAdicionais || [])])
    );

    const todasAsImagens = [...imagensDaLoja, ...imagensCompradas];
    const imagensUnicas = [...new Set(todasAsImagens)].filter(Boolean);

    console.log(`Iniciando pré-carregamento de ${imagensUnicas.length} imagens em segundo plano.`);
    preCarregarImagens(imagensUnicas);
}

// =================================================================================
// INICIALIZAÇÃO E CONTROLE DE SESSÃO (FLUXO ATUALIZADO)
// =================================================================================

document.addEventListener('DOMContentLoaded', function() {
    // ETAPA 1: INICIALIZAÇÃO SÍNCRONA E IMEDIATA
    currentUser = sessionStorage.getItem('currentUser');
    currentUserName = sessionStorage.getItem('currentUserName');

    initializeAppUI();
    updateUserInterface();

    const isMainApp = document.getElementById('site-header') !== null;
    if (!isMainApp) {
        const isAuthPage = document.getElementById('login-container') !== null;
        const isLandingPage = document.querySelector('.hero-section') !== null;
        if (isLandingPage && currentUser) {
            document.querySelectorAll('a[href="authentic/auth.html"]').forEach(link => { link.href = "index.html"; });
        } else if (isAuthPage && currentUser) {
            window.location.href = '../index.html';
        }
        return;
    }

    // ETAPA 2: FLUXO DE DADOS ASSÍNCRONO
    initializeDataFlow();

    // ETAPA 3: LISTENERS GLOBAIS ADICIONAIS
    setupGlobalListeners();
});

async function initializeDataFlow() {
    await getApiToken();
    if (!apiToken) {
        const productGrid = document.getElementById('product-grid');
        if(productGrid) productGrid.innerHTML = '<div class="placeholder-message erro-placeholder">Falha na conexão com o servidor. Por favor, recarregue a página.</div>';
        return;
    }
    await loadAndRenderData();
}

function setupGlobalListeners() {
    window.addEventListener('message', function(event) {
        if (event.data && event.data.type === 'iframeResize') {
            const manualIframe = document.getElementById('manual-iframe');
            const conhecerIframe = document.getElementById('conhecer-iframe');
            if (manualIframe && manualIframe.contentWindow === event.source) {
                manualIframe.style.height = event.data.height + 'px';
            }
            if (conhecerIframe && conhecerIframe.contentWindow === event.source) {
                conhecerIframe.style.height = event.data.height + 'px';
            }
        } else if (event.data && event.data.type === 'openLightbox') {
            const imageViewerModal = document.getElementById('image-viewer-modal');
            if (!imageViewerModal || !Array.isArray(event.data.images)) return;
            window.currentProductImages = event.data.images.map(img => `public/${img.image}`);
            window.currentImageIndex = event.data.startIndex || 0;
            if (typeof atualizarImageViewer === 'function') {
                imageViewerModal.style.display = 'block';
                document.body.classList.add('no-scroll');
                atualizarImageViewer();
            } else {
                console.error("Função 'atualizarImageViewer' não encontrada.");
            }
        } else if (event.data && event.data.type === 'scrollToManual') {
            const manualContainer = document.getElementById('manual');
            const manualIframe = document.getElementById('manual-iframe');
            if (manualContainer && manualIframe && manualIframe.contentWindow === event.source) {
                manualContainer.scrollTo({
                    top: event.data.offset,
                    behavior: 'smooth'
                });
            }
        }
    });
}

async function loadAndRenderData() {
    const cacheLoaded = carregarDadosDoCache();

    if (cacheLoaded) {
        updateUserInterface();
        populateAndRenderActiveTab();
        iniciarPreCarregamentoGlobal();
        sincronizarComServidor();
    } else {
        try {
            const apiUrl = currentUser 
                ? `${scriptURL}?action=getInitialStoreData&email=${encodeURIComponent(currentUser)}`
                : `${scriptURL}?action=getInitialStoreData`;
            const storeData = await fetchAPI(apiUrl);

            if (storeData.sucesso) {
                window.produtos = storeData.produtos || [];
                window.produtosComprados = storeData.pedidos || [];
                isVIP = storeData.isVIP || false;
                if (currentUser) sessionStorage.setItem('isVIP', isVIP);
                
                salvarDadosNoCache(storeData);
                updateUserInterface();
                populateAndRenderActiveTab();
                iniciarPreCarregamentoGlobal();
            } else {
                throw new Error(storeData.mensagem || "Falha ao carregar dados da loja.");
            }
        } catch (err) {
            console.error("Erro crítico na inicialização da loja:", err);
            const productGrid = document.getElementById('product-grid');
            if(productGrid) productGrid.innerHTML = '<div class="placeholder-message erro-placeholder">Não foi possível carregar a loja. Tente recarregar a página.</div>';
        }
    }
}

function populateAndRenderActiveTab() {
    if(typeof popularDetalhesCache === 'function') {
        popularDetalhesCache(window.produtos, window.produtosComprados);
    }
    
    if (typeof carregarProdutos === 'function') {
        carregarProdutos();
    }
    
    const activeTab = document.querySelector('.tab-content.active');
    if (activeTab) {
        if (activeTab.id === 'pedidos' && typeof renderizarPedidos === 'function') {
            renderizarPedidos();
        } else if (activeTab.id === 'carrinho' && typeof atualizarCarrinho === 'function') {
            atualizarCarrinho();
        }
    }
    
    if (currentUser && typeof atualizarContadorCarrinho === 'function') {
        atualizarContadorCarrinho();
    }
}

// =================================================================================
// ATUALIZAÇÃO DA INTERFACE DE USUÁRIO
// =================================================================================

function updateUserInterface() {
    const guestLoginBtnDesktop = document.getElementById('guest-login-btn-desktop');
    const guestLoginBtnMobile = document.getElementById('guest-login-btn-mobile');
    const filterContainer = document.querySelector('.filter-container');
    const pillsContainer = document.querySelector('.filters-pills-container');

    if (!currentUser) {
        if (guestLoginBtnDesktop) guestLoginBtnDesktop.onclick = redirectToLogin;
        if (guestLoginBtnMobile) guestLoginBtnMobile.onclick = redirectToLogin;

        const isLojaTabActive = document.getElementById('loja')?.classList.contains('active');
        if (filterContainer) filterContainer.style.display = isLojaTabActive ? 'flex' : 'none';
        if (pillsContainer) pillsContainer.style.display = isLojaTabActive ? 'flex' : 'none';

    } else {
        const isLojaTabActive = document.getElementById('loja')?.classList.contains('active');
        if (filterContainer) filterContainer.style.display = isLojaTabActive ? 'flex' : 'none';
        if (pillsContainer) pillsContainer.style.display = isLojaTabActive ? 'flex' : 'none';
        
        const userInfoDesktop = document.getElementById('user-info-desktop');
        const userNameDesktop = document.getElementById('user-name-desktop');
        const userAccessStatusDesktop = document.getElementById('user-access-status');
        const userInfoMobile = document.getElementById('user-info-mobile');
        const userNameMobile = document.getElementById('user-name-mobile');
        const userAccessStatusMobile = document.getElementById('user-access-status-mobile');
        
        const primeiroNome = currentUserName ? currentUserName.split(' ')[0] : '';
        if (userNameDesktop) userNameDesktop.textContent = primeiroNome;
        if (userNameMobile) userNameMobile.textContent = primeiroNome;

        if (isVIP) {
            const vipStatusHTML = '<i class="fas fa-crown"></i> Acesso: VIP';
            if (userAccessStatusDesktop) userAccessStatusDesktop.innerHTML = vipStatusHTML;
            if (userInfoDesktop) userInfoDesktop.classList.add('access-vip');
            if (userAccessStatusMobile) userAccessStatusMobile.innerHTML = vipStatusHTML;
            if (userInfoMobile) userInfoMobile.classList.add('access-vip');
        } else {
            const defaultStatusHTML = '<i class="fas fa-bolt"></i> Acesso: Padrão';
            if (userAccessStatusDesktop) userAccessStatusDesktop.innerHTML = defaultStatusHTML;
            if (userInfoDesktop) userInfoDesktop.classList.add('access-default');
            if (userAccessStatusMobile) userAccessStatusMobile.innerHTML = defaultStatusHTML;
            if (userInfoMobile) userInfoMobile.classList.add('access-default');
        }

        if (userInfoDesktop) userInfoDesktop.classList.remove('user-info-loading');
        if (userInfoMobile) userInfoMobile.classList.remove('user-info-loading');
    }
    
    const siteHeader = document.getElementById('site-header');
    if (siteHeader) siteHeader.style.display = 'flex';

    const storeContainer = document.getElementById('store-container');
    if (storeContainer) storeContainer.style.display = 'flex';
}

function logout() {
    sessionStorage.clear();
    localStorage.removeItem(DATA_CACHE_KEY);
    localStorage.removeItem('skullstore_products_cache'); 
    localStorage.removeItem('flash_store_cart');
    localStorage.removeItem('skullstore_products_timestamp');
    currentUser = null;
    currentUserName = null;
    isVIP = false;
    window.location.href = 'index.html'; 
}

let lastScrollTop = 0;
function handleHeaderVisibility() {
    const header = document.getElementById('site-header');
    if (!header) return;
    const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
    if (currentScrollTop > lastScrollTop && currentScrollTop > 60) {
        header.classList.add('hide');
        header.classList.remove('show');
    } else {
        header.classList.remove('hide');
        header.classList.add('show');
    }
    lastScrollTop = currentScrollTop <= 0 ? 0 : currentScrollTop;
}

function toggleMenuLateral() {
    if (!currentUser) return;
    const menu = document.getElementById('mobile-menu');
    const overlay = document.getElementById('overlay');
    if (!menu || !overlay) return;
    menu.classList.toggle('active');
    overlay.classList.toggle('active');
    document.body.classList.toggle('no-scroll');
}

function closeMenuLateral() {
    const menu = document.getElementById('mobile-menu');
    const overlay = document.getElementById('overlay');
    if (!menu || !overlay) return;
    menu.classList.remove('active');
    overlay.classList.remove('active');
    document.body.classList.remove('no-scroll');
}

function closeModal(modalId = 'product-modal') {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = 'none';
    document.body.classList.remove('no-scroll');
    if (modalId === 'pix-modal') {
        if (typeof verificacaoStatusInterval !== 'undefined' && verificacaoStatusInterval) {
            clearInterval(verificacaoStatusInterval);
            verificacaoStatusInterval = null;
        }
    }
}

function mostrarModalErroDownload(mensagem) {
    const modal = document.getElementById('download-error-modal');
    const messageElement = document.getElementById('download-error-message');
    if (!modal || !messageElement) {
        mostrarNotificacao(mensagem, 'erro');
        return;
    }
    messageElement.textContent = "Conforme as regras da plataforma, estipuladas no manual geral, " + mensagem.toLowerCase();
    modal.style.display = 'flex';
    document.body.classList.add('no-scroll');
}

// =================================================================================
// VERIFICAÇÃO DE PAGAMENTOS E NAVEGAÇÃO
// =================================================================================

async function verificarEAtualizarPedidosPendentes() {
    if (!currentUser) return;
    const syncIndicator = document.getElementById('sync-status-indicator');
    try {
        if (syncIndicator) syncIndicator.classList.add('show');
        const res = await fetchAPI(`${scriptURL}?action=verificarPagamentosPendentes&email=${encodeURIComponent(currentUser)}`);
        if (res.sucesso && res.mudancasDetectadas) {
            mostrarNotificacao('Novos produtos foram liberados!', 'sucesso');
            await sincronizarComServidor();
        }
    } catch (err) {
        console.error("Erro ao verificar pagamentos pendentes:", err);
        mostrarNotificacao('Falha ao sincronizar seus produtos.', 'erro');
    } finally {
        if (syncIndicator) syncIndicator.classList.remove('show');
    }
}

function initUINavigation() {
    const navButtons = document.querySelectorAll('.header-nav-btn, .bottom-nav-item, #menu-instructions, #guest-login-btn-desktop, #guest-login-btn-mobile');
    const tabContents = document.querySelectorAll('.tab-content');
    const filterContainer = document.querySelector('.filter-container');
    const pillsContainer = document.querySelector('.filters-pills-container');
    const explanationContainer = document.getElementById('filter-explanation-container');

    navButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            if (this.id.includes('guest-login-btn')) return;
            if (this.tagName === 'A' && !this.hasAttribute('data-tab')) return;
            e.preventDefault();
            
            const tabId = this.getAttribute('data-tab');
            if (!tabId) return;

            const isLojaTab = tabId === 'loja';
            if (filterContainer) filterContainer.style.display = isLojaTab ? 'flex' : 'none';
            if (pillsContainer) pillsContainer.style.display = isLojaTab ? 'flex' : 'none';
            if (explanationContainer && !isLojaTab) {
                explanationContainer.innerHTML = '';
            }

            navButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            document.querySelectorAll(`[data-tab="${tabId}"]`).forEach(b => b.classList.add("active"));
            const currentTabContent = document.getElementById(tabId);
            if (currentTabContent) currentTabContent.classList.add("active");
            
            if (tabId === 'manual') {
                const manualIframe = document.getElementById('manual-iframe');
                if (manualIframe) {
                    manualIframe.src = 'public/manual.html';
                }
            } else if (tabId === 'conhecer') {
                const conhecerIframe = document.getElementById('conhecer-iframe');
                if (conhecerIframe) {
                    conhecerIframe.src = 'public/landing.html';
                }
            }
            
            if (currentUser) {
                if (tabId === 'pedidos') {
                    if (typeof renderizarPedidos === 'function') renderizarPedidos();
                    verificarEAtualizarPedidosPendentes();
                }
                if (tabId === 'carrinho' && typeof atualizarCarrinho === 'function') atualizarCarrinho();
            }
            
            if (window.innerWidth <= 992) closeMenuLateral();
        });
    });

    const menuToggleBottomNav = document.getElementById('bottom-nav-menu-toggle');
    const menuToggleInMenu = document.getElementById('menu-toggle-in-menu');
    const overlay = document.getElementById('overlay');

    if (menuToggleBottomNav) menuToggleBottomNav.addEventListener('click', toggleMenuLateral);
    if (menuToggleInMenu) menuToggleInMenu.addEventListener('click', toggleMenuLateral);
    if (overlay) overlay.addEventListener('click', closeMenuLateral);

    document.getElementById('menu-logout-mobile')?.addEventListener('click', (e) => { e.preventDefault(); logout(); });
    document.getElementById('logout-btn-desktop')?.addEventListener('click', logout);
    
    document.querySelectorAll('.close-modal').forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) closeModal(modal.id);
        });
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth <= 768) {
            window.addEventListener('scroll', checarProdutoCentral, { passive: true });
        } else {
            window.removeEventListener('scroll', checarProdutoCentral);
        }
    });
    if (window.innerWidth <= 768) {
        window.addEventListener('scroll', checarProdutoCentral, { passive: true });
    }
}

// =================================================================================
// FUNÇÃO DE FOCO AUTOMÁTICO NO SCROLL
// =================================================================================

function checarProdutoCentral() {
    const activeGrid = document.querySelector('.tab-content.active .product-grid');
    if (!activeGrid) return;
    
    const cards = activeGrid.querySelectorAll('.product-card');
    if (cards.length === 0) return;

    const viewportCenterY = window.innerHeight / 2;
    let closestCard = null;
    let minDistance = Infinity;
    
    cards.forEach(card => {
        card.classList.remove('center-focus');
        const galleryIcon = card.querySelector('.gallery-icon');
        if (galleryIcon) galleryIcon.classList.remove('auto-show');

        const rect = card.getBoundingClientRect();
        if (rect.bottom > 0 && rect.top < window.innerHeight) {
            const cardCenterY = rect.top + rect.height / 2;
            const distance = Math.abs(viewportCenterY - cardCenterY);
            if (distance < minDistance) {
                minDistance = distance;
                closestCard = card;
            }
        }
    });

    if (closestCard && minDistance < (window.innerHeight / 4)) {
        closestCard.classList.add('center-focus');
        const galleryIcon = closestCard.querySelector('.gallery-icon');
        if (galleryIcon) galleryIcon.classList.add('auto-show');
    }
}

// =================================================================================
// INICIALIZAÇÃO DA APLICAÇÃO
// =================================================================================

function initializeAppUI() {
    console.log("Inicializando a interface do usuário...");
    
    if (typeof initUINavigation === 'function') initUINavigation();
    if (typeof initImageCache === 'function') initImageCache();
    if (typeof handleHeaderVisibility === 'function') window.addEventListener('scroll', handleHeaderVisibility);
    if (typeof initFilters === 'function') initFilters();
}