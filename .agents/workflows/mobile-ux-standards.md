---
description: Project UX Standards for Mobile & Cross-platform Compatibility
---

# Mobile-First UX Standards for GymTracker

To ensure a premium and non-intrusive experience for Vietnamese users on iOS, Android, and Desktop, all new modals and data-entry views must follow these rules:

### 1. Auto-Scroll to Top (Primary Rule)
- All search or list-based modals MUST scroll to the top upon opening.
- Use a `scrollRef` on the scrollable container and a `useEffect` on mount to set `scrollTop = 0`.
- **Reason**: Prevents users from seeing a stale scroll position from a previous session.

### 2. No Auto-Focus on Mobile (Primary Rule)
- NEVER use `autoFocus` or manual `.focus()` on text inputs upon component mounting.
- **Reason**: Prevents the mobile keyboard (especially on iOS) from popping up unintentionally and blocking 50% of the screen before the user has oriented themselves.

### 3. Fullscreen Overlays for iOS Safari
- Use `100dvh` (Dynamic Viewport Height) for main modal containers instead of `100vh`.
- **Reason**: Accounts for the dynamic height of Safari's address bar and toolbar.

### 4. Tactile Controls
- Steppers (+/-) and selection chips must be at least 44x44 pixels (Apple's HIG) or have enough padding for easy thumb interaction.
- Use `active:scale-[0.98]` or haptic-style visual feedback on touch.
