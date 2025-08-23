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
    const scrollElements = document.querySelectorAll('.service-card, .about-content, .contact-content, .stats');
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

    // 폼 제출 처리
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // 폼 데이터 수집
            const formData = new FormData(this);
            const name = formData.get('name');
            
            // 날짜 데이터 수집 (년/월/일)
            const birthyear = formData.get('birthyear');
            const birthmonth = formData.get('birthmonth');
            const birthday = formData.get('birthday');
            
            // 날짜 형식 변환 (YYYY-MM-DD)
            const birthdate = birthyear && birthmonth && birthday ? 
                `${birthyear}-${birthmonth.padStart(2, '0')}-${birthday.padStart(2, '0')}` : '';
            
            const phone = formData.get('phone');
            const email = formData.get('email');
            const gender = formData.get('gender');
            const education = formData.get('education');
            const region = formData.get('region');
            const occupation = formData.get('occupation');
            const income = formData.get('income');
            const meeting1 = formData.get('meeting1');
            const meeting2 = formData.get('meeting2');
            
            // 간단한 유효성 검사
            if (!name || !birthdate || !phone || !email || !gender || !education || !region || !occupation || !income || !meeting1) {
                showNotification('필수 항목을 모두 입력해주세요.', 'error');
                return;
            }
            
            if (!isValidEmail(email)) {
                showNotification('올바른 이메일 주소를 입력해주세요.', 'error');
                return;
            }
            
            // Google Apps Script로 데이터 전송
            const inquiryData = {
                name,
                birthdate,
                phone,
                email,
                gender,
                education,
                region,
                occupation,
                income,
                meeting1,
                meeting2: meeting2 || null,
                timestamp: new Date().toISOString(),
                ip_address: 'N/A', // 클라이언트에서는 IP 주소를 알 수 없음
                user_agent: navigator.userAgent
            };
            
            // 로딩 상태 표시
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = '전송 중...';
            submitBtn.disabled = true;
            
            // Google Apps Script URL (새로운 배포 URL로 업데이트 완료)
            const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw-Vzv4xOv02ICysaVpuFNIuhr9l2kRs0Ce7vN2nBy_h2EKXEUss83b1di98hy2GMWN/exec';
            
            // JSONP 방식으로 데이터 전송
            const script = document.createElement('script');
            const callbackName = 'callback_' + Date.now();
            
            console.log('JSONP 요청 시작:', callbackName);
            console.log('전송할 데이터:', inquiryData);
            
            // 전역 콜백 함수 생성
            window[callbackName] = function(response) {
                console.log('Google Apps Script 응답 받음:', response);
                
                if (response && response.success) {
                    console.log('성공: 데이터가 스프레드시트에 저장됨');
                    showNotification('가입 문의가 성공적으로 등록되었습니다. 빠른 시일 내에 연락드리겠습니다.', 'success');
                    this.reset();
                } else {
                    console.error('실패: 응답 데이터 문제', response);
                    showNotification('문의 등록 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.', 'error');
                }
                
                // 정리
                delete window[callbackName];
                document.head.removeChild(script);
                
                // 버튼 상태 복원
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }.bind(this);
            
            // URL에 데이터와 콜백 함수명 추가
            const url = new URL(GOOGLE_APPS_SCRIPT_URL);
            url.searchParams.append('callback', callbackName);
            url.searchParams.append('data', JSON.stringify(inquiryData));
            
            // 스크립트 태그로 요청
            script.src = url.toString();
            script.onerror = () => {
                showNotification('문의 등록 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.', 'error');
                delete window[callbackName];
                document.head.removeChild(script);
                
                // 버튼 상태 복원
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            };
            
            document.head.appendChild(script);
        });
    }

    // 이메일 유효성 검사
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // 알림 메시지 표시
    function showNotification(message, type = 'info') {
        // 기존 알림 제거
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // 새 알림 생성
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;
        
        // 스타일 적용
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#2196f3'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            max-width: 400px;
            animation: slideInRight 0.3s ease;
        `;
        
        // 닫기 버튼 이벤트
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            notification.remove();
        });
        
        // 자동 제거 (5초 후)
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
        
        document.body.appendChild(notification);
    }

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
