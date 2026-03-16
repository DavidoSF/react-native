## Improvements made

### Architecture & Code quality
- **Path aliases** – replaced all deep relative imports (`../../services/api`) with `@/` aliases across the codebase (e.g. `profile.tsx`).
- **TypeScript fix** – corrected `resurantId` → `restaurantId` in `types/index.ts`.
- **Brand palette** – centralised colour tokens (`Brand.primary`, `Brand.secondary`, …) in `constants/theme.ts`; harmonised the orange header (`#FF6B35`) and violet promo/notification accent (`#8B5CF6`) so they are consistently derived from named constants instead of scattered raw hex values.

### Home screen (`app/(tabs)/index.tsx`)
- **Loading state** – replaced the commented-out loader with a proper `ActivityIndicator` + error message and a *Retry* button.
- **Dynamic promo banner** – fetches from `GET /promos/banner` (new backend endpoint); falls back to a static value when offline or on error.
- **Geolocation-based nearby restaurants** – user coordinates are obtained via `locationService`, then passed as `lat`, `lng`, `sortBy=distance` query params to `GET /restaurants`; the backend calculates distances and sorts results accordingly.
- **FlatList** – replaced `ScrollView` + `.map()` with `FlatList` (stable `keyExtractor`, `ListHeaderComponent` for banner/categories, `ListEmptyComponent` for loader/empty/error states).

### Search screen (`app/(tabs)/search.tsx`)
- **FlatList** – same migration from `ScrollView` + `.map()`.
- **Loading state** – `ActivityIndicator` shown while fetching.
- **Accessible touch targets** – filter button now has `minWidth/Height: 44`.

### Multilingual support (EN / FR)
- `services/i18n.ts` – flat translation dictionaries for French and English.
- `contexts/i18n-context.tsx` – React context + `I18nProvider`; language preference persisted in `AsyncStorage`.
- `I18nProvider` added to the root layout so all screens can call `useI18n()`.
- Home and Search screens consume `t.*` keys; banner labels adapt to the active language.

### Backend (`foodiespot-backend/server.js`)
- New **`GET /promos/banner`** endpoint returning the active home-screen promotional banner (label, title, code, colour, validity date) in both FR and EN.
- Added **`FOODIE30`** to the server-side promo-code validation list (30 % off, minimum order 10 €, max discount 15 €).

---

## Technical choices

| Concern | Choice |
|---|---|
| Navigation | Expo Router (file-based) |
| HTTP client | Axios with request/response interceptors |
| Auth storage | `expo-secure-store` (tokens) + AsyncStorage (user object) |
| Offline support | `NetInfo` + simple cache layer (`services/cache.ts`) |
| i18n | Lightweight custom context (no external library) |
| Image loading | `expo-image` (built-in caching) |

---

## Known limitations

- **No real payment flow** – checkout is mocked; no actual card processing.
- **Push notifications require a physical device** – Expo Go on a simulator cannot register for remote notifications.
- **Backend is not production-ready** – JSON-file persistence, plain-text passwords, hard-coded JWT secrets; intended for development/demo only.
- **Language switcher UI** – the i18n system is wired and ready but a dedicated settings screen / toggle is not yet built into the UI.
- **Image upload** – works on device but may fail on Android emulator due to file URI differences.

---

## Innovative features

### 1. Real-time order tracking with live map
**Why:** Static order history gives no feedback after placing an order. A live tracker makes the wait feel shorter and builds trust.  
**User value:** The user sees their order advance through every step (confirmed → preparing → picked up → delivering → delivered) with a driver marker that moves along a simulated route on a schematic map.  
**Technical challenges:** Polling the backend every 15 s without hammering the server while the app is in the foreground; preventing duplicate simultaneous fetches with an `isFetchingRef` guard; computing a smooth linear driver position from a discrete status enum (`STATUS_PROGRESS` map, 0 → 1); representing it as a percentage-based `left` style on a non-map canvas (no native maps library required).

---

### 2. Step-by-step push notifications for order updates
**Why:** Users leave the app while waiting. Without notifications they have to manually reopen the app to check progress.  
**User value:** A local push notification fires automatically every time the order status advances (e.g. "🛒 En préparation – Préparation en cours"), keeping the user informed even when the app is backgrounded.  
**Technical challenges:** Distinguishing a status *change* from the initial load to avoid a spurious notification on screen mount — solved with a `previousStatusRef` that starts as `null` and is seeded only after the first successful fetch; surfacing the correct human-readable status label in the user's active language by reading from the same i18n dict used for the UI.

---

### 3. Dynamic promo / discount system
**Why:** Hardcoding a single promo code in the checkout flow is not maintainable and gives no flexibility for marketing campaigns.  
**User value:** Active promo codes are fetched from the server (`GET /promos`); the home screen banner updates automatically when a campaign changes; users can enter any valid code at checkout and see a real-time discount preview before confirming.  
**Technical challenges:** Sharing the same `PROMO_CODES` constant between the validation endpoint and the listing endpoint on the backend to avoid duplication; debouncing the validate call so it doesn't fire on every keystroke; gracefully degrading the banner to `null` when the network is unavailable.

---

### 4. Multilingual support (FR / EN)
**Why:** Internationalisation is often bolted on after the fact at great cost; building it from day one keeps all strings in one place and makes the app ready for any market.  
**User value:** Every screen — including the new tracking timeline and notification texts — adapts instantly when the user switches language; the preference is persisted in `AsyncStorage` across sessions.  
**Technical challenges:** Keeping the `Translations` TypeScript interface in sync with both dictionaries so missing keys are caught at compile time; threading `language` into utility functions like `formatTime`/`formatDate` so locale-aware number and date formatting (`toLocaleTimeString`) also switches correctly.

---

### 5. Favorites & cart persistence
**Why:** Users browse on mobile in short sessions; losing a cart or a saved restaurant on every restart is frustrating.  
**User value:** Favorite restaurants survive app restarts (stored via `AsyncStorage`); the cart persists across navigation and is only cleared after a successful order is placed.  
**Technical challenges:** Keeping the cart context synchronised with `AsyncStorage` without introducing stale reads; clearing the cart at exactly the right moment (after the `POST /orders` response, not before) so a network error does not silently discard items.

