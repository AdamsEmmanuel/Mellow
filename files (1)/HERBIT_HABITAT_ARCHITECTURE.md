# 🌿 Herbit Habitat — Frontend Architecture & MVP Blueprint

> **Rooted in nature, guided by science.**  
> A HIPAA-conscious marketplace connecting patients with verified natural healthcare practitioners.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Feature Module List](#3-feature-module-list)
4. [Role-Based Routing Strategy](#4-role-based-routing-strategy)
5. [Auth Flow](#5-auth-flow)
6. [Real-Time Layer — Socket.io + TanStack Query](#6-real-time-layer)
7. [Video Consultation Integration](#7-video-consultation-integration)
8. [Sensitive Data Handling — HIPAA Guardrails](#8-sensitive-data-handling)
9. [Folder Structure](#9-folder-structure)
10. [Key Architecture Decisions & Tradeoffs](#10-architecture-decisions--tradeoffs)
11. [Environment Variables](#11-environment-variables)
12. [Deployment Strategy](#12-deployment-strategy)
13. [MVP Scope Boundaries](#13-mvp-scope-boundaries)

---

## 1. Project Overview

Herbit Habitat is a **full-stack telemedicine + wellness marketplace** built for the African natural health ecosystem (initially Nigeria-focused). It enables:

- **Patients** to discover verified holistic practitioners, book consultations, track health metrics, and communicate securely.
- **Practitioners** to manage their practice: schedule, patient notes, services, and earnings.
- **Admins** to verify practitioners, monitor platform health, and manage users.

The MVP is deliberately scoped to be **deployable, real, and valuable** — not feature-complete but production-worthy.

---

## 2. Tech Stack

| Layer | Choice | Rationale |
|---|---|---|
| **Framework** | React 18 + Vite | Fast HMR, small bundles, great DX |
| **Routing** | React Router v6 | Industry standard, nested routes, lazy loading |
| **State / Server State** | TanStack Query v5 | Caching, refetching, background sync — perfect for REST APIs |
| **Global Client State** | Zustand | Lightweight, no boilerplate (replaces Redux for auth/UI state) |
| **Styling** | Tailwind CSS + CSS Variables | Utility-first, responsive by default, our custom design tokens |
| **Forms** | React Hook Form + Zod | Performant, type-safe validation |
| **HTTP Client** | Axios + custom interceptors | JWT injection, token refresh, error normalisation |
| **Real-Time** | Socket.io-client | Notifications + messaging |
| **File Uploads** | Axios multipart | Profile photos, credentials, health docs |
| **Date/Time** | date-fns + dayjs | Timezone-aware scheduling |
| **Charts** | Recharts | Health tracking visualizations |
| **Backend** | FastAPI (Python) | REST + WebSocket, JWT auth, HIPAA-conscious |
| **Deployment** | Vercel (frontend) + Docker (backend) | Fast deploys, env-per-branch on Vercel |

---

## 3. Feature Module List

Each module maps to a folder under `src/features/`. All modules follow the same internal structure: `components/`, `hooks/`, `api/`, `types/`, `index.ts`.

### Feature 1 — Patient Onboarding
**Role:** Patient  
**Description:** Multi-step wizard collecting health goals, conditions, allergies, lifestyle preferences. Triggers AI matching after completion. No PHI (Protected Health Information) is ever logged or stored in `localStorage`. Data is sent directly to the encrypted backend.  
**Key components:** `OnboardingWizard`, `HealthGoalsStep`, `ConditionsStep`, `PreferencesStep`, `OnboardingComplete`

---

### Feature 2 — Practitioner Onboarding
**Role:** Practitioner  
**Description:** Verification-gated onboarding: credential uploads (CAC, professional certifications), specialisation selection, bio, availability matrix setup. Practitioner status defaults to `pending_verification` until admin approves.  
**Key components:** `PractitionerOnboardingWizard`, `CredentialUpload`, `AvailabilitySetup`, `VerificationPending`

---

### Feature 3 — AI Matching
**Role:** Patient  
**Description:** Displays match scores returned by the backend AI engine, ranked by relevance to patient's health profile. Patient can filter by specialty, availability, rating, price range. Each card shows a match percentage badge.  
**Key components:** `MatchList`, `MatchCard`, `MatchFilters`, `MatchScoreBadge`

---

### Feature 4 — Practitioner Discovery
**Role:** Patient + Public  
**Description:** Search and browse all active practitioners. Filter by specialty, language, rating, price tier, availability today. Infinite scroll with TanStack Query `useInfiniteQuery`. Includes a quick-preview drawer before full profile.  
**Key components:** `DiscoveryGrid`, `PractitionerCard`, `SearchFilters`, `PreviewDrawer`

---

### Feature 5 — Practitioner Public Profile
**Role:** Public  
**Description:** Full practitioner profile: bio, credentials, specialisations, years of experience, patient reviews, star rating, availability calendar (read-only), and a prominent Book Now CTA. SEO-friendly static-ish route.  
**Key components:** `PublicProfile`, `CredentialBadges`, `ReviewList`, `AvailabilityCalendar`, `BookingCTA`

---

### Feature 6 — Appointment Booking
**Role:** Patient  
**Description:** 5-step booking flow: (1) select service → (2) pick practitioner → (3) choose date → (4) pick time slot → (5) confirm + pay. Timezone-aware. Sends WhatsApp/email confirmation. Handles rescheduling and cancellation.  
**Key components:** `BookingWizard`, `ServicePicker`, `DatePicker`, `TimeSlotGrid`, `BookingConfirmation`

---

### Feature 7 — Patient Dashboard
**Role:** Patient  
**Description:** Overview of upcoming appointments, health summary tiles, recent health log entries, AI match suggestions, and action shortcuts. All data fetched via TanStack Query with loading skeletons.  
**Key components:** `PatientDashboard`, `UpcomingAppointments`, `HealthSummary`, `RecentActivity`, `QuickActions`

---

### Feature 8 — Practitioner Dashboard
**Role:** Practitioner  
**Description:** Today's schedule timeline, patient queue (upcoming within 24h), weekly revenue summary, renewal alerts, pending payment list, and quick-action panel. Real-time appointment updates via Socket.io.  
**Key components:** `PractitionerDashboard`, `TodaySchedule`, `PatientQueue`, `EarningsSummary`, `RenewalAlerts`

---

### Feature 9 — Video Consultation Room *(Skipped for MVP v1)*
> **Note:** Deferred to MVP v2. Architecture placeholder is included in the folder structure.  
> **Planned approach:** Daily.co SDK embedded in a `/room/:sessionId` route, accessible only with a valid session token. WebRTC handles media; Daily.co handles signalling and recording.

---

### Feature 10 — Health Tracking
**Role:** Patient  
**Description:** Patients log daily health metrics (weight, blood pressure, mood, sleep, symptoms). Recharts visualises trends over 7/30/90 days. Goal progress bars derived from onboarding targets.  
**Key components:** `HealthDashboard`, `MetricLogForm`, `TrendChart`, `GoalProgress`, `LogHistory`

---

### Feature 11 — Secure Messaging
**Role:** Patient + Practitioner  
**Description:** HIPAA-aware messaging: conversation list + thread view. File attachments (lab results, documents) are uploaded to a secure backend endpoint, not stored in the browser. Socket.io powers real-time delivery. Messages are end-to-end encrypted at rest on the backend.  
**Key components:** `MessageList`, `ConversationThread`, `MessageBubble`, `AttachmentUpload`, `TypingIndicator`

---

### Feature 12 — Reviews & Ratings
**Role:** Patient  
**Description:** Post-consultation review form (triggered 24h after appointment ends). Star rating 1–5, written review, optional anonymous flag. Reviews display on practitioner's public profile. One review per completed appointment.  
**Key components:** `ReviewForm`, `StarRating`, `ReviewCard`, `ReviewSummary`

---

### Feature 13 — Notifications
**Role:** Patient + Practitioner  
**Description:** Real-time bell icon with unread count (Socket.io event). Notification drawer lists: appointment reminders, new messages, review requests, renewal alerts, verification status updates. Mark all as read. Notification preferences configurable in Settings.  
**Key components:** `NotificationBell`, `NotificationDrawer`, `NotificationItem`, `useNotifications` hook

---

### Feature 14 — Admin Panel
**Role:** Admin  
**Description:** Platform management: paginated user list (patients + practitioners), practitioner verification queue (approve/reject with reason), platform-wide stats (DAU, bookings, revenue), flagged content queue.  
**Key components:** `AdminDashboard`, `UserTable`, `VerificationQueue`, `PlatformStats`, `FlaggedContent`

---

### Feature 15 — Settings & Profile
**Role:** Patient + Practitioner  
**Description:** Account info editing, notification preferences, password change, 2FA setup (future), connected accounts, data export request (GDPR/NDPR), account deletion. Practitioner-specific: availability management, service catalogue, payout settings.  
**Key components:** `SettingsLayout`, `ProfileForm`, `NotificationPrefs`, `SecuritySettings`, `PractitionerSettings`

---

## 4. Role-Based Routing Strategy

```
/                         → Public landing (redirect to dashboard if authed)
/auth/login               → Login page
/auth/register            → Registration (role selection: patient | practitioner)
/auth/verify-email        → Email verification gate
/onboarding/patient       → Patient onboarding wizard (role: patient, unboarded)
/onboarding/practitioner  → Practitioner onboarding wizard (role: practitioner, unboarded)

── Patient routes (role: patient) ─────────────────────────────────────────────
/dashboard                → PatientDashboard
/discover                 → Practitioner Discovery
/match                    → AI Matching results
/book/:practitionerId     → Appointment Booking wizard
/appointments             → Appointment list (upcoming + past)
/health                   → Health Tracking
/messages                 → Secure Messaging
/notifications            → Notification centre
/settings                 → Settings (patient variant)
/profile                  → Own profile view

── Practitioner routes (role: practitioner) ────────────────────────────────────
/dashboard                → PractitionerDashboard  (same /dashboard path, different component)
/schedule                 → Practice Schedule (calendar view)
/patients                 → Patient Management
/services                 → Service Catalogue management
/revenue                  → Revenue & Payments
/messages                 → Secure Messaging
/notifications            → Notification centre
/settings                 → Settings (practitioner variant)
/profile                  → Own profile + public profile preview

── Admin routes (role: admin) ──────────────────────────────────────────────────
/admin                    → Admin Dashboard
/admin/users              → User management
/admin/verification       → Practitioner verification queue
/admin/stats              → Platform statistics
/admin/settings           → Platform settings

── Public routes (no auth) ─────────────────────────────────────────────────────
/practitioners/:slug      → Practitioner Public Profile
/about, /contact, /terms  → Static pages
```

### Route Guard Implementation

```jsx
// src/components/guards/RoleGuard.jsx

// Every protected route is wrapped with <RoleGuard allowedRoles={['patient']} />
// Guards check: (1) is token valid? (2) is role in allowedRoles? (3) is onboarding complete?
// On failure: redirect to /auth/login or /onboarding/:role as appropriate

function RoleGuard({ allowedRoles, children }) {
  const { user, isLoading } = useAuth();  // reads from Zustand — NOT localStorage
  
  if (isLoading) return <FullPageSpinner />;
  if (!user)     return <Navigate to="/auth/login" replace />;
  if (!allowedRoles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  if (!user.onboardingComplete)          return <Navigate to={`/onboarding/${user.role}`} replace />;
  
  return children;
}
```

---

## 5. Auth Flow

```
User visits app
     │
     ▼
Check memory store (Zustand) for auth state
     │
     ├── No token ──────────────────────────► /auth/login
     │                                               │
     │                                     POST /auth/login
     │                                     ← { accessToken, refreshToken, user }
     │                                               │
     │                                     accessToken → memory (Zustand/React state)
     │                                     refreshToken → httpOnly cookie (set by server)
     │                                               │
     │                                     Read user.role from JWT payload
     │                                               │
     │                               ┌──── role === 'patient' ?
     │                               │              │
     │                               │    user.onboardingComplete?
     │                               │         ├── No  → /onboarding/patient
     │                               │         └── Yes → /dashboard (PatientDashboard)
     │                               │
     │                               ├──── role === 'practitioner' ?
     │                               │         ├── No  → /onboarding/practitioner
     │                               │         └── Yes → /dashboard (PractitionerDashboard)
     │                               │
     │                               └──── role === 'admin' → /admin
     │
     └── Valid token → decode role → same routing logic above

Token Refresh Strategy:
  - Axios request interceptor attaches Authorization: Bearer <accessToken>
  - Axios response interceptor catches 401 → calls POST /auth/refresh (uses httpOnly cookie)
  - On success: update accessToken in Zustand, retry original request
  - On failure: clear auth state → redirect to /auth/login
```

---

## 6. Real-Time Layer

### Socket.io + TanStack Query Integration

The real-time layer handles **two concerns**:
1. **Push events** (new messages, notifications, appointment updates)
2. **Cache invalidation** — Socket events trigger TanStack Query cache invalidations so UI updates automatically without polling.

```
Architecture:

Backend (FastAPI + Socket.io) 
    │── emits events to authenticated socket rooms (user:{userId})
    │
Client (Socket.io-client)
    │── useSocket() hook (singleton connection, authenticated via JWT handshake)
    │── receives events → calls queryClient.invalidateQueries() or setQueryData()
    │
TanStack Query
    │── UI components subscribe to query keys
    │── re-renders automatically when data changes
```

**Socket events table:**

| Event | Payload | Query Invalidated |
|---|---|---|
| `notification:new` | `{id, type, title}` | `['notifications']` |
| `message:received` | `{conversationId, message}` | `['messages', conversationId]` |
| `appointment:updated` | `{appointmentId, status}` | `['appointments']` |
| `appointment:reminder` | `{appointmentId}` | — (toast only) |
| `verification:approved` | `{practitionerId}` | `['auth/me']` |

**Implementation pattern:**

```jsx
// src/features/notifications/hooks/useSocketEvents.js

export function useSocketEvents() {
  const socket = useSocket();          // singleton from SocketProvider
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  useEffect(() => {
    if (!socket) return;

    socket.on('notification:new', (payload) => {
      // 1. Append to cache (optimistic)
      queryClient.setQueryData(['notifications'], (old) => 
        old ? [payload, ...old] : [payload]
      );
      // 2. Show toast
      showToast(payload.title, 'info');
    });

    socket.on('message:received', (payload) => {
      queryClient.invalidateQueries(['messages', payload.conversationId]);
    });

    return () => {
      socket.off('notification:new');
      socket.off('message:received');
    };
  }, [socket, queryClient]);
}
```

---

## 7. Video Consultation Integration

> **MVP v1 Status: Skipped.** Architecture documented here for MVP v2 implementation.

### Chosen Approach: Daily.co SDK

**Why Daily.co over raw WebRTC:**
- Handles signalling, TURN/STUN servers, recording, and bandwidth management
- HIPAA Business Associate Agreement (BAA) available ✅
- Simple React SDK (`@daily-co/daily-react`)
- 10,000 free minutes/month on developer tier

### Integration Plan (v2)

```
Patient/Practitioner joins appointment 15 min before start time
           │
           ▼
GET /appointments/:id/room-token
           │  (backend creates Daily.co room + short-lived token)
           ▼
<VideoRoom roomUrl={url} token={token} />
           │
           ├── DailyProvider wraps the room
           ├── useParticipants() — video grid
           ├── useLocalParticipant() — self-view, controls
           ├── Chat panel — sidebar using Daily.co app-messages
           └── Session Notes — text area saved to /appointments/:id/notes
                (saved to backend, never in localStorage)

Route: /consultation/:appointmentId
Guard: both patient and practitioner with valid appointment, within time window
```

---

## 8. Sensitive Data Handling — HIPAA Guardrails

### What NEVER goes in localStorage (or sessionStorage)

| Data Type | Why | Where it lives instead |
|---|---|---|
| Access tokens (JWT) | XSS attack surface | Zustand in-memory store only |
| Refresh tokens | Persistent token theft | httpOnly cookie (server-set) |
| Patient health conditions | PHI | Backend database only |
| Clinical notes | PHI | Backend database only |
| Appointment details with diagnoses | PHI | Fetched fresh per-session |
| Practitioner verification documents | Sensitive PII | Backend secure storage (S3 + server-side encryption) |
| Payment information | PCI scope | Payment processor (Paystack), never touches frontend storage |
| Chat message content | PHI-adjacent | Never cached to disk; TanStack Query in-memory only |

### What IS safe in localStorage

| Data | Rationale |
|---|---|
| `theme` (dark/light) | Non-sensitive UX preference |
| `language` preference | Non-sensitive |
| `lastViewedTab` | Non-sensitive navigation state |
| `onboardingStep` (step number only, no data) | Non-sensitive progress indicator |

### Additional Guards

```
// Logging — NEVER log:
console.log(user.healthConditions)   // ❌
console.log(appointment.notes)       // ❌
console.log(user.email)              // ❌ (in production)

// Sentry / error tracking
// Strip PHI fields before sending to Sentry:
Sentry.configureScope(scope => {
  scope.setUser({ id: user.id });    // ✅ ID only, no email, no health data
});

// Network — all requests:
// ✅ HTTPS only (enforced via Vercel config)
// ✅ Authorization header (Bearer token)
// ✅ No PHI in query params (always in request body)
// ✅ No PHI in URL paths (use IDs, not names)
```

---

## 9. Folder Structure

```
herbit-habitat/
├── public/
│   └── favicon.svg
│
├── src/
│   │
│   ├── app/                          # App bootstrap
│   │   ├── App.jsx                   # Root component, router, providers
│   │   ├── router.jsx                # All route definitions
│   │   └── providers.jsx             # QueryClient, Socket, Toast, Theme providers
│   │
│   ├── assets/                       # Static assets
│   │   ├── fonts/
│   │   ├── images/
│   │   └── icons/
│   │
│   ├── components/                   # Shared UI components (not feature-specific)
│   │   ├── ui/
│   │   │   ├── Button.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── Avatar.jsx
│   │   │   ├── Badge.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Toast.jsx
│   │   │   ├── Tabs.jsx
│   │   │   ├── Searchbar.jsx
│   │   │   ├── Spinner.jsx           # Loading states
│   │   │   ├── EmptyState.jsx        # Empty data states
│   │   │   ├── ErrorBoundary.jsx
│   │   │   └── SkeletonLoader.jsx
│   │   ├── forms/
│   │   │   ├── FormInput.jsx
│   │   │   ├── FormSelect.jsx
│   │   │   ├── FormTextarea.jsx
│   │   │   ├── FormGroup.jsx
│   │   │   └── DateTimePicker.jsx
│   │   ├── layout/
│   │   │   ├── AppShell.jsx          # Sidebar + main layout wrapper
│   │   │   ├── Sidebar.jsx           # Role-aware nav (renders correct items by role)
│   │   │   ├── Topbar.jsx            # Page header with breadcrumb + actions
│   │   │   ├── MobileNav.jsx         # Bottom nav for mobile
│   │   │   └── PageWrapper.jsx       # Padding, max-width, animation wrapper
│   │   └── guards/
│   │       ├── RoleGuard.jsx         # Role-based route protection
│   │       ├── AuthGuard.jsx         # Authenticated route protection
│   │       └── OnboardingGuard.jsx   # Redirects to onboarding if incomplete
│   │
│   ├── features/                     # Feature modules (one folder per feature)
│   │   │
│   │   ├── auth/                     # Authentication
│   │   │   ├── components/
│   │   │   │   ├── LoginForm.jsx
│   │   │   │   ├── RegisterForm.jsx
│   │   │   │   └── RoleSelector.jsx
│   │   │   ├── hooks/
│   │   │   │   └── useAuth.js        # Login, logout, refresh, user state
│   │   │   ├── api/
│   │   │   │   └── authApi.js        # POST /auth/login, /auth/register, /auth/refresh
│   │   │   ├── store/
│   │   │   │   └── authStore.js      # Zustand store: { user, accessToken, setAuth, clearAuth }
│   │   │   └── types/
│   │   │       └── auth.types.js
│   │   │
│   │   ├── onboarding/               # Patient + Practitioner onboarding
│   │   │   ├── patient/
│   │   │   │   ├── components/
│   │   │   │   │   ├── OnboardingWizard.jsx
│   │   │   │   │   ├── HealthGoalsStep.jsx
│   │   │   │   │   ├── ConditionsStep.jsx   # PHI — sent directly to API, never stored locally
│   │   │   │   │   └── PreferencesStep.jsx
│   │   │   │   └── hooks/
│   │   │   │       └── usePatientOnboarding.js
│   │   │   └── practitioner/
│   │   │       ├── components/
│   │   │       │   ├── PractitionerOnboardingWizard.jsx
│   │   │       │   ├── CredentialUpload.jsx   # Multipart upload to backend
│   │   │       │   ├── AvailabilitySetup.jsx
│   │   │       │   └── VerificationPending.jsx
│   │   │       └── hooks/
│   │   │           └── usePractitionerOnboarding.js
│   │   │
│   │   ├── matching/                 # AI Matching (patient)
│   │   │   ├── components/
│   │   │   │   ├── MatchList.jsx
│   │   │   │   ├── MatchCard.jsx
│   │   │   │   ├── MatchFilters.jsx
│   │   │   │   └── MatchScoreBadge.jsx
│   │   │   ├── hooks/
│   │   │   │   └── useMatches.js     # useQuery(['matches'], fetchMatches)
│   │   │   └── api/
│   │   │       └── matchingApi.js    # GET /matching/results
│   │   │
│   │   ├── discovery/                # Practitioner Discovery (patient + public)
│   │   │   ├── components/
│   │   │   │   ├── DiscoveryGrid.jsx
│   │   │   │   ├── PractitionerCard.jsx
│   │   │   │   ├── SearchFilters.jsx
│   │   │   │   └── PreviewDrawer.jsx
│   │   │   ├── hooks/
│   │   │   │   └── useDiscovery.js   # useInfiniteQuery for paginated results
│   │   │   └── api/
│   │   │       └── discoveryApi.js   # GET /practitioners?specialty=&page=
│   │   │
│   │   ├── profile/                  # Public practitioner profile
│   │   │   ├── components/
│   │   │   │   ├── PublicProfile.jsx
│   │   │   │   ├── CredentialBadges.jsx
│   │   │   │   ├── ReviewList.jsx
│   │   │   │   ├── AvailabilityCalendar.jsx
│   │   │   │   └── BookingCTA.jsx
│   │   │   └── api/
│   │   │       └── profileApi.js     # GET /practitioners/:slug
│   │   │
│   │   ├── booking/                  # Appointment booking
│   │   │   ├── components/
│   │   │   │   ├── BookingWizard.jsx
│   │   │   │   ├── ServicePicker.jsx
│   │   │   │   ├── DatePicker.jsx
│   │   │   │   ├── TimeSlotGrid.jsx
│   │   │   │   └── BookingConfirmation.jsx
│   │   │   ├── hooks/
│   │   │   │   ├── useBooking.js     # useMutation for booking creation
│   │   │   │   └── useAvailability.js
│   │   │   └── api/
│   │   │       └── bookingApi.js     # POST /appointments, GET /availability/:practitionerId
│   │   │
│   │   ├── dashboard/                # Role-split dashboards
│   │   │   ├── patient/
│   │   │   │   ├── PatientDashboard.jsx
│   │   │   │   ├── UpcomingAppointments.jsx
│   │   │   │   ├── HealthSummary.jsx
│   │   │   │   └── RecentActivity.jsx
│   │   │   └── practitioner/
│   │   │       ├── PractitionerDashboard.jsx
│   │   │       ├── TodaySchedule.jsx
│   │   │       ├── PatientQueue.jsx
│   │   │       ├── EarningsSummary.jsx
│   │   │       └── RenewalAlerts.jsx
│   │   │
│   │   ├── schedule/                 # Practitioner schedule (calendar view)
│   │   │   ├── components/
│   │   │   │   ├── WeeklyCalendar.jsx
│   │   │   │   ├── DayView.jsx
│   │   │   │   ├── AppointmentChip.jsx
│   │   │   │   └── AppointmentDetailModal.jsx
│   │   │   └── hooks/
│   │   │       └── useSchedule.js
│   │   │
│   │   ├── patients/                 # Practitioner's patient management
│   │   │   ├── components/
│   │   │   │   ├── PatientList.jsx
│   │   │   │   ├── PatientCard.jsx
│   │   │   │   ├── PatientDetailPanel.jsx
│   │   │   │   ├── ClinicalNotes.jsx
│   │   │   │   └── AppointmentHistory.jsx
│   │   │   └── api/
│   │   │       └── patientsApi.js    # GET /practitioner/patients (role-guarded on backend)
│   │   │
│   │   ├── services/                 # Service catalogue (practitioner)
│   │   │   ├── components/
│   │   │   │   ├── ServiceGrid.jsx
│   │   │   │   ├── ServiceCard.jsx
│   │   │   │   └── ServiceForm.jsx
│   │   │   └── api/
│   │   │       └── servicesApi.js
│   │   │
│   │   ├── revenue/                  # Revenue & payments (practitioner)
│   │   │   ├── components/
│   │   │   │   ├── RevenueDashboard.jsx
│   │   │   │   ├── PaymentTable.jsx
│   │   │   │   └── RevenueChart.jsx  # Recharts
│   │   │   └── api/
│   │   │       └── revenueApi.js
│   │   │
│   │   ├── health-tracking/          # Health tracking (patient)
│   │   │   ├── components/
│   │   │   │   ├── HealthDashboard.jsx
│   │   │   │   ├── MetricLogForm.jsx
│   │   │   │   ├── TrendChart.jsx
│   │   │   │   ├── GoalProgress.jsx
│   │   │   │   └── LogHistory.jsx
│   │   │   └── api/
│   │   │       └── healthApi.js      # POST /health/log, GET /health/metrics
│   │   │
│   │   ├── messaging/                # Secure messaging (both roles)
│   │   │   ├── components/
│   │   │   │   ├── MessagingLayout.jsx
│   │   │   │   ├── ConversationList.jsx
│   │   │   │   ├── MessageThread.jsx
│   │   │   │   ├── MessageBubble.jsx
│   │   │   │   ├── AttachmentUpload.jsx
│   │   │   │   └── TypingIndicator.jsx
│   │   │   ├── hooks/
│   │   │   │   ├── useMessages.js    # useQuery + Socket.io invalidation
│   │   │   │   └── useTyping.js      # Debounced typing event
│   │   │   └── api/
│   │   │       └── messagingApi.js
│   │   │
│   │   ├── reviews/                  # Reviews & ratings
│   │   │   ├── components/
│   │   │   │   ├── ReviewForm.jsx
│   │   │   │   ├── StarRating.jsx
│   │   │   │   └── ReviewCard.jsx
│   │   │   └── api/
│   │   │       └── reviewsApi.js
│   │   │
│   │   ├── notifications/            # Real-time notifications
│   │   │   ├── components/
│   │   │   │   ├── NotificationBell.jsx
│   │   │   │   └── NotificationDrawer.jsx
│   │   │   ├── hooks/
│   │   │   │   ├── useNotifications.js
│   │   │   │   └── useSocketEvents.js  # Socket event → Query invalidation bridge
│   │   │   └── api/
│   │   │       └── notificationsApi.js
│   │   │
│   │   ├── admin/                    # Admin panel
│   │   │   ├── components/
│   │   │   │   ├── AdminDashboard.jsx
│   │   │   │   ├── UserTable.jsx
│   │   │   │   ├── VerificationQueue.jsx
│   │   │   │   └── PlatformStats.jsx
│   │   │   └── api/
│   │   │       └── adminApi.js       # All endpoints require role: admin (backend enforced)
│   │   │
│   │   ├── video/                    # Video consultation (MVP v2 — placeholder only)
│   │   │   └── README.md             # Documents Daily.co integration plan
│   │   │
│   │   └── settings/                 # Settings & profile (both roles)
│   │       ├── components/
│   │       │   ├── SettingsLayout.jsx
│   │       │   ├── ProfileForm.jsx
│   │       │   ├── NotificationPrefs.jsx
│   │       │   ├── SecuritySettings.jsx
│   │       │   └── PractitionerSettings.jsx  # Only rendered for practitioner role
│   │       └── api/
│   │           └── settingsApi.js
│   │
│   ├── hooks/                        # Shared cross-feature hooks
│   │   ├── useDebounce.js
│   │   ├── useLocalStorage.js        # Only for non-PHI preferences
│   │   ├── usePagination.js
│   │   ├── useSocket.js              # Singleton Socket.io connection
│   │   ├── useToast.js
│   │   └── useMediaQuery.js          # Responsive breakpoint detection
│   │
│   ├── lib/                          # Core infrastructure
│   │   ├── axios.js                  # Configured Axios instance (interceptors, base URL)
│   │   ├── queryClient.js            # TanStack Query client config
│   │   ├── socket.js                 # Socket.io singleton factory
│   │   └── validators/
│   │       ├── auth.schema.js        # Zod schemas for auth forms
│   │       ├── booking.schema.js
│   │       └── profile.schema.js
│   │
│   ├── styles/
│   │   ├── globals.css               # CSS variables, resets, base typography
│   │   ├── tokens.css                # Design tokens (colors, spacing, radii)
│   │   └── animations.css            # Keyframe animations
│   │
│   └── utils/
│       ├── format.js                 # fmt() currency, dur() duration, date helpers
│       ├── timezone.js               # date-fns-tz wrappers
│       ├── constants.js              # Role enums, status enums, etc.
│       └── privacy.js                # Strip PHI from objects before logging/analytics
│
├── .env.example                      # Template — copy to .env.local
├── .env.local                        # ← NEVER commit to git
├── .gitignore
├── vercel.json                       # SPA fallback, security headers
├── vite.config.js
├── tailwind.config.js
└── package.json
```

---

## 10. Architecture Decisions & Tradeoffs

### Decision 1: Zustand over Redux for Auth State
**Choice:** Zustand  
**Why:** Auth state in this app is small (user object + token). Redux adds boilerplate with no benefit at this scale. Zustand is 1KB, has no setup ceremony, and works well with TanStack Query.  
**Tradeoff:** Less devtools observability than Redux. Mitigated by Zustand's built-in devtools middleware.

---

### Decision 2: TanStack Query for All Server State
**Choice:** TanStack Query v5  
**Why:** Eliminates loading/error/refetch boilerplate entirely. Background refetching, stale-while-revalidate, and automatic cache invalidation via Socket events make this perfect for a medical platform where data freshness matters.  
**Tradeoff:** Learning curve for developers unfamiliar with it. Docs are excellent.

---

### Decision 3: httpOnly Cookies for Refresh Tokens (not localStorage)
**Choice:** Refresh token in httpOnly cookie, access token in memory only  
**Why:** HIPAA-conscious apps must minimise XSS risk. httpOnly cookies are inaccessible to JavaScript. This is the security-correct pattern.  
**Tradeoff:** Requires backend to set CORS + `credentials: 'include'` correctly. Slightly more complex local dev setup.

---

### Decision 4: Feature-Based Folder Structure
**Choice:** `src/features/<feature>/` with `components/`, `hooks/`, `api/` inside each  
**Why:** Scales to a team. New developers can understand the entire booking feature by looking at one folder. No hunting across `components/`, `pages/`, `hooks/` at the top level.  
**Tradeoff:** Some shared components need careful placement (goes in `src/components/ui/`).

---

### Decision 5: Daily.co over Raw WebRTC (for v2)
**Choice:** Daily.co SDK  
**Why:** HIPAA BAA available. Handles the hard parts (ICE, TURN, browser compat). WebRTC from scratch would take 2-3 sprints; Daily.co is 2-3 days.  
**Tradeoff:** Vendor dependency + cost at scale. For MVP this is the right call.

---

### Decision 6: Tailwind CSS + Custom CSS Variables
**Choice:** Tailwind for utility classes, CSS variables for the brand design system  
**Why:** Tailwind handles responsive design and spacing. CSS variables allow dynamic theming and are already established in the MVP prototype. The combination avoids Tailwind's design sameness by anchoring to a custom token system.  
**Tradeoff:** CSS variables don't get Tailwind's purging benefit — must be managed manually. Use `@layer base` in globals.css.

---

### Decision 7: No Video in MVP v1
**Choice:** Skip Feature 9 (Video Consultation Room)  
**Why:** Daily.co integration, session management, screen share, and HIPAA-compliant recording are significant scope. The most urgent MVP value is matching + booking + messaging. Video ships in v2.  
**Tradeoff:** Some practitioners may expect video from day 1. Mitigate with clear product communication and a v2 roadmap.

---

## 11. Environment Variables

```bash
# .env.example — copy to .env.local for local dev

# API
VITE_API_BASE_URL=https://api.herbithabitat.com/v1
VITE_SOCKET_URL=https://api.herbithabitat.com

# Daily.co (v2 — video consultation)
VITE_DAILY_DOMAIN=herbithabitat.daily.co

# Paystack (payments)
VITE_PAYSTACK_PUBLIC_KEY=pk_test_xxxx

# Sentry (error monitoring — strip PHI before sending)
VITE_SENTRY_DSN=https://xxxx@sentry.io/xxxx

# Feature flags
VITE_FEATURE_VIDEO=false         # Enable when Daily.co is integrated
VITE_FEATURE_AI_MATCHING=true
VITE_FEATURE_HEALTH_TRACKING=true

# Environment
VITE_APP_ENV=development         # development | staging | production
```

**Rules:**
- All frontend env vars **must** be prefixed with `VITE_`
- Never store secrets in frontend env vars (they are public in the bundle)
- API keys visible in frontend (Paystack public key, Sentry DSN) are designed to be public
- Private keys (Paystack secret, database URL, JWT secret) live **only** in the backend `.env`

---

## 12. Deployment Strategy

### Frontend → Vercel

```json
// vercel.json
{
  "rewrites": [{ "source": "/((?!api/).*)", "destination": "/index.html" }],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" }
      ]
    }
  ]
}
```

**Branch strategy:**
- `main` → production.herbithabitat.com
- `staging` → staging.herbithabitat.com (automatic Vercel preview)
- Feature branches → auto-preview URLs for QA

### Backend → Docker + Railway/Render/VPS

```dockerfile
# Dockerfile (backend — not this repo, but documented here)
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

## 13. MVP Scope Boundaries

### In MVP v1 ✅
- All 14 active features (1–8, 10–15)
- Patient + Practitioner + Admin roles
- Appointment booking (date/time, confirmation, WhatsApp notification hook)
- Secure messaging (text + file attachments)
- Health tracking with charts
- AI matching display (results from backend)
- Notifications (real-time bell)
- Practitioner public profiles
- Admin verification queue
- Reviews & ratings

### Deferred to MVP v2 🔜
- Video Consultation Room (Feature 9) — Daily.co integration
- In-app payment processing (Paystack integration — booking flow shows payment summary, actual payment handled separately in v1)
- 2FA / MFA
- Offline support / PWA
- Mobile app (React Native)
- Advanced analytics for admins
- AI-generated health reports

### Never in scope (by design) ❌
- PHI in browser storage — ever
- Admin access to clinical notes without explicit patient consent flow
- Recording of consultations without explicit double-opt-in

---

*Document version: 1.0 | Last updated: May 2026*  
*Maintained by: Herbit Habitat Engineering*
