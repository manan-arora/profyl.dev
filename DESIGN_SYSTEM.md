# Profyl Design System

Version: 1.0

---

# Purpose

This document defines the visual language and frontend implementation rules for Profyl.

Its goals are to:

- maintain a consistent visual identity
- enable pixel-perfect implementation
- minimize design drift
- make AI-assisted development predictable
- allow Lovable components to be integrated with minimal modification

---

# Design Philosophy

Profyl uses a futuristic, engineering-first visual language.

The interface should feel:

- Premium
- Technical
- Minimal
- Data-centric
- High signal / Low noise

Every visual element should communicate purpose.

Avoid unnecessary decoration.

---

# Brand Personality

Profyl should feel:

- Engineering-first
- Intelligent
- Precise
- Modern
- Fast
- Professional
- Confident

Avoid:

- Playful UI
- Heavy glassmorphism
- Corporate blue aesthetics
- Skeuomorphic elements
- Decorative gradients unless intentionally used

---

# Design Source of Truth

Priority order:

1. Lovable designs
2. DESIGN_SYSTEM.md
3. Existing implemented components

Whenever these conflict, Lovable is the visual source of truth unless there is a functional bug.

---

# Color Palette

## Background

Primary background

#0D0D0D

Used for:

- Page background
- Navbar
- Dashboard
- Hero

---

## Surface

Used for:

- Cards
- Dialogs
- Panels
- Elevated containers

---

## Neon Accent

#C7FF41

Used for:

- Primary CTA
- Highlights
- Active indicators
- Charts
- Focus states
- Important metrics

Use sparingly.

The accent color should always attract attention.

---

## Text

Primary

White

Secondary

70% white

Muted

Gray

---

## Hairline Border

rgba(255,255,255,.08)

Used for:

- Navbar
- Cards
- Separators
- Containers

Avoid heavy borders.

---

# Typography

## Display Font

Space Grotesk

Use for:

- Branding
- Hero headings
- Section titles

---

## Body Font

Inter

Use for:

- Navigation
- Buttons
- Forms
- Body text
- Labels

---

## Mono Font

JetBrains Mono

Use for:

- Version tags
- Technical metadata
- Statistics
- Developer-centric information

---

# Border Radius

Base radius

8px

Use consistent radii.

Do not mix arbitrary values.

---

# Layout

Maximum content width

1400px

Navbar height

64px

Horizontal padding

24px

Desktop padding

40px

---

# Spacing Scale

Prefer:

4

8

12

16

24

32

48

64

Avoid arbitrary spacing values.

---

# Buttons

## Primary

Background

Neon

Text

Dark

Hover

Reduce opacity slightly

---

## Secondary

Transparent

White text

No border

Hover

Increase text brightness only

---

# Navigation

Navbar

- Fixed
- Blur background
- Hairline bottom border
- Center aligned navigation
- Minimal hover effects

---

# Cards

Dark surface

Hairline border

Medium radius

Subtle elevation

Avoid bright shadows.

---

# Effects

## Grid Background

Use only where intentionally designed.

Typically:

- Hero
- Landing page

Do not apply globally.

---

## Neon Glow

Reserved for:

- CTA
- Profyl Score
- Important highlights

Avoid excessive glow.

---

## Scan Lines

Decorative only.

Never use inside forms.

---

# Motion

Animations should be subtle.

Allowed:

- Opacity
- Color
- Small transforms

Avoid:

- Bounce
- Large scaling
- Dramatic transitions

---

# Icons

Use Lucide icons.

Prefer outline icons.

Do not mix icon libraries.

---

# Accessibility

Maintain strong contrast.

Primary actions should always be obvious.

Focus states should use the neon accent.

---

# Component Principles

Components should be:

- Reusable
- Composable
- Independent
- Presentation-focused

Business logic should remain outside presentation components.

---

# Lovable Integration Rules

Lovable is the visual source of truth.

The objective when integrating Lovable components is to preserve the generated UI exactly.

## Preserve Exactly

Do not modify:

- Colors
- Typography
- Font weights
- Font sizes
- Letter spacing
- Spacing
- Padding
- Margin
- Border radius
- Shadows
- Hover effects
- Transitions
- Animations
- Layout
- Utility classes

Examples:

- bg-neon
- text-neon
- text-white/70
- hairline
- grid-bg
- neon-glow
- scan-line
- font-display
- font-mono

These define Profyl's visual identity.

---

## Do NOT Replace

Avoid replacing Lovable classes such as:

bg-neon
→ bg-primary

text-white/70
→ text-muted-foreground

border-white/10
→ border-border

rounded-md
→ rounded-lg

unless intentionally redesigning the component.

Visual fidelity is more important than semantic class names.

---

## Only Modify

When integrating into Next.js, only modify framework-specific code.

Examples:

- Replace `<a>` with `<Link>`
- Replace `<img>` with `<Image>`
- Replace routing
- Integrate Clerk
- Add TypeScript types
- Add state
- Add API calls
- Add data fetching
- Improve accessibility

Visual styling should remain unchanged.

---

# Semantic Tokens

Semantic design tokens exist primarily for:

- shadcn/ui compatibility
- consistency
- future maintainability

Examples:

- background
- foreground
- card
- popover
- primary
- secondary
- muted
- accent
- destructive
- border
- ring
- input

These tokens support infrastructure.

They should not replace Lovable utility classes unless intentionally redesigning the component.

---

# AI Implementation Rules

Whenever implementing UI for Profyl:

1. Lovable is the visual source of truth.

2. Do not redesign components unless explicitly asked.

3. Preserve all Lovable visual classes.

4. Only modify framework-specific code.

5. Reuse existing utilities.

Examples:

- bg-neon
- text-neon
- hairline
- grid-bg
- neon-glow
- scan-line
- font-display
- font-mono

6. Never invent new colors.

7. Never invent new spacing values.

8. Never replace Lovable utility classes with semantic alternatives unless requested.

9. Maintain pixel-level visual fidelity.

---

# Development Workflow

Every UI feature should follow this workflow.

Lovable

↓

Design

↓

Export Component

↓

Copy to Next.js

↓

Replace React-specific APIs

- Link
- Image
- Routing

↓

Integrate Backend

- Clerk
- Prisma
- API
- State

↓

Done

Visual refinement should happen in Lovable.

Next.js should faithfully implement the approved design.

---

# Long-term Goal

Profyl's frontend should evolve by extending the existing design language rather than reinventing it.

Consistency is preferred over novelty.

Implementation fidelity is preferred over creative reinterpretation.