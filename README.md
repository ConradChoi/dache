# 다채 (Dache) - 결혼정보서비스 웹사이트

## 프로젝트 소개

다채는 새로운 세대를 위한 새로운 매칭 서비스입니다. 자신을 이해하고, 검증된 사람을 만나고 싶은 "자문추" 세대를 위한 공간으로, 조건을 검증하면서도 그 너머의 가치관과 삶의 결로 연결하는 서비스를 제공합니다.

## 주요 기능

### 🎯 핵심 서비스
- **깊이 있는 상담**: 성향, 성격, 관계 기대치, 이상형까지 이해하고 조건을 검증
- **가치관과 라이프스타일**: 가족, 건강, 돈, 일, 삶을 대하는 태도를 보고 회원이 직접 선택
- **통합 관리 시스템**: 첫 상담자가 끝까지 매칭·피드백까지 책임

### 💰 수익 구조
- 가입비가 아닌 **성혼사례비** 중심
- 가입 권유나 만남 횟수 차감이 아니라, **성공 성혼**에 집중
- 시간 낭비를 최소화하고, 의미 있는 만남에 집중

### 📋 문의 시스템
- Google Apps Script를 통한 자동 데이터 수집
- Google 스프레드시트 연동으로 문의 데이터 관리
- 반응형 웹 디자인으로 모든 디바이스 지원

## 기술 스택

### Frontend
- **HTML5**: 시맨틱 마크업
- **CSS3**: Flexbox, Grid, CSS 변수, 애니메이션, 반응형 디자인
- **JavaScript (ES6+)**: DOM 조작, 이벤트 처리, Google Apps Script 연동

### Backend & Integration
- **Google Apps Script**: 서버리스 함수로 문의 데이터 처리
- **Google Sheets**: 데이터 저장 및 관리
- **JSONP**: CORS 제한 우회를 위한 데이터 전송

### Design & UX
- **반응형 디자인**: 모바일, 태블릿, 데스크톱 최적화
- **모던 UI/UX**: 사용자 친화적인 인터페이스
- **접근성**: WCAG 2.1 AA 표준 준수

## 파일 구조

```
dache/
├── public/                 # 배포 대상 (이 폴더만 dache.kr에 공개됨)
│   ├── index.html          # 메인 페이지
│   ├── contact.html        # 문의 & 티타임 페이지
│   ├── faq.html            # FAQ 페이지
│   ├── ceo-message.html    # 대표 인사말 페이지
│   ├── terms.html          # 이용약관 페이지
│   ├── privacy.html        # 개인정보처리방침 페이지
│   ├── refund.html         # 환불정책 페이지
│   ├── styles.css          # 메인 스타일시트
│   ├── script.js           # 메인 JavaScript 파일
│   ├── robots.txt / sitemap.xml
│   └── data/               # 이미지
├── test-contact.html       # 문의 폼 테스트 페이지 (배포 제외)
├── simple-test.html        # Google Apps Script 연결 테스트 페이지 (배포 제외)
├── google-apps-script.js   # Google Apps Script 코드 (배포 제외)
├── .gitignore              # Git 제외 파일 목록
└── README.md               # 프로젝트 설명서
```

## 설치 및 실행

### 1. 저장소 클론
```bash
git clone https://github.com/ConradChoi/dache.git
cd dache
```

### 2. 로컬 서버 실행
```bash
# Python 3
python3 -m http.server 8000 --directory public

# 또는 Node.js
npx http-server public -p 8000
```

### 3. 브라우저에서 접속
```
http://localhost:8000
```

## Google Apps Script 설정

### 1. 스크립트 배포
1. `google-apps-script.js` 내용을 Google Apps Script 편집기에 복사
2. "배포" > "새 배포" > "웹 앱" 선택
3. "액세스 권한" > "모든 사용자" 선택
4. 배포 후 제공되는 URL 복사

### 2. 스프레드시트 설정
1. Google 스프레드시트 생성
2. 스프레드시트 ID를 `google-apps-script.js`에 설정
3. 스프레드시트 공유 설정: "링크가 있는 모든 사용자" > "편집자"

### 3. URL 업데이트
배포된 Google Apps Script URL을 다음 파일들에 업데이트:
- `script.js`
- `test-contact.html`
- `simple-test.html`

## 주요 페이지

### 📱 메인 페이지 (index.html)
- 서비스 소개 및 차별점
- 문의 폼 (Google Apps Script 연동)
- 반응형 디자인

### 📋 정책 페이지들
- **terms.html**: 이용약관 (버전 선택 기능)
- **privacy.html**: 개인정보처리방침 (버전 선택 기능)
- **refund.html**: 환불정책 (버전 선택 기능)

### 🧪 테스트 페이지들
- **test-contact.html**: 문의 폼 테스트
- **simple-test.html**: Google Apps Script 연결 테스트

## 개발 가이드

### CSS 구조
- CSS 변수를 활용한 일관된 디자인 시스템
- 모바일 우선 반응형 디자인
- Flexbox와 Grid를 활용한 레이아웃

### JavaScript 구조
- 모듈화된 이벤트 처리
- Google Apps Script 연동을 위한 JSONP 구현
- 에러 처리 및 사용자 피드백

## 배포

### GitHub Pages
1. 저장소 설정 > Pages
2. Source를 "Deploy from a branch" 선택
3. Branch를 "main" 선택
4. Save 클릭

### 기타 호스팅 서비스
- Netlify
- Vercel
- AWS S3 + CloudFront

## 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 연락처

- **프로젝트 링크**: [https://github.com/ConradChoi/dache](https://github.com/ConradChoi/dache)
- **웹사이트**: [https://conradchoi.github.io/dache](https://conradchoi.github.io/dache)

---

**다채** - 의미 있는 만남만을 만들어갑니다 🌟
