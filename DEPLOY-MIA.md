# Making MIA Live on ykb.io

MIA (the chat widget) needs a small backend to hold your Anthropic API key
securely — a browser can never keep a key secret. `mia-worker.js` is that
backend. It runs on Cloudflare Workers (free tier, no server to maintain).

## Step 1 — Get an Anthropic API key
1. Go to https://console.anthropic.com and sign up / log in.
2. Go to **Settings → API Keys → Create Key**. Copy it somewhere safe — you
   won't be able to see it again.
3. Note: this is billed separately from any Claude.ai subscription, based on
   usage (pay-as-you-go). A chat widget like this typically costs a few
   pence to a few pounds per month at low-to-moderate traffic, but keep an
   eye on usage in the console.

## Step 2 — Deploy the Worker
1. Go to https://dash.cloudflare.com and sign up / log in (free).
2. In the sidebar, go to **Workers & Pages → Create → Create Worker**.
3. Give it a name, e.g. `ykb-mia`. Click **Deploy** (it'll deploy a default
   "Hello World" script first — that's fine).
4. Click **Edit code** (or "Edit in the dashboard editor").
5. Delete everything in the editor and paste in the full contents of
   `mia-worker.js`.
6. Click **Save and Deploy**.

## Step 3 — Add your API key as a secret
1. Still on your worker's page, go to **Settings → Variables and Secrets**.
2. Click **Add** → choose type **Secret**.
3. Name: `ANTHROPIC_API_KEY`
4. Value: paste the key from Step 1.
5. Save.

## Step 4 — Get your Worker's URL
1. On the worker's overview page, you'll see a URL like:
   `https://ykb-mia.<your-subdomain>.workers.dev`
2. Copy that URL.

## Step 5 — Connect it to your website
1. Open `index.html`.
2. Find this line near the top of the `<script>` section:
   ```js
   const WORKER_URL = 'PASTE_YOUR_WORKER_URL_HERE';
   ```
3. Replace `'PASTE_YOUR_WORKER_URL_HERE'` with your actual worker URL from
   Step 4, e.g.:
   ```js
   const WORKER_URL = 'https://ykb-mia.yourname.workers.dev';
   ```
4. Save, and re-upload `index.html` to your GitHub repo (`ykb.io`) — same
   process as before: **Add file → Upload files → commit**.

## Step 6 — Test it
Visit your live site and click the chat button. MIA should now respond for
real. If something's wrong, open your browser's DevTools (F12) → Console
tab, and check for an error — the most common one is a typo in the worker
URL or the secret name not matching `ANTHROPIC_API_KEY` exactly.

## Optional — lock the widget to your domain only
Right now `mia-worker.js` allows requests from any website
(`ALLOWED_ORIGIN = '*'`). Once your site is live at its final domain, you
can open `mia-worker.js`, change that line to your real domain (e.g.
`'https://ykb.io'`), and redeploy — this stops anyone else from using your
API key through your worker.
