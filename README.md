# Programator Cursuri

Aplicație web de calendar pentru programarea cursurilor: adăugare cursuri, vizualizare lunară,
listă de săli/traineri administrabilă, verificare automată a suprapunerii sălilor, și rapoarte
descărcabile în PDF/Excel.

- **Frontend**: React + Vite, găzduit static pe GitHub Pages
- **Backend**: Supabase (autentificare email+parolă, bază de date Postgres, RLS)

Nu există înregistrare din aplicație — toți userii sunt creați de tine, direct din Supabase
(vezi Pasul 1 mai jos).

---

## PASUL 1 — Configurare Supabase

1. Creează cont/proiect gratuit pe [supabase.com](https://supabase.com).
2. În proiectul nou, mergi la **SQL Editor → New query**, lipește tot conținutul fișierului
   [`supabase/schema.sql`](supabase/schema.sql) din acest proiect și rulează-l (buton **Run**).
   Acest script creează tabelele (`profiles`, `trainers`, `rooms`, `courses`), regulile de
   securitate (RLS), verificarea automată a suprapunerii sălilor, și populează listele de
   traineri/săli cu datele din Excelul inițial.
3. Mergi la **Project Settings → API** și copiază două valori — le folosești la Pasul 3 și 5:
   - **Project URL**
   - **anon public key**

### Cum creezi utilizatori

1. În Supabase, mergi la **Authentication → Users → Add user → Create new user**.
2. Completezi email și parolă, și bifezi **Auto Confirm User** (ca userul să poată intra
   imediat, fără email de confirmare).
3. Apeși **Create user**. Automat se creează și un rând în tabelul `profiles`, cu rol
   implicit `user`.
4. Trimiți userului email-ul și parola pe care i le-ai stabilit.

### Cum faci un user admin

Adminul poate edita listele de săli și traineri (din meniul **Administrare** al aplicației).
După ce ai creat userul (pasul de mai sus), în Supabase → **SQL Editor** rulezi:
```sql
update public.profiles set role = 'admin' where email = 'adresa@exemplu.com';
```

---

## PASUL 2 — Creează repository-ul pe GitHub

1. Mergi pe [github.com](https://github.com) → **New repository**.
2. Alege un nume — de exemplu `programator-cursuri` (poți alege orice nume, dar reține-l exact,
   ai nevoie de el la Pasul 3).
3. Lasă-l **Public** sau **Private** (ambele merg cu GitHub Pages).
4. **Nu** bifa "Add a README file". Apasă **Create repository**.

---

## PASUL 3 — Ajustează `vite.config.js` cu numele repo-ului tău

Pe calculator, în folderul proiectului, deschide fișierul `vite.config.js` cu Notepad (sau orice
editor de text) și modifică linia `base`, punând **exact** numele repo-ului tău de la Pasul 2,
cu `/` la început și la sfârșit:

```js
base: '/numele-repo-ului-tau/',
```

De exemplu, dacă repo-ul se numește `programator-cursuri`:
```js
base: '/programator-cursuri/',
```

Salvează fișierul.

---

## PASUL 4 — Încarcă proiectul pe GitHub (din browser, fără linia de comandă)

1. Pe pagina repo-ului tău gol (de la Pasul 2), apasă linkul **"uploading an existing file"**.
   (Dacă repo-ul nu mai e gol, mergi la **Add file → Upload files**.)
2. Pe calculator, deschide folderul proiectului (`course-scheduler`).
3. Selectează **tot** conținutul folderului (Ctrl+A), **în afară de**:
   - folderul `node_modules`, dacă există (nu trebuie urcat niciodată)
   - fișierul `.env`, dacă l-ai creat (conține cheile tale Supabase — nu se urcă pe GitHub)
4. Trage (drag & drop) toate fișierele/folderele selectate direct în zona de upload din browser.
   Ai grijă să se încarce și folderul `.github` (cu punct la început — e normal să apară așa în
   Windows) — el conține instrucțiunea de publicare automată.
5. Așteaptă să se încarce tot, scrie un mesaj scurt la **Commit changes** (ex: "Prima versiune")
   și apasă butonul verde.

---

## PASUL 5 — Activează publicarea automată (GitHub Pages)

1. În repo, mergi la **Settings → Pages**.
2. La *Build and deployment → Source*, alege **GitHub Actions**.

---

## PASUL 6 — Adaugă cheile Supabase ca secrete GitHub

1. Tot în repo, mergi la **Settings → Secrets and variables → Actions**.
2. Apasă **New repository secret** de două ori, ca să adaugi:

| Nume secret | Valoare |
|---|---|
| `VITE_SUPABASE_URL` | Project URL, copiat la Pasul 1 |
| `VITE_SUPABASE_ANON_KEY` | anon public key, copiat la Pasul 1 |

---

## PASUL 7 — Verifică publicarea

1. Mergi la tab-ul **Actions** al repo-ului.
2. Ar trebui să vezi workflow-ul **"Deploy pe GitHub Pages"** rulând (sau deja rulat), cu o
   bifă verde. Durează 1-2 minute.
3. Dacă apare bifă roșie (eroare), click pe rulare ca să vezi mesajul exact și trimite-l pentru
   ajutor la diagnosticare.
4. După ce rularea se termină cu succes, aplicația e live la:
   ```
   https://<user-ul-tau-github>.github.io/<numele-repo-ului>/
   ```

---

## PASUL 8 — Testare locală (opțional)

Dacă vrei să testezi aplicația pe calculatorul tău înainte sau în paralel cu varianta publicată:

```
npm install
copy .env.example .env
```
Deschide `.env` cu Notepad și pune acolo `Project URL` și `anon public key` din Supabase
(la fel ca la Pasul 1), apoi:
```
npm run dev
```
Aplicația pornește la `http://localhost:5173`.

---

## Cum funcționează aplicația

- **Calendar** (pagina principală): vizualizare pe lună, cursurile sunt afișate cronologic
  (după ora de start) în ziua lor. Click pe o zonă liberă a unei zile deschide formularul de
  adăugare curs cu data precompletată; click pe un curs existent îl deschide pentru editare.
  Treci mouse-ul peste un curs pentru un rezumat rapid (denumire completă, perioadă, trainer,
  sală, participanți).
- **Culori după durată**: albastru (1 zi) → verde (2-3 zile) → portocaliu (4-7 zile) →
  roșu (peste o săptămână). Legenda apare deasupra calendarului.
- **Câmpurile de dată** sunt în format românesc fix (zz/ll/aaaa), indiferent de limba
  browser-ului folosit.
- **Verificare automată a suprapunerii sălilor**: dacă încerci să programezi un curs într-o
  sală deja ocupată în acel interval, aplicația (și baza de date) refuză salvarea, cu un mesaj
  clar despre cursul cu care se suprapune.
- **Istoric păstrat**: dacă o sală sau un trainer e dezactivat/șters din listă, cursurile vechi
  care îl foloseau rămân intacte și vizibile la editare (marcate „inactiv" / „șters din listă").
- **Rapoarte**: filtrezi după interval de date, sală, trainer și tip curs, apoi descarci
  rezultatul ca PDF sau Excel.
- **Administrare** (vizibil doar userilor cu rol `admin`): adaugă/dezactivează/șterge traineri
  și săli (cu capacitate). Aceste liste alimentează dropdown-urile din formularul de curs.
- **Roluri**: orice user autentificat vede toate cursurile și poate adăuga cursuri noi; poate
  edita/șterge doar cursurile create de el, cu excepția adminului care poate edita/șterge orice.

---

## Dezvoltare ulterioară

Poți reveni oricând într-o conversație cu Claude pentru funcționalități noi (ex: export automat
zilnic pe email, vizualizare săptămânală, notificări, etc.). Trimite link-ul către repo-ul tău
GitHub (sau conectează integrarea GitHub) ca să poată vedea codul curent; apoi încarci fișierele
actualizate prin aceeași metodă de upload din browser (Pasul 4).

## Structură proiect

```
├── supabase/schema.sql        # tot ce trebuie rulat in Supabase
├── src/
│   ├── components/
│   │   ├── Calendar/          # MonthView + formular adaugare/editare curs
│   │   ├── Admin/              # gestionare liste sali/traineri
│   │   ├── Reports/            # filtrare + export PDF/Excel
│   │   ├── DateInputRO.jsx     # camp de data in format romanesc
│   │   ├── Login.jsx
│   │   └── Navbar.jsx
│   ├── contexts/AuthContext.jsx
│   ├── utils/                  # culori dupa durata, date, export PDF/xlsx
│   ├── supabaseClient.js
│   └── App.jsx
└── .github/workflows/deploy.yml   # publicare automata pe push / upload
```
