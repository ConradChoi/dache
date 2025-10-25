// DOM이 로드된 후 실행
document.addEventListener('DOMContentLoaded', function() {
    // 모바일 메뉴 토글
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const nav = document.querySelector('.nav');
    const navOverlay = document.querySelector('.nav-overlay');
    
    if (mobileMenuToggle && (navMenu || nav)) {
        mobileMenuToggle.addEventListener('click', function() {
            const targetNav = navMenu || nav;
            targetNav.classList.toggle('active');
            
            // 오버레이 토글
            if (navOverlay) {
                navOverlay.classList.toggle('active');
            }
            
            // 햄버거 메뉴 애니메이션
            const spans = this.querySelectorAll('span');
            if (targetNav.classList.contains('active')) {
                spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
            } else {
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        });
    }
    
    // 오버레이 클릭 시 메뉴 닫기
    if (navOverlay) {
        navOverlay.addEventListener('click', function() {
            const targetNav = navMenu || nav;
            if (targetNav) {
                targetNav.classList.remove('active');
                this.classList.remove('active');
                
                // 햄버거 메뉴 애니메이션 복원
                const spans = mobileMenuToggle.querySelectorAll('span');
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        });
    }

    // 네비게이션 링크 클릭 시 모바일 메뉴 닫기
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            const targetNav = navMenu || nav;
            if (targetNav && targetNav.classList.contains('active')) {
                targetNav.classList.remove('active');
                const spans = mobileMenuToggle.querySelectorAll('span');
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        });
    });

    // Close icon 클릭 시 모바일 메뉴 닫기
    function closeMobileMenu() {
        const targetNav = navMenu || nav;
        if (targetNav && targetNav.classList.contains('active')) {
            targetNav.classList.remove('active');
            
            // 오버레이 제거
            if (navOverlay) {
                navOverlay.classList.remove('active');
            }
            
            // 햄버거 메뉴 애니메이션 복원
            const spans = mobileMenuToggle.querySelectorAll('span');
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    }

    // Close icon 클릭 이벤트 (이벤트 위임 사용)
    document.addEventListener('click', function(e) {
        if (e.target.closest('.nav-menu') && e.target.matches('.close-icon, .close-icon *')) {
            closeMobileMenu();
        }
    });

    // Close icon 영역 클릭 이벤트 (더 정확한 방법)
    if (navMenu || nav) {
        const targetNav = navMenu || nav;
        targetNav.addEventListener('click', function(e) {
            // Close icon 영역 클릭 확인 (우상단 영역)
            const rect = this.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const clickY = e.clientY - rect.top;
            
            // 우상단 60x60px 영역 (close icon 위치)
            if (clickX > rect.width - 60 && clickY < 60) {
                closeMobileMenu();
            }
        });
    }

    // 스크롤 시 헤더 스타일 변경
    const header = document.querySelector('.header');
    let lastScrollTop = 0;
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > 100) {
            header.style.background = 'rgba(255, 255, 255, 0.95)';
            header.style.backdropFilter = 'blur(10px)';
        } else {
            header.style.background = 'var(--background-color)';
            header.style.backdropFilter = 'none';
        }
        
        lastScrollTop = scrollTop;
    });

    // 스크롤 애니메이션
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
            }
        });
    }, observerOptions);

    // 스크롤 애니메이션을 적용할 요소들
    const scrollElements = document.querySelectorAll('.service-card, .about-content, .stats');
    scrollElements.forEach(el => {
        el.classList.add('scroll-reveal');
        observer.observe(el);
    });

    // 부드러운 스크롤 (같은 페이지 내 앵커 링크만)
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            
            // 같은 페이지 내 앵커 링크인 경우에만 preventDefault
            if (targetId.startsWith('#')) {
                e.preventDefault();
                
                const targetSection = document.querySelector(targetId);
                
                if (targetSection) {
                    const headerHeight = header.offsetHeight;
                    const targetPosition = targetSection.offsetTop - headerHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            }
            // 외부 페이지 링크는 기본 동작 유지
        });
    });


    // 통계 숫자 애니메이션
    const statNumbers = document.querySelectorAll('.stat-number');
    const animateStats = () => {
        statNumbers.forEach(stat => {
            const target = parseInt(stat.textContent.replace(/\D/g, ''));
            const increment = target / 50;
            let current = 0;
            
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    current = target;
                    clearInterval(timer);
                }
                
                if (stat.textContent.includes('+')) {
                    stat.textContent = Math.floor(current) + '+';
                } else if (stat.textContent.includes('%')) {
                    stat.textContent = Math.floor(current) + '%';
                } else if (stat.textContent.includes('년')) {
                    stat.textContent = Math.floor(current) + '년+';
                }
            }, 30);
        });
    };

    // 통계 섹션이 화면에 보일 때 애니메이션 시작
    const statsSection = document.querySelector('.stats');
    if (statsSection) {
        const statsObserver = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateStats();
                    statsObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        statsObserver.observe(statsSection);
    }

    // 스크롤 진행률 표시
    const createScrollProgress = () => {
        const progressBar = document.createElement('div');
        progressBar.className = 'scroll-progress';
        progressBar.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 0%;
            height: 3px;
            background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
            z-index: 10001;
            transition: width 0.1s ease;
        `;
        
        document.body.appendChild(progressBar);
        
        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = (scrollTop / docHeight) * 100;
            progressBar.style.width = scrollPercent + '%';
        });
    };
    
    createScrollProgress();
    
    // 모달 관리 시스템 - 모든 모달이 페이지로 이동되어 제거됨
    // const modals = {};
    
    // 모든 모달이 페이지로 이동되어 모달 초기화 코드 제거됨
    
    // 모든 모달이 페이지로 이동되어 모달 관련 함수들 제거됨
    
    // "기타" 선택 시 입력창 표시/숨김 기능
    const educationSelect = document.getElementById('education');
    const educationOtherInput = document.getElementById('education-other');
    const regionSelect = document.getElementById('region');
    const regionOtherInput = document.getElementById('region-other');
    
    if (educationSelect && educationOtherInput) {
        educationSelect.addEventListener('change', function() {
            if (this.value === 'other') {
                educationOtherInput.style.display = 'block';
                educationOtherInput.required = true;
            } else {
                educationOtherInput.style.display = 'none';
                educationOtherInput.required = false;
                educationOtherInput.value = '';
            }
        });
    }
    
    if (regionSelect && regionOtherInput) {
        regionSelect.addEventListener('change', function() {
            if (this.value === 'other') {
                regionOtherInput.style.display = 'block';
                regionOtherInput.required = true;
            } else {
                regionOtherInput.style.display = 'none';
                regionOtherInput.required = false;
                regionOtherInput.value = '';
            }
        });
    }
    
    // 모든 모달 상태 확인 (개발용)
    window.checkModalStatus = function() {
        Object.keys(modals).forEach(key => {
            const modalData = modals[key];
            const { modal, name } = modalData;
            if (modal) {
                console.log(`${name} 모달 상태:`, modal.style.display);
                console.log(`${name} 모달 요소:`, modal);
            }
        });
    };
    
    // 환불정책 모달 직접 열기 (강제)
    window.forceOpenRefundModal = function() {
        const refundModal = document.getElementById('refundModal');
        if (refundModal) {
            console.log('강제로 환불정책 모달 열기');
            refundModal.style.display = 'block';
            document.body.style.overflow = 'hidden';
            console.log('환불정책 모달 display:', refundModal.style.display);
        } else {
            console.error('환불정책 모달을 찾을 수 없습니다');
        }
    };
    
    // 환불정책 링크 직접 테스트
    window.testRefundLink = function() {
        const refundLink = document.querySelector('.refund-link');
        if (refundLink) {
            console.log('환불정책 링크 찾음:', refundLink);
            console.log('환불정책 링크 클릭 이벤트 리스너 수:', refundLink.onclick ? '1' : '0');
        } else {
            console.error('환불정책 링크를 찾을 수 없습니다');
        }
    };
});

// CSS 애니메이션 추가
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .notification-close {
        background: none;
        border: none;
        color: white;
        font-size: 1.5rem;
        cursor: pointer;
        margin-left: 1rem;
        padding: 0;
        line-height: 1;
    }
    
    .notification-close:hover {
        opacity: 0.8;
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
`;
document.head.appendChild(style);
