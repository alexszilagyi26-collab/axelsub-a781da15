# AxelSub – Magyar Anime Platform

## Projekt áttekintés
AxelSub egy magyar feliratú anime/manga közösségi platform. Felhasználók böngészhetnek animéket és mangákat, epizódokat nézhetnek, kedvenceket menthetnek, kommenteket írhatnak, értékelhetnek és értesítéseket kaphatnak új részekről.

## Technológiai stack
- **Frontend:** React 18 + TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend:** Node.js + Express (server/index.mjs) – SSR/OG-injekció + API végpontok
- **Adatbázis / Auth:** Supabase (külső szolgáltatás) – PostgreSQL + Row Level Security + Auth
- **Email:** Brevo API (SMTP értesítések)
- **Discord:** Webhook-on keresztül epizód értesítések

## Futtatás
```
npm run dev
```
Port: **5000** (Vite dev szerver az Express mögött)

## Szükséges environment változók (Replit Secrets)
| Kulcs | Leírás |
|---|---|
| `VITE_SUPABASE_URL` | Supabase projekt URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (admin funkciókhoz, email értesítésekhez) |
| `BREVO_API_KEY` | Brevo email API kulcs |
| `BREVO_SENDER_EMAIL` | Küldő email cím |
| `DISCORD_EPISODE_WEBHOOK_URL` | Discord webhook URL epizód értesítésekhez |

## Könyvtárstruktúra
```
src/
  components/     # UI komponensek (AuthModal, VideoPlayer, EpisodeManager, stb.)
  contexts/       # React Context (AuthContext)
  hooks/          # Custom hook-ok (useAuth, useAnimes, useWatchHistory, stb.)
  pages/          # Oldalak (Index, AnimeDetail, Browse, Admin, Shop, stb.)
  integrations/supabase/  # Supabase kliens és TypeScript típusok
  lib/            # Segédfüggvények
server/
  index.mjs       # Express szerver: API végpontok + Vite dev szerver + OG-injekció
supabase/
  migrations/     # Adatbázis migrációk (Supabase SQL)
  functions/      # Supabase Edge Functions (og-image)
api/              # Vercel-stílusú serverless függvények (nem aktív Repliten)
```

## Főbb funkciók
- **Anime/Manga böngészés** – szűrés, keresés, részletes oldalak
- **Videólejátszó** – többféle minőség, felirat, opening/ending skip
- **Felhasználói fiókok** – Supabase Auth (email + jelszó), profil szerkesztés
- **Kedvencek, nézési lista, előzmények**
- **Kommentek és értékelések**
- **Admin panel** – anime/epizód/manga kezelés, rendelések, felhasználók
- **Webshop** – termékek, rendelések, email értesítések
- **Értesítési rendszer** – in-app + email + Discord webhook

## Ismert konfiguráció
- A Supabase projekt ID: `zdwhtyeqhhplpyqmnyiz`
- Az email megerősítő link automatikusan a jelenlegi domain-re mutat (`window.location.origin`)
- A Supabase Dashboard-on az **Authentication → URL Configuration → Redirect URLs** listájához hozzá kell adni a Replit domain-t
