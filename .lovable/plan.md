## Goal

Make every user-visible string in the app respond to the language switcher (English / हिंदी / ਪੰਜਾਬੀ / मराठी), not just the parts already wired up.

## Current state

- `LanguageContext` persists the choice and exposes `t(key)` — this already works.
- Home page, bottom nav, quick-action titles, and a few cards use `t()` correctly.
- Many surfaces still render hardcoded English: Auth page, About page, Contact page, Profile page, UserHeader, WeatherCard details, MarketHub crop names/labels, MarketTrendsCard, CropScanner buttons/labels, ChatBot placeholders and quick prompts, NotificationSettings, OfflineIndicator, all Modal titles/bodies (Soil, Crop Advisory, AI Recommendations), toast messages.

## Plan

1. **Audit hardcoded strings** — grep each of the 20+ components/pages for English text in JSX and `toast({ title/description })` calls. Produce a single consolidated list of keys.

2. **Extend `src/contexts/LanguageContext.tsx`** with the new keys for all four languages (en, hi, pa, mr). Group by screen with comments so it stays maintainable.

3. **Refactor each file** to replace literals with `t('key')`:
   - Pages: `Auth.tsx`, `About.tsx`, `Contact.tsx`, `Profile.tsx`, `ResetPassword.tsx`, `NotFound.tsx`
   - Header/nav: `UserHeader.tsx`, `AuthDropdown.tsx` (fill remaining English fallbacks)
   - Home cards: `WeatherCard.tsx`, `MarketTrendsCard.tsx`, `FarmerTipsCard.tsx`, `TodayActivities.tsx`
   - Tabs: `MarketHub.tsx`, `CropScanner.tsx`, `ChatBot.tsx`
   - Modals: `SoilConditionsModal.tsx`, `CropAdvisoryModal.tsx`, `AIRecommendationsModal.tsx`, `NotificationSettings.tsx`
   - Status: `OfflineIndicator.tsx`

4. **Toasts and dynamic content** — wrap `toast()` titles/descriptions in `t()`. Where a message includes a value (e.g. "Language changed to X"), keep the value interpolated and translate only the surrounding phrase.

5. **Data-driven content that comes from APIs** (AI chat replies, weather API descriptions, market prices) stays in whatever language the API returns — out of scope for a UI translation pass. Backend AI prompts already accept `language`; leave that behavior as-is.

6. **Verify** — switch to each of the four languages in the preview, walk Home → Market → Scan → AI Bot → Profile → Auth → About → Contact, confirm no English leaks on static labels/buttons/headings.

## Technical notes

- Translation dictionary lives in one file (`LanguageContext.tsx`). Missing keys already fall back to English, so partial coverage during the edit won't break UI.
- No new libraries (no i18next); we keep the existing lightweight `t()` pattern.
- Icons, brand name ("Agri Innovators" / "SmartFarm"), and units stay untranslated.

## Out of scope

- Translating dynamic AI/LLM responses beyond passing `language` to the edge function.
- Right-to-left languages.
- Number/date localization.
