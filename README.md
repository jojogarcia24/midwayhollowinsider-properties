# Midway Hollow Insider — Property Detail Site

This is the companion Netlify site that renders a full property detail page
when your search widget sends a user here with listing data in the URL.

## What's in this zip

```
mhi-property-site/
├── index.html                    ← Property detail page (the big one)
├── make-offer.html               ← Offer submission form
├── schedule-tour.html            ← Tour request form
├── thanks.html                   ← Confirmation for tour requests
├── thanks-offer.html             ← Confirmation for offer submissions
├── elr-offer-onefile.js          ← Shared data-flow script (loaded by every page)
├── _redirects                    ← Netlify clean-URL rules
├── docs/
│   ├── trec-agency-disclosure.pdf
│   └── representation-agreement.pdf
│
├── search-widget.html            ← The corrected widget to paste into MHI main site
├── search-widget.css             ← Styles for the widget (B&W editorial)
├── search-widget-behavior.js     ← Makes the widget actually work
└── README.md                     ← You're reading it
```

## Setup — step by step

### 1. Create a second Netlify site for property details

In GitHub, create a NEW repo (separate from your main MHI one):

```
jojogarcia24/midwayhollowinsider-properties
```

Upload every file in this zip EXCEPT `search-widget.html`, `search-widget.css`,
and `search-widget-behavior.js` (those go on your main site — see step 3).

Connect that new repo to a new Netlify site. Leave all build settings blank,
branch `main`, same as your main site.

You'll get a URL like `midwayhollowinsider-properties.netlify.app`.

### 2. (Optional) Add a custom subdomain

In Netlify → Domain settings, add `homes.midwayhollowinsider.com` as a custom
domain. Netlify will tell you the CNAME to add — since your main domain is
already on Netlify DNS, this takes one click and ~5 minutes to go live.

Now your property pages live at `homes.midwayhollowinsider.com` instead of
a raw `.netlify.app` URL.

### 3. Add the search widget to your main MHI site

On your main MHI repo (`midwayhollowinsider`):

**a.** Paste the CSS from `search-widget.css` into your existing `style.css`
(or drop it in as its own file and link it).

**b.** Paste the HTML from `search-widget.html` into your `index.html`
wherever you want the search to appear. (Right now the placeholder is a
small form in the `#search` section — replace that whole form with the
widget HTML.)

**c.** Add `search-widget-behavior.js` to the repo (root level) and include
it at the bottom of `index.html` right before `</body>`:

```html
<script src="/search-widget-behavior.js"></script>
```

**d.** Update the destination URL — two places work, pick one:

   Option A: Edit the `data-results-url` attribute on the widget div:
   ```html
   <div class="mls-search-card" data-results-url="https://homes.midwayhollowinsider.com/">
   ```

   Option B: Edit the top of `search-widget-behavior.js`:
   ```js
   resultsPageUrl: 'https://homes.midwayhollowinsider.com/'
   ```

### 4. Commit, push, and test

Push both repos. Wait ~30 seconds for Netlify deploys.

Open `midwayhollowinsider.com`, use the search. You'll land on the property
detail site with listing data in the URL, the page hydrates, and the
Make Offer / Schedule Tour buttons already carry the listing context.

### 5. Configure Netlify environment variables for listing API proxy

This project includes a Netlify Function at `netlify/functions/listing.js` that
proxies listing lookups to SimplyRETS so credentials are never exposed in the
browser.

In Netlify (for your property-detail site), set these environment variables:

- `SIMPLYRETS_KEY`
- `SIMPLYRETS_SECRET`

Fallback names are also supported by the function:

- `SIMPLYRETS_USERNAME`
- `SIMPLYRETS_PASSWORD`

After setting variables, trigger a redeploy so the function can authenticate.

### 6. Configure Netlify webhook environment variable for lead forwarding

This project includes a Netlify Function at `netlify/functions/lead.js` that
forwards tour and offer form submissions to your GoHighLevel webhook endpoint.

In Netlify (for your property-detail site), set:

- `GHL_WEBHOOK_URL`

Fallback name also supported:

- `HIGHLEVEL_WEBHOOK_URL`

After setting this value, redeploy so `/api/lead` can forward leads
server-side without exposing webhook URLs in browser code.

## How the data flows

```
[Main MHI site: search widget]
         |
         v   (user clicks Search)
[Property site: index.html]
   - Reads URL params + window.__LISTING__
   - Hydrates photo, price, address, stats, etc.
   - elr-offer-onefile.js stashes listing in localStorage
   - Rewrites Make Offer / Schedule Tour links to carry ref
         |
         v   (user clicks Make Offer)
[Property site: make-offer.html]
   - Pulls listing via ref from stash OR URL params
   - User fills offer form
   - elr-offer-onefile.js captures submission into sessionStorage
         |
         v   (user submits)
[Property site: thanks-offer.html]
   - Reads sessionStorage + stash
   - Renders editorial B&W recap with confetti
```

## How to plug in your MLS feed later

When you wire up an IDX/MLS feed (NTREIS, Realtyna, Spark, etc.), the property
page expects listing data as URL params. Example request URL:

```
https://homes.midwayhollowinsider.com/?ListingId=12345678
  &UnparsedAddress=4119+Dunhaven+Rd
  &City=Dallas
  &StateOrProvince=TX
  &PostalCode=75229
  &ListPrice=2495000
  &BedroomsTotal=5
  &BathroomsTotalInteger=5
  &LivingArea=5200
  &YearBuilt=2025
  &PropertySubType=Single+Family+Residence
  &MlsStatus=Active
  &PublicRemarks=Stunning+new+construction...
  &PhotoUrl=https%3A%2F%2Fcdn...%2Fmain.jpg
  &Photos=https%3A%2F%2F...%2F1.jpg%7Chttps%3A%2F%2F...%2F2.jpg
  &vendor=ntreis
```

Param names match RESO Web API fields (standard for modern MLS feeds).
Alternate names (`price`, `address`, `beds`, etc.) are also supported for
flexibility.

## Editing & customizing

### Change the logo / branding

Every file has the same logo HTML:
```html
<a href="/" class="logo">MIDWAY HOLLOW <span>INSIDER</span></a>
```

Swap that for an `<img>` if you want a graphical logo. The `<span>` is
italicized via CSS for the magazine feel.

### Change colors

Every CSS file uses CSS custom properties at the top:
```css
:root {
  --ink: #0a0a0a;       /* black */
  --paper: #ffffff;     /* white */
  --cream: #f7f5f1;     /* off-white panels */
  --line: #e5e5e5;      /* border gray */
  --muted: #666;        /* muted text */
}
```

Change those values in one place to retheme the whole site.

### Change fonts

The site uses Playfair Display (serif headlines) + Inter (body). Both load
from Google Fonts at the top of every HTML file. To swap, replace the
`<link>` tag and update the `font-family` rules.

### TREC compliance

The footer on every page includes:
- "Elite Living Realty, LLC"
- "TREC License #9010184"
- "Equal Housing Opportunity"

The IABS PDF is linked from the property page legal section.
The representation agreement PDF lives at `/docs/representation-agreement.pdf`
in case you want to link to it from anywhere else.

## Troubleshooting

**Photo doesn't show up on property page**
→ Check the URL has `PhotoUrl` or `photo` param. URL-encode the image URL.

**Thanks page is blank**
→ Open DevTools → Application → Session Storage. Look for
`elr-offer-submission` or `elr-tour-submission`. If missing, the form submit
didn't fire the capture — make sure `elr-offer-onefile.js` is loaded.

**Make Offer button on property page doesn't carry listing data**
→ Check that the button has `href="#make-offer"` or `href="/make-offer.html"`
or class `.js-make-offer`. The seeder only rewrites matching links.

**Search widget doesn't navigate**
→ Check `data-results-url` on the search card OR
`window.MIDWAY_SEARCH_CONFIG.resultsPageUrl` — one of them needs your
property-site URL.
