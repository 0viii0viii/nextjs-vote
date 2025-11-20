# FSD(Feature-Sliced Design) 패턴 개요

FSD는 프론트엔드 아키텍처 설계 방법론으로, 확장 가능하고 유지보수하기 쉬운 코드 구조를 제공합니다.

## 핵심 원칙

### 1. 계층화된 구조 (Layered Architecture)

FSD는 7개의 계층으로 구성되며, 각 계층은 상위 계층에만 의존합니다:

```
app (애플리케이션 초기화)
  ↓
pages (페이지 라우팅)
  ↓
widgets (복합 UI 블록)
  ↓
features (비즈니스 기능)
  ↓
entities (비즈니스 엔티티)
  ↓
shared (공유 리소스)
```

### 2. 각 계층의 역할

#### **app/** - 애플리케이션 초기화

- 프로바이더 설정 (ClerkProvider, ThemeProvider 등)
- 전역 설정 및 초기화
- Next.js의 `app/layout.tsx` 같은 루트 레이아웃

```typescript
// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html>{children}</html>
    </ClerkProvider>
  );
}
```

#### **pages/** - 페이지 라우팅 (선택적)

- Next.js App Router 사용 시 `app/` 폴더가 이 역할을 대체
- 각 페이지는 위젯과 기능을 조합

#### **widgets/** - 독립적인 UI 블록

- 여러 기능을 조합한 복합 컴포넌트
- 재사용 가능한 큰 단위의 UI 블록
- 예: Navbar, Feed, Sidebar

```typescript
// widgets/navbar/navbar.tsx
export function Navbar() {
  // 여러 기능(인증, 네비게이션)을 조합
  return <nav>...</nav>;
}
```

#### **features/** - 비즈니스 기능

- 사용자 액션과 관련된 기능
- 예: 글 작성, 좋아요, 댓글 작성
- 구조: `features/{feature-name}/ui/`, `features/{feature-name}/model/`, `features/{feature-name}/api/`

```typescript
// features/write-post/ui/write-post.tsx
export function WritePost() {
  // 글 작성 기능
}
```

#### **entities/** - 비즈니스 엔티티

- 도메인 모델과 관련된 컴포넌트
- 예: Post, User, Comment
- 구조: `entities/{entity-name}/ui/`, `entities/{entity-name}/model/`

```typescript
// entities/post/ui/post-card.tsx
export function PostCard({ post }) {
  // 게시글 카드 컴포넌트
}
```

#### **shared/** - 공유 리소스

- 프로젝트 전역에서 사용하는 공통 리소스
- UI 킷, 유틸리티, 훅, 타입 등
- 예: `shared/ui/`, `shared/lib/`, `shared/hooks/`

```typescript
// shared/ui/button.tsx
export function Button() { ... }

// shared/lib/utils.ts
export function cn() { ... }
```

### 3. 세그먼트 구조

각 슬라이스(모듈)는 다음과 같은 세그먼트로 구성됩니다:

```
{layer}/{slice-name}/
  ├── ui/          # UI 컴포넌트
  ├── model/       # 비즈니스 로직, 상태 관리
  ├── api/         # API 호출
  ├── lib/         # 유틸리티 함수
  └── index.ts     # Public API
```

예시:

```
features/write-post/
  ├── ui/
  │   ├── write-post.tsx
  │   └── index.ts
  ├── model/
  │   └── use-write-post.ts
  └── api/
      └── create-post.ts
```

### 4. Import 규칙

- **상위 계층만 하위 계층을 import**
- 같은 계층 간 import 가능
- 하위 계층은 상위 계층을 import 불가

```typescript
// ✅ 올바른 import
// widgets/navbar에서
import { Button } from "@/shared/ui/button"; // 하위 계층
import { SignInButton } from "@/features/auth"; // 같은 계층

// ❌ 잘못된 import
// shared/ui/button에서
import { Navbar } from "@/widgets/navbar"; // 상위 계층 import 불가
```

## 현재 프로젝트 구조

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx
│   ├── page.tsx
│   └── write/
│       └── page.tsx
├── widgets/                # 복합 UI 블록
│   ├── navbar/
│   │   ├── navbar.tsx
│   │   └── index.ts
│   └── feed/
│       ├── feed.tsx
│       └── index.ts
├── features/               # 비즈니스 기능
│   └── write-post/
│       └── ui/
│           ├── write-post.tsx
│           └── index.ts
└── shared/                 # 공유 리소스
    ├── ui/                 # UI 컴포넌트 킷
    ├── hooks/              # 공유 훅
    └── lib/                # 유틸리티
```

## FSD 패턴의 장점

1. **확장성**: 새 기능 추가가 쉬움
2. **유지보수성**: 계층별 책임 분리
3. **재사용성**: 공유 리소스 활용 용이
4. **테스트 용이성**: 계층별 독립 테스트 가능
5. **팀 협업**: 명확한 구조로 충돌 감소

## 다음 단계 제안

프로젝트가 성장하면 다음 구조를 추가할 수 있습니다:

```
entities/
  └── post/
      ├── ui/
      │   └── post-card.tsx
      └── model/
          └── types.ts

features/
  ├── write-post/
  ├── like-post/
  └── comment-post/
```

이 구조로 코드베이스를 체계적으로 관리할 수 있습니다.

## 참고 자료

- [Feature-Sliced Design 공식 문서](https://feature-sliced.design/)
- [FSD Best Practices](https://feature-sliced.design/docs/get-started/overview)
