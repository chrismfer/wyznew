// =================================================================================
// LÓGICA CENTRAL E UTILITÁRIOS
// =================================================================================

const scriptURL = getConfig('api.scriptURL');

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

// =================================================================================
// INICIALIZAÇÃO E CONTROLE DE SESSÃO
// =================================================================================

document.addEventListener('DOMContentLoaded', function() {
    const isMainApp = document.getElementById('site-header') !== null;

    if (!isMainApp) {
        const isAuthPage = document.getElementById('login-container') !== null;
        const isLandingPage = document.querySelector('.hero-section') !== null;
        currentUser = sessionStorage.getItem('currentUser');
        if (isLandingPage && currentUser) {
            document.querySelectorAll('a[href="authentic/auth.html"]').forEach(link => { link.href = "index.html"; });
        } else if (isAuthPage && currentUser) {
            window.location.href = '../index.html';
        }
        return;
    }

    currentUser = sessionStorage.getItem('currentUser');

    if (!currentUser) {
        window.location.href = 'public/landing.html';
        return;
    }

    function renderAndInitializeApp() {
        updateUserInterface();
        document.dispatchEvent(new Event('optimisticRenderComplete'));
    }

    let storedUserName = sessionStorage.getItem('currentUserName');
    const isNameValid = storedUserName && storedUserName !== 'undefined' && storedUserName !== 'null';

    if (isNameValid) {
        console.log("Nome válido na sessão. Renderizando UI otimisticamente.");
        currentUserName = storedUserName;
        isVIP = sessionStorage.getItem('isVIP') === 'true';
        renderAndInitializeApp();

        const justLoggedIn = sessionStorage.getItem('justLoggedIn') === 'true';
        if (justLoggedIn) {
            sessionStorage.removeItem('justLoggedIn');
        } else {
            console.log("Sincronizando estado em segundo plano para usuário recorrente.");
            fetch(`${scriptURL}?action=obterUsuario&email=${encodeURIComponent(currentUser)}`)
                .then(res => res.json())
                .then(userData => {
                    if (userData.sucesso) {
                        const serverIsVIP = userData.isVIP;
                        const serverUserName = userData.nome;
                        if (isVIP !== serverIsVIP || currentUserName !== serverUserName) {
                            console.log("Estado desatualizado detectado. Atualizando sessão e UI.");
                            sessionStorage.setItem('currentUserName', serverUserName);
                            sessionStorage.setItem('isVIP', serverIsVIP);
                            updateUserInterface();
                            document.dispatchEvent(new Event('userStateSynced'));
                        }
                    }
                }).catch(err => console.error("Falha na sincronização em segundo plano:", err));
        }
    } else {
        console.warn("Nome inválido no sessionStorage. Forçando sincronização para reparar a sessão.");
        fetch(`${scriptURL}?action=obterUsuario&email=${encodeURIComponent(currentUser)}`)
            .then(res => res.json())
            .then(userData => {
                if (userData.sucesso && userData.nome) {
                    console.log("Sessão reparada com sucesso.");
                    sessionStorage.setItem('currentUserName', userData.nome);
                    sessionStorage.setItem('isVIP', userData.isVIP);
                    currentUserName = userData.nome;
                    isVIP = userData.isVIP;
                    renderAndInitializeApp();
                } else {
                    console.error("Falha ao reparar a sessão. Usuário inválido. Deslogando.");
                    logout();
                }
            })
            .catch(err => {
                console.error("Erro de rede ao reparar a sessão. Deslogando.", err);
                logout();
            });
    }

    window.addEventListener('message', function(event) {
        if (event.data && event.data.type === 'iframeResize') {
            const iframe = document.getElementById('manual-iframe');
            if (iframe) {
                iframe.style.height = (event.data.height + 20) + 'px';
            }
        }
    });
});

// =================================================================================
// ATUALIZAÇÃO DA INTERFACE DE USUÁRIO
// =================================================================================

function updateUserInterface() {
    const currentIsVIP = sessionStorage.getItem('isVIP') === 'true';
    currentUserName = sessionStorage.getItem('currentUserName');
    isVIP = currentIsVIP;

    const userNameDesktop = document.getElementById('user-name-desktop');
    const userInfoDesktop = document.getElementById('user-info-desktop');
    const userAccessStatusDesktop = document.getElementById('user-access-status');

    const userNameMobile = document.getElementById('user-name-mobile');
    const userInfoMobile = document.getElementById('user-info-mobile');
    const userAccessStatusMobile = document.getElementById('user-access-status-mobile');
    
    // --- Preenche os dados ---
    const primeiroNome = currentUserName.split(' ')[0];
    if (userNameDesktop) userNameDesktop.textContent = primeiroNome;
    if (userNameMobile) userNameMobile.textContent = primeiroNome;

    if (currentIsVIP) {
        const vipStatusHTML = '<i class="fas fa-crown"></i> Acesso: VIP';
        if (userAccessStatusDesktop) userAccessStatusDesktop.innerHTML = vipStatusHTML;
        if (userInfoDesktop) {
            userInfoDesktop.classList.remove('access-default');
            userInfoDesktop.classList.add('access-vip');
        }
        if (userAccessStatusMobile) userAccessStatusMobile.innerHTML = vipStatusHTML;
        if (userInfoMobile) {
            userInfoMobile.classList.remove('access-default');
            userInfoMobile.classList.add('access-vip');
        }
    } else {
        const defaultStatusHTML = '<i class="fas fa-bolt"></i> Acesso: Padrão';
        if (userAccessStatusDesktop) userAccessStatusDesktop.innerHTML = defaultStatusHTML;
        if (userInfoDesktop) {
            userInfoDesktop.classList.remove('access-vip');
            userInfoDesktop.classList.add('access-default');
        }
        if (userAccessStatusMobile) userAccessStatusMobile.innerHTML = defaultStatusHTML;
        if (userInfoMobile) {
            userInfoMobile.classList.remove('access-vip');
            userInfoMobile.classList.add('access-default');
        }
    }

    // AJUSTE: Revela os elementos já preenchidos
    if (userInfoDesktop) userInfoDesktop.classList.remove('user-info-loading');
    if (userInfoMobile) userInfoMobile.classList.remove('user-info-loading');

    const siteHeader = document.getElementById('site-header');
    const storeContainer = document.getElementById('store-container');
    if (siteHeader) siteHeader.style.display = 'flex';
    if (storeContainer) storeContainer.style.display = 'flex';

    atualizarBadgeVIP(); 
}

// ... (O resto do arquivo core.js, como logout, modais, navegação, etc., permanece o mesmo) ...
function atualizarBadgeVIP() {
    const badgeMobileExistente = document.getElementById('vip-badge-mobile');
    if (badgeMobileExistente) {
        badgeMobileExistente.remove();
    }
}

function logout() {
    sessionStorage.removeItem('currentUser');
    sessionStorage.removeItem('currentUserName');
    sessionStorage.removeItem('isVIP');
    sessionStorage.removeItem('bypassLanding');
    sessionStorage.removeItem('justLoggedIn');

    currentUser = null;
    currentUserName = null;
    isVIP = false;
    
    if (typeof cart !== 'undefined') cart = [];
    if (typeof produtos !== 'undefined') produtos = [];
    if (typeof produtosComprados !== 'undefined') produtosComprados = [];
    if (typeof cacheTimestamp !== 'undefined') cacheTimestamp = null;
    
    window.location.href = 'public/landing.html';
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
    const menu = document.getElementById('mobile-menu');
    const overlay = document.getElementById('overlay');
    const menuToggleInMenu = document.getElementById('menu-toggle-in-menu');

    if (!menu || !overlay || !menuToggleInMenu) return;

    menu.classList.toggle('active');
    overlay.classList.toggle('active');
    menuToggleInMenu.classList.toggle('active');

    document.body.classList.toggle('no-scroll');
}

function closeMenuLateral() {
    const menu = document.getElementById('mobile-menu');
    const overlay = document.getElementById('overlay');
    const menuToggleInMenu = document.getElementById('menu-toggle-in-menu');

    if (!menu || !overlay || !menuToggleInMenu) return;

    menu.classList.remove('active');
    overlay.classList.remove('active');
    menuToggleInMenu.classList.remove('active');

    document.body.classList.remove('no-scroll');
}

function closeModal(modalId = 'product-modal') {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
    document.body.classList.remove('no-scroll');

    if (modalId === 'pix-modal') {
        if (typeof verificacaoStatusInterval !== 'undefined' && verificacaoStatusInterval) {
            clearInterval(verificacaoStatusInterval);
            verificacaoStatusInterval = null;
        }
        if (typeof activeCheckoutButtonId !== 'undefined' && activeCheckoutButtonId) {
            hideLoading(activeCheckoutButtonId);
            activeCheckoutButtonId = null; 
        }
    }
}

function mostrarModalErroDownload(mensagem) {
    const modal = document.getElementById('download-error-modal');
    const messageElement = document.getElementById('download-error-message');

    if (!modal || !messageElement) {
        console.error("Modal de erro de download não encontrado. Usando fallback de notificação.");
        mostrarNotificacao(mensagem, 'erro');
        return;
    }

    messageElement.textContent = "Conforme as regras da plataforma, estipuladas no manual geral, " + mensagem.toLowerCase();
    modal.style.display = 'flex';
    document.body.classList.add('no-scroll');
}

function inicializarTooltips() {
    const helpIcons = document.querySelectorAll('.help-icon');

    helpIcons.forEach(icon => {
        const tooltipText = icon.getAttribute('title') || icon.dataset.tooltip;
        if (!tooltipText) return;

        icon.removeAttribute('title');
        icon.setAttribute('data-tooltip', tooltipText);

        icon.addEventListener('mouseenter', function() {
            showTooltip(this, tooltipText);
        });

        icon.addEventListener('mouseleave', function() {
            hideTooltip();
        });
    });
}

function showTooltip(element, text) {
    hideTooltip();

    const tooltip = document.createElement('div');
    tooltip.className = 'custom-tooltip';
    tooltip.textContent = text;
    document.body.appendChild(tooltip);

    const rect = element.getBoundingClientRect();
    tooltip.style.top = (rect.bottom + 10 + window.scrollY) + 'px';
    tooltip.style.left = (rect.left + rect.width / 2 - tooltip.offsetWidth / 2) + 'px';

    setTimeout(() => {
        tooltip.classList.add('show');
    }, 10);
}

function hideTooltip() {
    const tooltip = document.querySelector('.custom-tooltip');
    if (tooltip) {
        tooltip.remove();
    }
}

function initUINavigation() {
    inicializarTooltips();
    
    const navButtons = document.querySelectorAll('.header-nav-btn, .bottom-nav-item, #menu-instructions');
    const tabContents = document.querySelectorAll('.tab-content');
    const filterContainer = document.querySelector('.filter-container');

    navButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            if (this.tagName === 'A') {
                e.preventDefault();
            }

            const tabId = this.getAttribute('data-tab');
            if (!tabId) return;

            if (filterContainer) {
                if (tabId === 'carrinho' || tabId === 'pedidos' || tabId === 'vip' || tabId === 'manual') {
                    filterContainer.style.display = 'none';
                } else {
                    filterContainer.style.display = 'flex';
                }
            }

            navButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            document.querySelectorAll(`[data-tab="${tabId}"]`).forEach(b => b.classList.add('active'));

            const currentTabContent = document.getElementById(tabId);
            if (currentTabContent) {
                currentTabContent.classList.add('active');
            }
            
            if (tabId === 'manual') {
                const iframe = document.getElementById('manual-iframe');
                if (iframe && iframe.src === 'about:blank') {
                    iframe.src = 'public/manual.html';
                }
            }

            if (tabId === 'pedidos' && typeof carregarPedidos === 'function') {
                carregarPedidos();
            }
            if (tabId === 'carrinho' && typeof atualizarCarrinho === 'function') {
                atualizarCarrinho();
            }
            if (tabId === 'vip' && typeof startCountdown === 'function') {
                startCountdown();
            } else if (typeof toggleCountdownPause === 'function') {
                toggleCountdownPause(true);
            }
            
            if (window.innerWidth <= 992) {
                closeMenuLateral();
            }
        });
    });

    const menuToggleBottomNav = document.getElementById('bottom-nav-menu-toggle');
    const menuToggleInMenu = document.getElementById('menu-toggle-in-menu');
    const overlay = document.getElementById('overlay');

    if (menuToggleBottomNav) menuToggleBottomNav.addEventListener('click', toggleMenuLateral);
    if (menuToggleInMenu) menuToggleInMenu.addEventListener('click', toggleMenuLateral);
    if (overlay) overlay.addEventListener('click', closeMenuLateral);

    const menuLogoutMobile = document.getElementById('menu-logout-mobile');
    if (menuLogoutMobile) menuLogoutMobile.addEventListener('click', (e) => { e.preventDefault(); logout(); });

    const logoutBtnDesktop = document.getElementById('logout-btn-desktop');
    if (logoutBtnDesktop) logoutBtnDesktop.addEventListener('click', logout);

    window.addEventListener('resize', function() {
        if (window.innerWidth <= 768) {
            window.addEventListener('scroll', checarProdutoCentral);
        } else {
            window.removeEventListener('scroll', checarProdutoCentral);
            document.querySelectorAll('.product-card.center-focus').forEach(card => {
                card.classList.remove('center-focus');
                const galleryIcon = card.querySelector('.gallery-icon.auto-show');
                if (galleryIcon) galleryIcon.classList.remove('auto-show');
            });
        }
        ajustarAlturaContainers();
    });

    const closeButtons = document.querySelectorAll('.close-modal');
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) closeModal(modal.id);
        });
    });
    
    if (window.innerWidth <= 768) {
        window.addEventListener('scroll', checarProdutoCentral);
    }

    inicializarInterfaceCheckout();
    adicionarContadorCarrinhoHeaderDesktop();
}

function adicionarContadorCarrinhoHeaderDesktop() {
    const contadorHeader = document.getElementById('cart-count-header-desktop');
    if (contadorHeader && typeof cart !== 'undefined') {
         const quantidade = cart.reduce((total, item) => total + item.quantidade, 0);
         contadorHeader.textContent = quantidade;
    }
}

function checarProdutoCentral() {
    const lojaTabActive = document.getElementById('loja')?.classList.contains('active');
    const pedidosTabActive = document.getElementById('pedidos')?.classList.contains('active');

    let activeContainerSelector;
    if (lojaTabActive) {
        activeContainerSelector = '#product-grid';
    } else if (pedidosTabActive) {
        activeContainerSelector = '#pedidos-list .product-grid';
    } else {
        return;
    }

    const activeContainer = document.querySelector(activeContainerSelector);
    if (!activeContainer) return;

    const cards = activeContainer.querySelectorAll('.product-card');
    if (cards.length === 0) return;

    const viewportHeight = window.innerHeight;
    const viewportCenterY = viewportHeight / 2;

    let closestCard = null;
    let minDistance = Infinity;

    cards.forEach(card => {
        card.classList.remove('center-focus');
        const galleryIcon = card.querySelector('.gallery-icon');
        if (galleryIcon) galleryIcon.classList.remove('auto-show');

        const rect = card.getBoundingClientRect();
        if (rect.bottom > 0 && rect.top < viewportHeight) {
            const cardCenterY = rect.top + rect.height / 2;
            const distance = Math.abs(viewportCenterY - cardCenterY);

            if (distance < minDistance) {
                minDistance = distance;
                closestCard = card;
            }
        }
    });

    if (closestCard) {
        const threshold = viewportHeight / 4;
        if (minDistance < threshold) {
            closestCard.classList.add('center-focus');
            const galleryIcon = closestCard.querySelector('.gallery-icon');
            if (galleryIcon) galleryIcon.classList.add('auto-show');
        }
    }
}

function navegarCheckout(direcao) {
    const etapasCheckout = document.querySelectorAll('.checkout-step');
    if (etapasCheckout.length === 0) return;
    let etapaAtualIndex = 0;

    etapasCheckout.forEach((etapa, index) => {
        if (etapa.classList.contains('active')) {
            etapaAtualIndex = index;
        }
    });

    const proximaEtapaIndex = etapaAtualIndex + direcao;

    if (proximaEtapaIndex >= 0 && proximaEtapaIndex < etapasCheckout.length) {
        if (direcao > 0 && !validarEtapaCheckout(etapaAtualIndex)) {
            return;
        }

        etapasCheckout.forEach(etapa => etapa.classList.remove('active'));
        etapasCheckout[proximaEtapaIndex].classList.add('active');
        atualizarBotoesCheckout(proximaEtapaIndex, etapasCheckout.length);
        atualizarProgressoCheckout(proximaEtapaIndex, etapasCheckout.length);
    }
}

function validarEtapaCheckout(etapaIndex) {
    switch(etapaIndex) {
        case 0:
            if (typeof cart !== 'undefined' && cart.length === 0) {
                mostrarNotificacao('Seu carrinho está vazio', 'erro');
                return false;
            }
            return true;
        case 1:
            const metodoPagamentoInput = document.getElementById('metodo-pagamento');
            if (!metodoPagamentoInput || !metodoPagamentoInput.value) {
                mostrarNotificacao('Selecione um método de pagamento', 'erro');
                return false;
            }
            return true;
        default:
            return true;
    }
}

function atualizarBotoesCheckout(etapaAtual, totalEtapas) {
    const passoAnteriorBtn = document.getElementById('passo-anterior-btn');
    const proximoPassoBtn = document.getElementById('proximo-passo-btn');
    const finalizarCompraBtn = document.getElementById('finalizar-compra-btn');

    if (!passoAnteriorBtn || !proximoPassoBtn || !finalizarCompraBtn) return;

    passoAnteriorBtn.style.display = (etapaAtual === 0) ? 'none' : 'flex';
    proximoPassoBtn.style.display = (etapaAtual === totalEtapas - 1) ? 'none' : 'flex';
    finalizarCompraBtn.style.display = (etapaAtual === totalEtapas - 1) ? 'flex' : 'none';
}

function atualizarProgressoCheckout(etapaAtual, totalEtapas) {
    const progressoIndicator = document.getElementById('checkout-progress-indicator');
    const progressoTexto = document.getElementById('checkout-progress-text');

    if (progressoIndicator) {
        const porcentagem = totalEtapas > 0 ? ((etapaAtual + 1) / totalEtapas) * 100 : 0;
        progressoIndicator.style.width = `${porcentagem}%`;
    }
    if (progressoTexto) {
        progressoTexto.textContent = totalEtapas > 0 ? `Etapa ${etapaAtual + 1} de ${totalEtapas}` : 'Checkout';
    }
}

function ajustarAlturaContainers() {
    const paddingValue = '20px';
    document.querySelectorAll('#pedidos-list .product-grid, #loja .product-grid').forEach(grid => {
        grid.style.paddingBottom = paddingValue;
    });
}

function inicializarInterfaceCheckout() {
    const passoAnteriorBtn = document.getElementById('passo-anterior-btn');
    const proximoPassoBtn = document.getElementById('proximo-passo-btn');

    if (passoAnteriorBtn) passoAnteriorBtn.addEventListener('click', () => navegarCheckout(-1));
    if (proximoPassoBtn) proximoPassoBtn.addEventListener('click', () => navegarCheckout(1));

    const metodosBotoes = document.querySelectorAll('.metodo-pagamento-btn');
    metodosBotoes.forEach(botao => {
        botao.addEventListener('click', function() {
            metodosBotoes.forEach(b => b.classList.remove('selected'));
            this.classList.add('selected');
            const metodoInput = document.getElementById('metodo-pagamento');
            if(metodoInput) metodoInput.value = this.getAttribute('data-method');

            const metodoPix = document.getElementById('metodo-pix');
            const metodoCartao = document.getElementById('metodo-cartao');

            if (metodoPix && metodoCartao) {
                if (this.getAttribute('data-method') === 'pix') {
                    metodoPix.style.display = 'block';
                    metodoCartao.style.display = 'none';
                } else {
                    metodoPix.style.display = 'none';
                    metodoCartao.style.display = 'block';
                }
            }
        });
    });
}

function initVipSection() {
    console.log("Inicializando seção VIP...");
    startCountdown();
    setupPricingButtons();
}

function startCountdown() {
    const countdownElement = document.getElementById('countdown');
    if (!countdownElement) return;
    
    const hoursElement = document.getElementById('hours');
    const minutesElement = document.getElementById('minutes');
    const secondsElement = document.getElementById('seconds');
    
    if (!hoursElement || !minutesElement || !secondsElement) {
        console.error("Elementos de contagem regressiva não encontrados");
        return;
    }
    
    let endTime = null;
    
    try {
        const savedEndTime = localStorage.getItem('vip_countdown_end');
        if (savedEndTime) {
            endTime = new Date(savedEndTime);
            if (endTime <= new Date()) {
                endTime = null;
            }
        }
    } catch (e) {
        console.warn("Erro ao recuperar timer armazenado:", e);
    }
    
    if (!endTime) {
        endTime = new Date();
        endTime.setHours(endTime.getHours() + 2);
        try {
            localStorage.setItem('vip_countdown_end', endTime.toISOString());
        } catch (e) {
            console.warn("Erro ao salvar timer:", e);
        }
    }
    
    function updateCountdown() {
        const currentTime = new Date();
        const diff = endTime - currentTime;
        
        if (diff <= 0) {
            endTime = new Date();
            endTime.setHours(endTime.getHours() + 2);
            try {
                localStorage.setItem('vip_countdown_end', endTime.toISOString());
            } catch (e) {
                console.warn("Erro ao salvar timer:", e);
            }
            updateCountdown();
            return;
        }
        
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        hoursElement.textContent = hours.toString().padStart(2, '0');
        minutesElement.textContent = minutes.toString().padStart(2, '0');
        secondsElement.textContent = seconds.toString().padStart(2, '0');
    }
    
    updateCountdown();
    const intervalId = setInterval(updateCountdown, 1000);
    countdownElement.dataset.intervalId = intervalId;
}

function setupPricingButtons() {
    const standardButton = document.querySelector('.pricing-card.normal .pricing-button');
    if (standardButton) {
        standardButton.addEventListener('click', function(e) {
            if (sessionStorage.getItem('currentUser')) {
                e.preventDefault();
                mostrarNotificacao('Você já possui uma conta padrão.', 'sucesso');
            }
        });
    }
    
    const vipButton = document.querySelector('.pricing-card.vip .pricing-button');
    if (vipButton) {
        vipButton.addEventListener('click', function(e) {
            e.preventDefault();
            
            if (!sessionStorage.getItem('currentUser')) {
                mostrarNotificacao('Faça login primeiro para assinar o plano VIP.', 'erro');
                setTimeout(() => {
                    window.location.href = 'auth.html';
                }, 1500);
                return;
            }
            
            if (sessionStorage.getItem('isVIP') === 'true') {
                mostrarNotificacao('Você já possui assinatura VIP ativa!', 'sucesso');
                return;
            }
            
            processarAssinaturaVIP();
        });
    }
}

function processarAssinaturaVIP() {
    const carrinhoTabDesktop = document.querySelector('.header-nav-btn[data-tab="carrinho"]');
    const carrinhoTabMobile = document.querySelector('.bottom-nav-item[data-tab="carrinho"]');

    if (typeof window.adicionarAoCarrinho === 'function') {
        window.adicionarAoCarrinho('360');
        
        setTimeout(() => {
            if (carrinhoTabDesktop && window.getComputedStyle(carrinhoTabDesktop).display !== 'none') {
                carrinhoTabDesktop.click();
            } else if (carrinhoTabMobile) {
                carrinhoTabMobile.click();
            }
        }, 300);
    } else {
        mostrarNotificacao('Erro ao processar assinatura. Contate o suporte.', 'erro');
        console.error("Função adicionarAoCarrinho não encontrada.");
    }
}

function toggleCountdownPause(isPaused) {
    const countdownElement = document.getElementById('countdown');
    if (!countdownElement) return;
    
    const intervalId = countdownElement.dataset.intervalId;
    
    if (isPaused && intervalId) {
        clearInterval(parseInt(intervalId));
        countdownElement.dataset.intervalId = '';
    } else if (!isPaused && !intervalId) {
        startCountdown();
    }
}

function initializeApp() {
    console.log("Inicializando a aplicação principal...");

    if (currentUser) {
        if (typeof initUINavigation === 'function') initUINavigation();
        else console.error("initUINavigation não definida.");
    
        if (typeof initImageCache === 'function') initImageCache();
        else console.error("initImageCache não definida.");

        if (typeof handleHeaderVisibility === 'function') window.addEventListener('scroll', handleHeaderVisibility);
        else console.error("handleHeaderVisibility não definida.");

        if (typeof handleKeyNavigation === 'function') window.addEventListener('keydown', handleKeyNavigation);
        else console.warn("handleKeyNavigation não definida.");

        if (typeof setupTouchListeners === 'function') setupTouchListeners();
        else console.warn("setupTouchListeners não definida.");

        if (typeof atualizarContadorCarrinho === 'function') atualizarContadorCarrinho();
        else console.error("atualizarContadorCarrinho não definida.");
        
        if (typeof ajustarAlturaContainers === 'function') {
            ajustarAlturaContainers();
            window.addEventListener('resize', ajustarAlturaContainers);
        } else {
            console.error("ajustarAlturaContainers não definida.");
        }
        
        if (typeof carregarProdutosDaPlanilha === 'function') carregarProdutosDaPlanilha();
        else console.error("carregarProdutosDaPlanilha não definida.");

        const searchInput = document.getElementById('product-search');
        if (searchInput && typeof pesquisarProdutos === 'function') {
            searchInput.addEventListener('input', pesquisarProdutos);
        }
    } else {
        console.log("Usuário não logado, redirecionamento gerenciado por core.js");
    }
}

document.addEventListener('optimisticRenderComplete', initializeApp);

document.addEventListener('userStateSynced', function() {
    console.log("Estado sincronizado com o servidor. Recarregando componentes dependentes de estado.");
    if (typeof carregarProdutosDaPlanilha === 'function') {
        carregarProdutosDaPlanilha();
    }
});