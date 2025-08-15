document.addEventListener('DOMContentLoaded', function() {
    // Função para detectar a cor dominante na viewport atual e atualizar a barra
    function updateThemeColorCamaleao() {
        // Detectar os elementos principais visíveis na viewport
        const viewportElements = getVisibleElements();
        
        // Se não encontrar elementos visíveis, usa a cor do body
        if (viewportElements.length === 0) {
            const backgroundColor = window.getComputedStyle(document.body).backgroundColor;
            updateMetaTags(backgroundColor);
            return;
        }
        
        // Encontrar o elemento com maior área visível
        const dominantElement = findDominantElement(viewportElements);
        
        // Obter a cor de fundo do elemento dominante
        const backgroundColor = window.getComputedStyle(dominantElement).backgroundColor;
        
        // Se a cor for transparente ou não definida, use a cor do body
        if (backgroundColor === 'transparent' || backgroundColor === 'rgba(0, 0, 0, 0)') {
            const bodyColor = window.getComputedStyle(document.body).backgroundColor;
            updateMetaTags(bodyColor);
        } else {
            updateMetaTags(backgroundColor);
        }
    }

    // Função para obter elementos visíveis na viewport
    function getVisibleElements() {
        // Seleciona todos os elementos que podem ter cores de fundo relevantes
        const allElements = document.querySelectorAll('.section-bg-dark, .section-bg-light, .hero-section, .welcome-modal, .navbar, .section-standard, .footer');
        const viewportHeight = window.innerHeight;
        const scrollTop = window.scrollY;
        const viewportBottom = scrollTop + viewportHeight;
        
        // Filtra apenas os elementos visíveis na viewport
        return Array.from(allElements).filter(element => {
            const rect = element.getBoundingClientRect();
            const elementTop = scrollTop + rect.top;
            const elementBottom = scrollTop + rect.bottom;
            
            // Verifica se o elemento está pelo menos parcialmente visível
            return (elementBottom > scrollTop && elementTop < viewportBottom);
        });
    }

    // Função para encontrar o elemento dominante (com maior área visível)
    function findDominantElement(elements) {
        if (elements.length === 0) return document.body;
        if (elements.length === 1) return elements[0];
        
        const viewportHeight = window.innerHeight;
        const scrollTop = window.scrollY;
        
        // Calcula a área visível de cada elemento
        const elementsWithArea = elements.map(element => {
            const rect = element.getBoundingClientRect();
            const elementTop = Math.max(0, rect.top);
            const elementBottom = Math.min(viewportHeight, rect.bottom);
            const visibleHeight = Math.max(0, elementBottom - elementTop);
            const visibleWidth = rect.width;
            const visibleArea = visibleHeight * visibleWidth;
            
            return { element, visibleArea };
        });
        
        // Ordena por área visível em ordem decrescente
        elementsWithArea.sort((a, b) => b.visibleArea - a.visibleArea);
        
        // Retorna o elemento com maior área visível
        return elementsWithArea[0].element;
    }

    // Função para atualizar as meta tags com a cor fornecida
    function updateMetaTags(backgroundColor) {
        // Seleciona a meta tag theme-color
        let metaThemeColor = document.querySelector('meta[name="theme-color"]');
        
        // Se a meta tag não existir, cria uma nova
        if (!metaThemeColor) {
            metaThemeColor = document.createElement('meta');
            metaThemeColor.name = 'theme-color';
            document.head.appendChild(metaThemeColor);
        }
        
        // Atualiza o conteúdo da meta tag com a cor de fundo atual
        metaThemeColor.content = backgroundColor;
        
        // Também atualiza a meta tag para iOS
        let metaAppleStatusBar = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
        
        // Se a meta tag para iOS não existir, cria uma nova
        if (!metaAppleStatusBar) {
            metaAppleStatusBar = document.createElement('meta');
            metaAppleStatusBar.name = 'apple-mobile-web-app-status-bar-style';
            document.head.appendChild(metaAppleStatusBar);
        }
        
        // Se a cor for escura, usa black-translucent, senão usa default
        const rgb = backgroundColor.match(/\d+/g);
        if (rgb && rgb.length >= 3) {
            // Calcula o brilho (usando fórmula de luminância percebida)
            const brightness = (parseInt(rgb[0]) * 299 + parseInt(rgb[1]) * 587 + parseInt(rgb[2]) * 114) / 1000;
            if (brightness < 128) {
                metaAppleStatusBar.content = 'black-translucent';
            } else {
                metaAppleStatusBar.content = 'default';
            }
        }
    }

    // Verificação para detectar se o dispositivo é móvel (largura menor que 768px)
    const isMobile = () => {
        return window.innerWidth < 768;
    };

    // Função para encontrar elementos centrais na viewport - Super Otimizada
    function findCenteredElements(selector) {
        // Executa apenas em dispositivos móveis
        if (!isMobile()) return;
        
        const elements = document.querySelectorAll(selector);
        const viewportHeight = window.innerHeight;
        const viewportCenter = viewportHeight / 2;
        
        // Manter registro do elemento mais próximo do centro
        let closestElement = null;
        let closestDistance = Infinity;
        
        // Primeiro, encontra o elemento mais próximo do centro
        elements.forEach(element => {
            const rect = element.getBoundingClientRect();
            
            // Pula elementos claramente fora da viewport
            if (rect.bottom < 0 || rect.top > viewportHeight) {
                return;
            }
            
            const elementCenter = rect.top + (rect.height / 2);
            const distanceFromCenter = Math.abs(viewportCenter - elementCenter);
            
            // Se este elemento estiver mais próximo do centro que o anterior
            if (distanceFromCenter < closestDistance) {
                closestDistance = distanceFromCenter;
                closestElement = element;
            }
        });
        
        // Agora verifica se o elemento mais próximo está próximo o suficiente do centro
        // Reduzimos a tolerância para um valor menor para tornar a seleção mais precisa
        const toleranceThreshold = viewportHeight * 0.2; // 20% da altura da viewport
        
        // Aplica a classe apenas se estiver realmente próximo do centro
        requestAnimationFrame(() => {
            elements.forEach(element => {
                // Remover a classe de todos os elementos
                if (element.classList.contains('centered-active')) {
                    element.classList.remove('centered-active');
                    setTimeout(() => {
                        element.style.willChange = 'auto';
                    }, 300);
                }
            });
            
            // Adiciona a classe apenas ao elemento mais próximo E se estiver dentro da tolerância
            if (closestElement && closestDistance < toleranceThreshold) {
                closestElement.classList.add('centered-active');
                closestElement.style.willChange = 'transform, box-shadow';
            }
        });
    }

    // Modal de Entrada - Ajustado para aparecer imediatamente
    const welcomeModal = document.getElementById('welcomeModal');
    const exploreButton = document.getElementById('exploreButton');
    const modalContent = document.querySelector('.welcome-modal');
    
    // Criar linhas de circuito
    const circuitContainer = document.getElementById('modalCircuit');
    if (circuitContainer) {
        // Adiciona linhas de circuito
        for (let i = 0; i < 8; i++) {
            const line = document.createElement('div');
            line.className = 'circuit-line';
            
            // Posição e tamanho aleatórios
            const startX = Math.random() * 100;
            const startY = Math.random() * 100;
            const width = Math.random() * 100 + 50;
            const height = Math.random() < 0.5 ? 2 : Math.random() < 0.8 ? 2 : 4;
            
            line.style.left = `${startX}px`;
            line.style.top = `${startY}px`;
            line.style.width = `${width}px`;
            line.style.height = `${height}px`;
            
            circuitContainer.appendChild(line);
            
            // Adiciona dot no final da linha
            const dot = document.createElement('div');
            dot.className = 'circuit-dot';
            dot.style.left = `${startX + width}px`;
            dot.style.top = `${startY + height/2 - 2}px`;
            circuitContainer.appendChild(dot);
        }
        
        // Adiciona alguns dots isolados
        for (let i = 0; i < 15; i++) {
            const dot = document.createElement('div');
            dot.className = 'circuit-dot';
            
            const posX = Math.random() * 100;
            const posY = Math.random() * 100;
            
            dot.style.left = `${posX}%`;
            dot.style.top = `${posY}%`;
            
            circuitContainer.appendChild(dot);
        }
    }
    
    // Impedir rolagem quando modal estiver aberto
    document.body.classList.add('modal-open');
    
    // Mostrar o modal imediatamente
    welcomeModal.style.display = 'flex';
    welcomeModal.style.opacity = '1';
    
    // Pequena animação para entrada do conteúdo do modal
    setTimeout(() => {
        modalContent.style.opacity = '1';
        modalContent.style.transform = 'scale(1)';
        
        // Atualizar a cor da barra após o modal estar visível
        updateThemeColorCamaleao();
    }, 100);
    
    // Evento de clique no botão "Quero Conhecer"
    exploreButton.addEventListener('click', function() {
        modalContent.style.opacity = '0';
        modalContent.style.transform = 'scale(0.8)';
        
        setTimeout(() => {
            welcomeModal.style.opacity = '0';
            
            setTimeout(() => {
                welcomeModal.style.display = 'none';
                // Permitir rolagem novamente
                document.body.classList.remove('modal-open');
                
                // Atualizar a cor da barra após fechar o modal
                updateThemeColorCamaleao();
            }, 400);
        }, 200);
    });
    
    // Menu Mobile Toggle
    const menuToggle = document.getElementById('menu-toggle');
    const menuToggleInMenu = document.getElementById('menu-toggle-in-menu');
    const mobileMenu = document.getElementById('mobile-menu');
    const overlay = document.getElementById('overlay');
    const mobileLinks = document.querySelectorAll('.mobile-link');
    
    function toggleMenu() {
        menuToggle.classList.toggle('active');
        menuToggleInMenu.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        overlay.classList.toggle('active');
        document.body.classList.toggle('menu-open');
        
        // Atualizar a cor da barra após abrir/fechar o menu
        setTimeout(updateThemeColorCamaleao, 100);
    }
    
    menuToggle.addEventListener('click', toggleMenu);
    menuToggleInMenu.addEventListener('click', toggleMenu);
    overlay.addEventListener('click', toggleMenu);
    
    mobileLinks.forEach(link => {
        link.addEventListener('click', toggleMenu);
    });

    // Cabeçalho que recolhe ao rolar para baixo e aparece ao rolar para cima
    const navbar = document.querySelector('.navbar');
    let lastScrollTop = 0;
    
    window.addEventListener('scroll', function() {
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Aparecer ao rolar para cima e desaparecer ao rolar para baixo
        if (scrollTop > 100) {
            if (scrollTop > lastScrollTop) {
                // Rolando para baixo
                navbar.classList.add('hide');
            } else {
                // Rolando para cima
                navbar.classList.remove('hide');
            }
            lastScrollTop = scrollTop;
        }
        
        // Classe scrolled para mudar o estilo da navbar
        if (scrollTop > 60) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
            navbar.classList.remove('hide');
        }
    });

    // Scroll to Top Button
    const scrollToTopBtn = document.getElementById('scrollToTop');
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 400) {
            scrollToTopBtn.classList.add('visible');
        } else {
            scrollToTopBtn.classList.remove('visible');
        }
    });
    
    scrollToTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // MODIFICADO: Apenas primeiro FAQ item expandido
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach((item, index) => {
        const question = item.querySelector('.faq-question');
        const icon = question.querySelector('i');
        
        // Apenas o primeiro item começa expandido
        if (index === 0) {
            item.classList.add('active');
            icon.style.transform = 'rotate(180deg)';
        } else {
            item.classList.remove('active');
            icon.style.transform = 'rotate(0deg)';
        }
        
        question.addEventListener('click', () => {
            // Toggle current item
            item.classList.toggle('active');
            
            if (item.classList.contains('active')) {
                icon.style.transform = 'rotate(180deg)';
            } else {
                icon.style.transform = 'rotate(0deg)';
            }
            
            // Atualizar a cor da barra após expandir/colapsar
            setTimeout(updateThemeColorCamaleao, 300);
        });
    });

    // Smooth Scroll for Anchor Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            if (this.getAttribute('href') !== "#") {
                e.preventDefault();
                
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    const navbarHeight = document.querySelector('.navbar').offsetHeight;
                    const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navbarHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // Feedbacks Grid - Mostrar feedbacks lado a lado
    const feedbacksGrid = document.getElementById('feedbacks-grid');
    const lightbox = document.getElementById('feedback-lightbox');
    const lightboxImage = document.getElementById('lightbox-image');
    const lightboxClose = document.getElementById('lightbox-close');
    const lightboxPrev = document.getElementById('lightbox-prev');
    const lightboxNext = document.getElementById('lightbox-next');
    const lightboxCurrent = document.getElementById('lightbox-current');
    const lightboxTotal = document.getElementById('lightbox-total');
    
    // Feedbacks atualizados para maior impacto
    const feedbacks = [
        {
            image: 'images/feeds/feed1.png',
            alt: 'Feedback de usuário mostrando sistema ultra-rápido'
        },
        {
            image: 'images/feeds/feed2.png',
            alt: 'Feedback de usuário sobre instalação em apenas 3 minutos'
        },
        {
            image: 'images/feeds/feed3.png',
            alt: 'Feedback de usuário relatando zero travamentos com nosso sistema'
        },
        {
            image: 'images/feeds/feed4.png',
            alt: 'Feedback de usuário sobre revitalização de PC antigo'
        },
        {
            image: 'images/feeds/feed5.png',
            alt: 'Feedback de gamer relatando melhoria de FPS com nosso sistema'
        }
    ];

    let currentFeedback = 0;
    const totalFeedbacks = feedbacks.length;
    
    // Populate feedbacks grid
    function populateFeedbacksGrid() {
        if (!feedbacksGrid) return;
        
        // Clear grid
        feedbacksGrid.innerHTML = '';
        
        // Add feedbacks to grid
        feedbacks.forEach((feedback, index) => {
            const feedbackItem = document.createElement('div');
            feedbackItem.className = 'feedback-item';
            
            const img = document.createElement('img');
            img.src = feedback.image;
            img.alt = feedback.alt;
            img.className = 'feedback-image';
            
            feedbackItem.addEventListener('click', () => openLightbox(index));
            feedbackItem.appendChild(img);
            feedbacksGrid.appendChild(feedbackItem);
        });
        
        // Update lightbox total
        if (lightboxTotal) {
            lightboxTotal.textContent = totalFeedbacks;
        }
    }
    
    // Open lightbox
    function openLightbox(index) {
        if (!lightbox) return;
        
        lightbox.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        goToLightboxImage(index);
        
        // Atualizar a cor da barra após abrir o lightbox
        setTimeout(updateThemeColorCamaleao, 100);
    }
    
    // Close lightbox
    function closeLightbox() {
        if (!lightbox) return;
        
        lightbox.style.display = 'none';
        document.body.style.overflow = '';
        
        // Atualizar a cor da barra após fechar o lightbox
        setTimeout(updateThemeColorCamaleao, 100);
    }
    
    // Navigate to lightbox image
    function goToLightboxImage(index) {
        if (index < 0) index = totalFeedbacks - 1;
        if (index >= totalFeedbacks) index = 0;
        
        currentFeedback = index;
        
        if (lightboxImage) {
            lightboxImage.src = feedbacks[index].image;
            lightboxImage.alt = feedbacks[index].alt;
        }
        
        // Update counter
        if (lightboxCurrent) {
            lightboxCurrent.textContent = index + 1;
        }
    }
    
    // Event listeners for lightbox
    if (lightboxClose && lightboxPrev && lightboxNext) {
        lightboxClose.addEventListener('click', closeLightbox);
        lightboxPrev.addEventListener('click', () => goToLightboxImage(currentFeedback - 1));
        lightboxNext.addEventListener('click', () => goToLightboxImage(currentFeedback + 1));
        
        // Close lightbox when clicking outside image
        lightbox.addEventListener('click', function(e) {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });
        
        // Keyboard navigation for lightbox
        document.addEventListener('keydown', function(e) {
            if (lightbox.style.display === 'flex') {
                if (e.key === 'Escape') closeLightbox();
                if (e.key === 'ArrowLeft') goToLightboxImage(currentFeedback - 1);
                if (e.key === 'ArrowRight') goToLightboxImage(currentFeedback + 1);
            }
        });
    }
    
    // Initialize feedbacks
    populateFeedbacksGrid();

    // Sistema FURY Gallery
    const systemGallery = document.getElementById('system-gallery');
    const systemLightbox = document.getElementById('system-lightbox');
    const systemLightboxImage = document.getElementById('system-lightbox-image');
    const systemLightboxClose = document.getElementById('system-lightbox-close');
    const systemLightboxPrev = document.getElementById('system-lightbox-prev');
    const systemLightboxNext = document.getElementById('system-lightbox-next');
    const systemLightboxCurrent = document.getElementById('system-lightbox-current');
    const systemLightboxTotal = document.getElementById('system-lightbox-total');

    // Imagens adicionais do sistema (além das 3 principais)
    const systemImages = [
        {
            image: 'images/sistema/detalhes1.png',
            alt: 'Interface otimizada do Sistema FURY'
        },
        {
            image: 'images/sistema/detalhes2.png',
            alt: 'Painel de controle simplificado do FURY'
        },
        {
            image: 'images/sistema/detalhes3.png',
            alt: 'Ferramentas exclusivas do Sistema FURY'
        },
        {
            image: 'images/sistema/detalhes4.png',
            alt: 'Desempenho superior do Sistema FURY'
        }
    ];

    let currentSystemImage = 0;
    const totalSystemImages = systemImages.length;

    // Populate system gallery
    function populateSystemGallery() {
        if (!systemGallery) return;
        
        // Clear gallery
        systemGallery.innerHTML = '';
        
        // Add system images to gallery
        systemImages.forEach((img, index) => {
            const galleryItem = document.createElement('div');
            galleryItem.className = 'system-gallery-item';
            
            const imgEl = document.createElement('img');
            imgEl.src = img.image;
            imgEl.alt = img.alt;
            imgEl.className = 'system-gallery-image';
            
            galleryItem.addEventListener('click', () => openSystemLightbox(index));
            galleryItem.appendChild(imgEl);
            systemGallery.appendChild(galleryItem);
        });
        
        // Update lightbox total
        if (systemLightboxTotal) {
            systemLightboxTotal.textContent = totalSystemImages;
        }
    }

    // Configurar lightbox para imagens principais do sistema
    document.querySelectorAll('.system-image-container').forEach((container, index) => {
        container.addEventListener('click', function() {
            const fullImageSrc = container.querySelector('.system-image').getAttribute('data-full-img');
            const fullImageAlt = container.querySelector('.system-image').getAttribute('alt');
            
            if (systemLightbox && systemLightboxImage) {
                systemLightboxImage.src = fullImageSrc;
                systemLightboxImage.alt = fullImageAlt;
                systemLightbox.style.display = 'flex';
                document.body.style.overflow = 'hidden';
                currentSystemImage = index;
                
                if (systemLightboxCurrent) {
                    systemLightboxCurrent.textContent = index + 1;
                }
                
                if (systemLightboxTotal) {
                    systemLightboxTotal.textContent = '3'; // As 3 imagens principais
                }
                
                // Atualizar a cor da barra após abrir o lightbox
                setTimeout(updateThemeColorCamaleao, 100);
            }
        });
    });

    // Open system lightbox for gallery
    function openSystemLightbox(index) {
        if (!systemLightbox) return;
        
        systemLightbox.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        goToSystemLightboxImage(index);
        
        // Atualizar a cor da barra após abrir o lightbox
        setTimeout(updateThemeColorCamaleao, 100);
    }

    // Close system lightbox
    function closeSystemLightbox() {
        if (!systemLightbox) return;
        
        systemLightbox.style.display = 'none';
        document.body.style.overflow = '';
        
        // Atualizar a cor da barra após fechar o lightbox
        setTimeout(updateThemeColorCamaleao, 100);
    }

    // Navigate to system lightbox image
    function goToSystemLightboxImage(index) {
        if (index < 0) index = totalSystemImages - 1;
        if (index >= totalSystemImages) index = 0;
        
        currentSystemImage = index;
        
        if (systemLightboxImage) {
            systemLightboxImage.src = systemImages[index].image;
            systemLightboxImage.alt = systemImages[index].alt;
        }
        
        // Update counter
        if (systemLightboxCurrent) {
            systemLightboxCurrent.textContent = index + 1;
        }
    }

    // Event listeners for system lightbox
    if (systemLightboxClose && systemLightboxPrev && systemLightboxNext) {
        systemLightboxClose.addEventListener('click', closeSystemLightbox);
        systemLightboxPrev.addEventListener('click', () => goToSystemLightboxImage(currentSystemImage - 1));
        systemLightboxNext.addEventListener('click', () => goToSystemLightboxImage(currentSystemImage + 1));
        
        // Close lightbox when clicking outside image
        systemLightbox.addEventListener('click', function(e) {
            if (e.target === systemLightbox) {
                closeSystemLightbox();
            }
        });
        
        // Keyboard navigation for lightbox
        document.addEventListener('keydown', function(e) {
            if (systemLightbox.style.display === 'flex') {
                if (e.key === 'Escape') closeSystemLightbox();
                if (e.key === 'ArrowLeft') goToSystemLightboxImage(currentSystemImage - 1);
                if (e.key === 'ArrowRight') goToSystemLightboxImage(currentSystemImage + 1);
            }
        });
    }

    // Initialize system gallery
    populateSystemGallery();

    // Animate on Scroll Effect para elementos com fade-in
    const fadeElements = document.querySelectorAll('.fade-in');
    
    function checkFadeElements() {
        const triggerBottom = window.innerHeight * 0.8;
        
        fadeElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            
            if (elementTop < triggerBottom) {
                element.classList.add('active');
            }
        });
    }
    
    window.addEventListener('scroll', checkFadeElements);
    window.addEventListener('resize', checkFadeElements);
    checkFadeElements();

    // Counter Animation para Stats - Inicia mais rápido e com valores maiores
    function animateCounters() {
        const usersCounter = document.getElementById('users-counter');
        const systemsCounter = document.getElementById('systems-counter');
        const hoursCounter = document.getElementById('hours-counter');
        
        if (!usersCounter || !systemsCounter || !hoursCounter) return;
        
        const counters = [
            { element: usersCounter, target: 10723, increment: 100, prefix: '', suffix: '' },
            { element: systemsCounter, target: 25648, increment: 200, prefix: '', suffix: '' },
            { element: hoursCounter, target: 17080, increment: 150, prefix: '', suffix: '+' }
        ];
        
        let counterObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    counters.forEach(counter => {
                        let currentValue = 0;
                        
                        const updateCounter = () => {
                            if (currentValue < counter.target) {
                                currentValue += counter.increment;
                                if (currentValue > counter.target) {
                                    currentValue = counter.target;
                                }
                                counter.element.textContent = counter.prefix + currentValue.toLocaleString() + counter.suffix;
                                requestAnimationFrame(updateCounter);
                            }
                        };
                        
                        updateCounter();
                    });
                    
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 }); // Reduzido para iniciar mais cedo
        
        counterObserver.observe(document.querySelector('.stats-counter'));
    }
    
    animateCounters();

    // Highlight current section in navbar
    function highlightNav() {
        const scrollPosition = window.scrollY;
        
        // Get all sections and corresponding nav links
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.desktop-nav a[href^="#"]');
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                // Remove active class from all nav links
                navLinks.forEach(link => {
                    link.classList.remove('active-nav');
                });
                
                // Add active class to corresponding nav link
                document.querySelector(`.desktop-nav a[href="#${sectionId}"]`)?.classList.add('active-nav');
            }
        });
    }
    
    window.addEventListener('scroll', highlightNav);
    highlightNav();

    // Hover Effect for Comparisons Table - Enfatizado
    const comparisonRows = document.querySelectorAll('.comparison-table tr');
    
    comparisonRows.forEach(row => {
        row.addEventListener('mouseenter', () => {
            row.style.backgroundColor = 'rgba(0, 179, 119, 0.15)';
        });
        
        row.addEventListener('mouseleave', () => {
            row.style.backgroundColor = '';
        });
    });

    // Preload Images para Performance - Prioriza imagens críticas
    function preloadImages() {
        // Preload de feedbacks
        feedbacks.forEach(feedback => {
            const img = new Image();
            img.src = feedback.image;
        });
        
        // Preload de imagens do sistema FURY
        systemImages.forEach(sysImg => {
            const img = new Image();
            img.src = sysImg.image;
        });
        
        // Preload das imagens do sistema principais
        document.querySelectorAll('.system-image').forEach(img => {
            const fullImg = new Image();
            fullImg.src = img.getAttribute('data-full-img');
        });
        
        // Preload de imagens críticas (ordem de prioridade)
        const criticalImages = [
            'images/tempo.gif',        // GIF de urgência (máxima prioridade)
            'images/tela_azul.png',    // Imagem de problema (alta prioridade)
            'images/Sucesso.png'       // Imagem de solução (alta prioridade)
        ];
        
        criticalImages.forEach((imgSrc, index) => {
            const img = new Image();
            // Prioriza o GIF para carregamento mais rápido
            img.importance = index === 0 ? "high" : "auto";
            img.src = imgSrc;
        });
    }
    
    // Executar preload imediatamente
    preloadImages();
    
    // Adicionar classe de destaque para a última linha da tabela comparativa
    setTimeout(() => {
        const comparisonTable = document.querySelector('.comparison-table table');
        if (comparisonTable) {
            const lastRow = comparisonTable.querySelector('tbody tr:last-child');
            if (lastRow) {
                lastRow.classList.add('highlight-row');
            }
        }
    }, 1000);
    
    // MODIFICADO: Todos os feature cards começam expandidos
    // Inicializar todos os feature cards como expandidos
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach(card => {
        card.classList.add('active');
        const icon = card.querySelector('.feature-header i');
        if (icon) icon.style.transform = 'rotate(180deg)';
    });
    
    // Manter evento de clique para toggle
    const featureHeaders = document.querySelectorAll('.feature-header');
    featureHeaders.forEach(header => {
        header.addEventListener('click', function() {
            const card = this.parentElement;
            card.classList.toggle('active');
            
            const icon = this.querySelector('i');
            if (card.classList.contains('active')) {
                icon.style.transform = 'rotate(180deg)';
            } else {
                icon.style.transform = 'rotate(0deg)';
            }
            
            // Atualizar a cor da barra após expandir/colapsar
            setTimeout(updateThemeColorCamaleao, 300);
        });
    });

    // Ajustar imagens principais para preenchimento adequado
    function adjustImages() {
        const problemImage = document.querySelector('.problem-image .feature-image');
        const solutionImage = document.querySelector('.solution-image .feature-image');
        const tempoGif = document.querySelector('.tempo-gif');
        
        if (problemImage && solutionImage && tempoGif) {
            // Verifica se as imagens carregaram corretamente
            if (problemImage.complete && solutionImage.complete && tempoGif.complete) {
                // Adiciona classe para indicar que as imagens estão prontas
                problemImage.parentElement.classList.add('image-loaded');
                solutionImage.parentElement.classList.add('image-loaded');
                tempoGif.parentElement.classList.add('image-loaded');
            } else {
                // Adiciona evento para quando as imagens carregarem
                problemImage.onload = () => problemImage.parentElement.classList.add('image-loaded');
                solutionImage.onload = () => solutionImage.parentElement.classList.add('image-loaded');
                tempoGif.onload = () => tempoGif.parentElement.classList.add('image-loaded');
            }
        }
    }
    
    // Event listener para scroll otimizado com support para função de encontrar elementos centrais e atualizar cor
    let scrollTimeout;
    let ticking = false;
    let lastScrollHandled = 0;
    
    window.addEventListener('scroll', function() {
        const now = Date.now();
        
        // Cancela qualquer timeout pendente
        if (scrollTimeout) {
            clearTimeout(scrollTimeout);
        }
        
        // Throttle para funções críticas (executa no máximo a cada 50ms)
        if (now - lastScrollHandled > 50) {
            lastScrollHandled = now;
            
            // Atualizar a cor da barra durante rolagem (efeito camaleão)
            if (window.scrollThrottleTimeout) {
                clearTimeout(window.scrollThrottleTimeout);
            }
            
            window.scrollThrottleTimeout = setTimeout(function() {
                updateThemeColorCamaleao();
            }, 100);
        }

        // Solicita frame para operações não críticas
        if (!ticking) {
            requestAnimationFrame(() => {
                ticking = false;
            });
            ticking = true;
        }
        
        // Ultra-curto timeout para elementos secundários (mobile)
        if (isMobile()) {
            scrollTimeout = setTimeout(function() {
                findCenteredElements('.benefit-card');
                findCenteredElements('.step-card');
                findCenteredElements('.audience-card');
                findCenteredElements('.menu-item');
                findCenteredElements('.wintrax-advantage-item');
                findCenteredElements('.advantage-item');
                findCenteredElements('.feature-card');
                findCenteredElements('.feedback-item');
                findCenteredElements('.system-gallery-item');
                findCenteredElements('.faq-item');
                findCenteredElements('.comparison-table tr');
                findCenteredElements('.stat-item');
            }, 5); // Reduzido para 5ms para responsividade extrema
        }
    }, { passive: true }); // Passive para melhor performance

    // Inicializar elementos ativos ao carregar a página (apenas em mobile)
    window.addEventListener('load', function() {
        // Inicializar a detecção da cor predominante
        updateThemeColorCamaleao();
        
        // Configurar eventos para atualização de cores em tempo real
        window.addEventListener('scroll', function() {
            // Usando debounce para melhorar performance
            if (window.scrollThrottleTimeout) {
                clearTimeout(window.scrollThrottleTimeout);
            }
            
            window.scrollThrottleTimeout = setTimeout(function() {
                updateThemeColorCamaleao();
            }, 100); // Atualiza a cada 100ms durante rolagem para efeito camaleão
        }, { passive: true });
        
        // Configurar observador de mutação para detectar mudanças de cor
        const observer = new MutationObserver(function(mutations) {
            updateThemeColorCamaleao();
        });
        
        // Observar mudanças no body e outros elementos principais
        observer.observe(document.body, { 
            attributes: true,
            childList: true,
            subtree: true,
            attributeFilter: ['style', 'class']
        });
        
        if (isMobile()) {
            // Inicializa elementos visíveis imediatamente
            requestAnimationFrame(() => {
                findCenteredElements('.benefit-card');
                findCenteredElements('.step-card');
                findCenteredElements('.audience-card');
                findCenteredElements('.menu-item');
                findCenteredElements('.wintrax-advantage-item');
                findCenteredElements('.advantage-item');
                findCenteredElements('.feature-card');
                findCenteredElements('.feedback-item');
                findCenteredElements('.system-gallery-item');
                findCenteredElements('.faq-item');
                findCenteredElements('.comparison-table tr');
                findCenteredElements('.stat-item');
            });
        }
        
        // Executar ajuste de imagens após pequeno atraso para garantir que o DOM esteja pronto
        setTimeout(adjustImages, 500);
        
        // Detector de transições para atualizar as cores
        const detectTransitions = function() {
            const containers = document.querySelectorAll('.section-bg-dark, .section-bg-light, .hero-section');
            containers.forEach(container => {
                container.addEventListener('transitionend', function(e) {
                    if (e.propertyName === 'opacity' || e.propertyName === 'transform') {
                        updateThemeColorCamaleao();
                    }
                });
            });
        };
        
        detectTransitions();
        
        // Atualização periódica para garantir que a cor está correta
        setInterval(updateThemeColorCamaleao, 2000);
    });

    // Redefinir elementos ao redimensionar a janela
    let resizeTimer;
    window.addEventListener('resize', function() {
        // Cancela qualquer temporizador existente
        if (resizeTimer) clearTimeout(resizeTimer);
        
        // Define uma classe temporária durante o redimensionamento
        document.body.classList.add('resize-animation-stopper');
        
        // Agenda a execução após o redimensionamento
        resizeTimer = setTimeout(() => {
            document.body.classList.remove('resize-animation-stopper');
            
            // Atualizar a cor da barra após redimensionar
            updateThemeColorCamaleao();
            
            // Se mudar de desktop para mobile, inicializa os elementos centrais
            if (isMobile()) {
                requestAnimationFrame(() => {
                    findCenteredElements('.benefit-card');
                    findCenteredElements('.step-card');
                    findCenteredElements('.audience-card');
                    findCenteredElements('.menu-item');
                    findCenteredElements('.wintrax-advantage-item');
                    findCenteredElements('.advantage-item');
                    findCenteredElements('.feature-card');
                    findCenteredElements('.feedback-item');
                    findCenteredElements('.system-gallery-item');
                    findCenteredElements('.faq-item');
                    findCenteredElements('.comparison-table tr');
                    findCenteredElements('.stat-item');
                });
            } else {
                // Se mudar de mobile para desktop, remove todas as classes active
                document.querySelectorAll('.benefit-card, .step-card, .audience-card, .menu-item, .wintrax-advantage-item, .advantage-item, .feature-card, .feedback-item, .system-gallery-item, .faq-item, .comparison-table tr, .stat-item').forEach(element => {
                    // Remove a classe de visualização centralizada
                    element.classList.remove('centered-active');
                    element.style.willChange = 'auto';
                });
            }
        }, 150);
    }, { passive: true });
});