# Elev8 Signal — Claude Context

## 프로젝트 개요
Invite-only 리더십 커뮤니티를 위한 주간 피어 서베이 플랫폼.
- **태그라인**: "One question. Top leaders."
- **핵심 흐름**: 매주 Signal(질문) 발행 → 멤버 투표 → AI 인사이트 생성 → 결과 이메일 발송
- **두 번째 기능**: 멤버 간 큐레이티드 1:1 Exchange (실시간 채팅)

## 로컬 개발
```bash
cd /Users/akak/Elev8-Signal
npm run dev          # 또는 터미널에서 `elev8`
# → http://localhost:3000
```

## 레포지토리
- GitHub: https://github.com/akisinkr/Elev8_Signal.git
- 로컬 경로: `/Users/akak/Elev8-Signal`

## Tech Stack
| 영역 | 기술 |
|------|------|
| Framework | Next.js 16.1.6 (App Router, Turbopack) |
| Language | TypeScript 5, React 19 |
| Auth | Clerk (@clerk/nextjs) |
| DB | PostgreSQL (Supabase) + Prisma ORM 7 |
| AI | Anthropic SDK — Claude API |
| Storage | AWS S3 |
| Real-time | Pusher (server + client) |
| Email | SendGrid |
| Styling | Tailwind CSS 4, shadcn/ui, Radix UI |
| Validation | Zod |

## 라우트 구조
```
/                          → 랜딩 (공개)
/signal                    → 현재 Signal 투표 (공개)
/signal/[number]           → Signal 상세/결과 (공개)
/preview                   → 프리뷰 (공개)
/request-access            → 가입 신청 (공개)
/welcome                   → 환영 페이지 (공개)
/sign-in, /sign-up         → Clerk 인증

/dashboard                 → 멤버 홈 (Clerk 인증)
/matches                   → 내 매칭 목록 (Clerk 인증)
/exchange/[matchId]        → 1:1 실시간 채팅 (Clerk 인증)
/profile                   → 프로필 편집 (Clerk 인증)
/feedback                  → 피드백 (Clerk 인증)
/onboarding                → 온보딩 (Clerk 인증)

/admin                     → 어드민 패널 (자체 쿠키 인증)
/admin/signal              → Signal 관리
/admin/members             → 멤버 관리
/admin/matches             → 매칭 관리
/admin/access-requests     → 가입 신청 관리
/admin/insights            → AI 인사이트
```

## 소스 구조
```
src/
├── app/
│   ├── (app)/             # 멤버 전용 페이지
│   ├── (admin)/           # 어드민 패널
│   ├── (auth)/            # Clerk sign-in/up
│   ├── (onboarding)/      # 온보딩 플로우
│   ├── api/               # API 라우트
│   └── page.tsx           # 랜딩페이지
├── components/
│   ├── signal/            # Signal 관련 컴포넌트
│   ├── admin/             # 어드민 컴포넌트
│   ├── shared/            # 공통 컴포넌트
│   └── ui/                # shadcn/ui 컴포넌트
├── lib/
│   ├── auth.ts            # requireMember(), requireAdmin()
│   ├── db.ts              # Prisma client
│   ├── anthropic.ts       # Claude API
│   ├── pusher.ts          # Pusher 설정
│   ├── s3.ts              # AWS S3
│   ├── sendgrid.ts        # 이메일 발송
│   └── signal.ts          # Signal 핵심 로직
├── hooks/
│   ├── use-pusher.ts      # 실시간 채팅
│   ├── use-exchange.ts    # Exchange 로직
│   └── use-voice-recorder.ts
└── middleware.ts          # Clerk 미들웨어 (공개/보호 라우트 분리)
```

## DB 모델 (Prisma)
- **Member** — Clerk 연동, role(MEMBER/ADMIN), 온보딩 상태, 프로필
- **Match** — 두 멤버 간 매칭, status(PROPOSED→ACTIVE→COMPLETED)
- **Message** — Match 내 메시지, TEXT 또는 VOICE_NOTE
- **Feedback** — Match 완료 후 평가
- **SignalQuestion** — 주간 질문, 5지선다, KR/EN 번역 포함
- **SignalVote** — 멤버의 투표 + why(이유)
- **SignalSuggestion** — 멤버 질문 제안, AI로 다듬은 후 Admin 승인
- **AccessRequest** — 가입 신청

## API 라우트
```
/api/signal/current                         → 현재 라이브 Signal
/api/signal/[n]/vote                        → 투표 제출
/api/signal/[n]/results                     → 투표 결과
/api/admin/signal/[n]/generate-insight      → AI 인사이트 생성 (Claude)
/api/admin/signal/[n]/send-results          → 결과 이메일 발송
/api/matches/[id]/messages                  → 메시지 CRUD (Pusher 연동)
/api/admin/members                          → 멤버 관리
/api/admin/matches                          → 매칭 생성/관리
/api/webhooks/clerk                         → Clerk 웹훅
/api/upload                                 → S3 파일 업로드
```

## 인증 구조
- **멤버**: Clerk → `requireMember()` → DB Member 조회/생성
- **어드민**: 자체 세션 쿠키 (`/admin/login`) — Clerk와 별개
- **공개 라우트**: `/signal/*`, `/preview`, `/request-access`, `/welcome`

## 환경 변수 (.env 필요 항목)
```
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Database (Supabase)
DATABASE_URL=

# Anthropic
ANTHROPIC_API_KEY=

# SendGrid
SENDGRID_API_KEY=
SENDGRID_FROM_EMAIL=

# AWS S3
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
AWS_S3_BUCKET=

# Pusher
PUSHER_APP_ID=
PUSHER_KEY=
NEXT_PUBLIC_PUSHER_KEY=
PUSHER_SECRET=
PUSHER_CLUSTER=
NEXT_PUBLIC_PUSHER_CLUSTER=

# Admin
ADMIN_SESSION_SECRET=
```

## 현재 알려진 이슈
- `/dashboard`, `/matches` 등 인증 필요 라우트 → 404 반환 중
  - 원인: `.env`에 Clerk 키 미설정
  - 해결: Clerk 대시보드에서 키를 발급해 `.env`에 추가

## Signal 비즈니스 로직 흐름
1. Admin이 SignalQuestion 생성 (DRAFT)
2. Admin이 LIVE 전환 → 멤버에게 투표 이메일 발송
3. 멤버 투표 (5지선다 + why 작성)
4. Deadline 후 Admin이 Claude로 AI 인사이트 생성
5. Admin이 PUBLISHED 전환 → 결과 이메일 발송
6. `/signal/[number]`에서 결과 공개 확인 가능
