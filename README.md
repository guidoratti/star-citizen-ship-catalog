# Star Citizen — Ship Catalog (Web App for GitHub Pages)

A fast, zero-install web application for browsing and searching all **257 Star Citizen ships**, designed to run directly on **GitHub Pages** (or locally by double-clicking `web/index.html`) — no antivirus warnings, no downloads, and no personal API key exposed in the frontend.

## Try It Right Now (Locally)
Double-click:
- `web\index.html`

It opens straight in your browser (works offline and online, no local server required).

## Publish to GitHub Pages (Free Webpage in ~2 Minutes)
Since Git is not installed on your PC yet, the fastest way is directly on **github.com**:

1. **Create a new repository** on [github.com/new](https://github.com/new) (e.g., `star-citizen-ship-catalog`), set it to **Public**, and click **Create repository**.
2. **Upload the 5 files inside the `web/` folder**:
   - On your new repo page, click **uploading an existing file**.
   - Drag and drop all 5 files from `C:\Users\gratti\.gemini\antigravity\scratch\star-citizen-ship-catalog\web\`:
     - `index.html`
     - `styles.css`
     - `app.js`
     - `ships-data.js`
     - `nyx_i.png`
   - Click **Commit changes**.
3. **Enable GitHub Pages**:
   - Go to your repo's **Settings → Pages** (left sidebar).
   - Under **Build and deployment → Branch**, select **`main`** and folder **`/ (root)`**, then click **Save**.
   - Wait ~1 minute and refresh — GitHub will show your live URL:
     `https://<your-github-username>.github.io/star-citizen-ship-catalog/`

## Features
- **Nyx I Planet Background**: High-resolution Nyx I low-orbit backdrop with a dark sci-fi glassmorphism UI.
- **Top Search Bar**: Instant live search across ship names, manufacturers, roles/focus, type, and size (`/` focuses search, `Esc` goes back).
- **Most Relevant Ships**: Defaults to the newest / most recently updated & purchasable ships, with filters for **All Ships**, **Flight Ready**, **In Concept**, **Purchasable**, **Manufacturer**, and **Sort** options.
- **Official RSI Ship Images**: Uses the exact official RSI ship image from the ship's page, with click-to-enlarge full-screen lightbox and a direct link to the official RSI pledge page.
- **Full Ship Details**: Flight status, price (USD), store availability, lore description, technical specifications, and standard loadout/components.
- **PayPal Donation Button**: Fixed in the bottom footer bar, linking directly to PayPal donations for `gratti@gmail.com`.
- **Safe for Public Hosting**: Your `starcitizen-api.com` API key is **not** included in the `web/` folder.
