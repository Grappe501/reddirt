# SOS check copy board — local test then Netlify

## Use the correct repo folder

```text
H:\SOSWebsite\RedDirt-main-travel-ledger
```

Not `H:\SOSWebsite\RedDirt` (that branch may not have these scripts yet).

## 1. Local setup (one time)

```powershell
cd H:\SOSWebsite\RedDirt-main-travel-ledger
git pull origin main
```

Create or edit **`.env.local`** (gitignored):

```env
ADMIN_SECRET=your-local-admin-secret
COMPLIANCE_APRIL26_DIR=H:\SOSWebsite\Compliance\April26
OPENAI_API_KEY=sk-...   # optional but needed for vision extract
```

## 2. Run locally

```powershell
npm run dev
```

Open (after signing into admin):

**http://localhost:3000/admin/compliance/checks/sos-entry**

### Local workflow

1. Confirm banner shows **April26 folder: found** and **7 check image(s)**.
2. Click **Extract all (vision)** or extract one check at a time.
3. Verify fields against each physical check; edit and **Save edits**.
4. Use **Copy** on each field → paste into Arkansas SOS individual contribution form.
5. **Download CSV** or **Download JSON** from the toolbar (for your records or Netlify import).

CLI alternative:

```powershell
npm run compliance:extract-april-checks
npm run compliance:export-april-checks-csv
```

Outputs (gitignored):

- `data/compliance/checks/april-check-sos-entries.json`
- `data/compliance/checks/april-check-sos-export.csv`

## 3. Push to GitHub → Netlify

When local looks good:

```powershell
git add .
git status   # confirm no bank CSV, no april-check-sos-entries.json, no donor exports
git commit -m "Your message"
git push origin main
```

Netlify builds from `main` automatically.

### On Netlify

- Page: **`/admin/compliance/checks/sos-entry`** on your production URL.
- **Check images are not on Netlify** unless you mount `Compliance/April26` on the server (not typical).
- **Recommended:** On your PC, run extract locally → **Download JSON** → on Netlify click **Import JSON workbook** → copy fields into SOS (images optional on production).

Do **not** commit `april-check-sos-entries.json` (contains donor PII).

### Netlify env vars

Set in Netlify → Site configuration → Environment variables:

| Variable | Required |
| --- | --- |
| `DATABASE_URL` | Yes (hosted Postgres) |
| `ADMIN_SECRET` | Yes |
| `OPENAI_API_KEY` | Only if extracting on Netlify (usually extract locally instead) |

`COMPLIANCE_APRIL26_DIR` only helps if that path exists on the Netlify build/runtime host (usually it does not).

## 4. Quick links in app

- Compliance → **Checks** → **SOS copy board (April checks)**
- April26 desk → **SOS copy board** card
