# 02 SOUL: The Portal OG Philosophy

## Core Aesthetics
Portal OG is not just a tool; it is a Command Center. It must look and feel like a high-end terminal for the most elite outbound prospectors.

### 1. Visual Identity (Glassmorphism)
- **Backgrounds**: Deep charcoal (`#0a0a0a`) with subtle radial gradients (Navy to Black).
- **Cards**: Translucent glass (`backdrop-blur-xl`) with fine borders (`1px solid rgba(255, 255, 255, 0.05)`).
- **Typography**: Inter (UI) and Outfit (Headers) for a modern, sleek tech feel.
- **Micro-animations**: Progress bars that "breathe," subtle glows on active engine statuses.

### 2. Autonomous-First UX
- **The "Unwatched" Principle**: The system is designed to run while the user is away. Every page should reflect the current "Autonomous Health" (e.g., "Hardening Engine: 1,420 Contacts Processed Today").
- **Zero Ambiguity**: If an engine stalls (e.g., Apollo API limit reached), the UI must surface the *path to resolution* immediately.

## Engineering Principles
To ensure Antigravity can maintain this system autonomously, we follow these strict rules:

### 1. 100% Type Safety
- Every API response is validated via `zod` before entering the application state.
- No `any` types. Strict null checks are mandatory.

### 2. The Holographic Lead
- A lead's state should be "Holographic"—consistent across the Discovery, Hardening, Intelligence, and Action UI.
- If a lead is updated in the "Intelligence" engine, the change must reflect instantly in the "Action" engine via Supabase Real-time.

### 3. Recursive Intelligence
- The "Intelligence Engine" does not just search; it *analyzes*.
- It must recursively check Tavily results against the ICP definition to ensure 100% relevance before triggering the next engine.
