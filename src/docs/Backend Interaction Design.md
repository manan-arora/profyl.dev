
> **Status:** Living Architecture Document
>
> This document defines how backend interactions are organized in Profyl using the Next.js App Router architecture.
>
> It documents both:
>
> - the architecture currently implemented
> - the intended architecture as additional product capabilities are introduced
>
> Only implemented components should be considered production-ready. Planned components represent the target architecture and will be introduced incrementally.

---

# Design Philosophy

Profyl separates backend interactions into four categories based on their responsibility.

Rather than exposing everything through REST APIs, Next.js App Router allows reads, mutations, and external integrations to each use the most appropriate abstraction.

```text
Read Existing Data
        │
Server Components
        │
        ▼
Read Helpers
        │
        ▼
Service Layer
        │
        ▼
Prisma
        │
        ▼
PostgreSQL
```

```text
Update Internal Data
        │
Server Actions
        │
        ▼
Service Layer
        │
        ▼
Prisma
        │
        ▼
PostgreSQL
```

```text
External Integrations
        │
Route Handlers
        │
        ▼
Service Layer
        │
        ▼
External APIs
```

---

# 1. 🟢 Server Components & Read Helpers

## Purpose

Read data required for rendering pages.

Server Components should not contain business logic.

They authenticate the request (if required), delegate to the Service Layer, and render UI.

---

## Currently Implemented

### `getCurrentUser()`

**Location**

```
src/lib/auth/current-user.ts
```

**Purpose**

Authenticates the current session using Clerk and returns the corresponding `User` record from PostgreSQL.

Used by:

- Server Components
- Server Actions
- Route Handlers

---

### Onboarding Repository Fetch

Current onboarding pages retrieve repositories through:

```
projectService.getAvailableProjects(userId)
```

Repositories are:

- already synchronized
- already filtered during GitHub Sync
- sorted by most recently updated

No additional filtering occurs during onboarding.

---

## Planned

As the application grows, additional read helpers will be introduced.

Examples:

### `getDashboardData()`

Returns all data required to render the authenticated dashboard.

May aggregate:

- Profile
- Repository
- GitHub Cache
- LeetCode Cache
- Analytics
- AI Insights

---

### `getPublicProfile()`

Builds the complete recruiter-facing profile from multiple persisted data sources.

---

# 2. 🟡 Server Actions

## Purpose

Server Actions mutate Profyl's own database.

They:

- authenticate requests
- orchestrate workflows
- delegate business logic to services

Business rules should remain inside the Service Layer.

---

## Currently Implemented

### `completeOnboarding(selectedProjectIds)`

**Location**

```
src/app/onboarding/actions.ts
```

**Workflow**

1. Authenticate current user.
2. Persist selected featured projects.
3. Transition profile lifecycle:

```
INCOMPLETE
↓

DRAFT
```

4. Return success.

This action serves as the onboarding orchestration layer.

---

## Planned

### `updateProfile()`

Persist editable profile information.

Examples:

- headline
- bio
- education
- links
- tech stack

---

### `updateProjects()`

Persist project customizations.

Examples:

- custom title
- custom description
- live demo URL
- featured ordering

---

### `publishProfile()`

Validates publish requirements before making the profile public.

---

# 3. 🔵 Route Handlers

## Purpose

Route Handlers exist only where a true HTTP boundary is required.

Examples:

- webhooks
- third-party integrations
- uploads

---

## Currently Implemented

### `POST /api/webhooks/clerk`

Synchronizes Clerk identity events with PostgreSQL.

Supported events:

- user.created
- user.updated
- user.deleted

---

## Planned

### Resume Upload

```
POST /api/profile/resume
```

Uploads and stores user resumes.

---

### LeetCode Verification

```
POST /api/leetcode/init
```

Creates verification token.

```
POST /api/leetcode/verify
```

Verifies ownership and imports LeetCode statistics.

---

# 4. Service Layer

## Purpose

The Service Layer owns all business logic.

Neither Server Components, Server Actions, nor Route Handlers should implement complex workflows directly.

---

## Currently Implemented

### githubService

Responsible for synchronizing GitHub data.

Workflow:

- Retrieve GitHub OAuth token
- Fetch GitHub profile
- Fetch repositories
- Compute eligible repository snapshot
- Upsert eligible repositories
- Delete repositories that are no longer eligible
- Update GitHub cache
- Update GitHub identity

GitHub remains the source of truth.

The local database stores a synchronized snapshot of eligible repositories.

---

### projectService

Responsible for repository-related business rules.

Current functions:

### `getAvailableProjects(userId)`

Returns repositories belonging to a user ordered by:

```
updatedAt DESC
```

Repositories returned are already eligible because GitHub synchronization performs filtering before persistence.

---

### `saveFeaturedProjects(userId, projectIds)`

Responsibilities:

- maximum four projects
- duplicate validation
- ownership validation
- clear previous featured projects
- assign sequential display order
- persist featured selection

---

## Planned

### profileService

Editable profile management.

---

### leetcodeService

Verification and synchronization.

---

### analyticsService

Computes:

- Profyl Score
- Radar
- Signal Breakdown
- Percentiles

---

### aiService

Generates:

- Hero Signal
- AI Summary
- Strength Chips
- Project Summaries

---

### publishService

Owns profile publishing workflow and lifecycle transitions.

---

# 5. Prisma

## Purpose

Prisma is the application's data access layer.

Responsibilities:

- queries
- inserts
- updates
- deletes
- relations

Business rules never belong here.

---

# Overall Request Flow

```text
                         USER INTERACTION
                                │
        ┌───────────────────────┼────────────────────────┐
        │                       │                        │
        ▼                       ▼                        ▼
 Server Component         Server Action          Route Handler
        │                       │                        │
        ▼                       ▼                        ▼
     Read Helpers        Workflow Orchestration    HTTP Boundary
        └───────────────┬───────────────┬────────────────┘
                        ▼
                  Service Layer
      (github / project / future services)
                        ▼
                     Prisma
                        ▼
                  PostgreSQL
                        │
                        ▼
     GitHub / Clerk / LeetCode / Storage
```

---

# Guiding Principles

- Server Components are responsible for rendering and reading data.
- Server Actions orchestrate internal mutations.
- Route Handlers exist only where HTTP boundaries are required.
- Services own business rules and workflows.
- Prisma performs persistence only.
- PostgreSQL remains the single source of truth for Profyl-owned data.
- External providers (GitHub, Clerk, LeetCode) remain the source of truth for external signals.