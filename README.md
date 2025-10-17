# Pages Template

Cloudflare Pages 배포를 위한 embeddable 위젯 템플릿입니다.

고객 웹사이트에 임베드 가능한 쇼핑 위젯을 제공하며, Vanilla JavaScript와 esbuild를 사용하여 가볍고 빠른 성능을 제공합니다.

## 🚀 빠른 시작

### 1. 템플릿 Clone

```bash
git clone https://github.com/hopegiver/pages-template.git my-widget-project
cd my-widget-project
npm install
```

### 2. 개발 시작

```bash
# Live Server로 index.html 실행
# 빌드 없이 바로 개발 가능 (ES6 모듈)
```

### 3. 프로덕션 빌드

```bash
npm run build
```

## 🤖 AI 에이전트 사용 시 필독

> **⚠️ IMPORTANT**
>
> AI 에이전트(Claude, ChatGPT, Cursor 등)를 사용하는 경우, 작업 시작 전에 다음과 같이 지시하세요:
>
> ```
> 먼저 CONTRIBUTING.md 파일을 읽고 프로젝트 구조와 규칙을 이해한 후 작업해줘.
> ```
>
> **[CONTRIBUTING.md](./CONTRIBUTING.md)** 파일에는 다음이 포함되어 있습니다:
> - 프로젝트 구조 및 네이밍 규칙
> - 라우팅 및 상태 관리 방법
> - 새로운 페이지/기능 추가 방법
> - 코딩 스타일 가이드
> - 금지사항 및 베스트 프랙티스
>
> 이 단계를 건너뛰면 프로젝트 규칙에 맞지 않는 코드가 생성될 수 있습니다.

## 📚 문서

- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - 전체 개발 가이드 (필수)
- **[.claude/context.md](./.claude/context.md)** - 프로젝트 컨텍스트 요약

## 🏗️ 프로젝트 구조

```
src/
├── core/        # 핵심 로직 (State, Router, Widget, API)
├── pages/       # 라우트별 페이지 (파일명 = 라우트명)
├── components/  # 재사용 가능한 컴포넌트
├── utils/       # 헬퍼 함수
└── styles/      # CSS-in-JS
```

## 🛠️ 기술 스택

- Vanilla JavaScript (ES6 Modules)
- esbuild
- CSS-in-JS
- Mock API (Static JSON)
- Cloudflare Pages

## 📄 라이센스

MIT License
