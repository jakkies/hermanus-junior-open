# Hermanus Junior Squash Open 2026

Static tournament site for the Hermanus Junior Squash Open, 4–5 September 2026.

The bundled site uses the official SportyHQ court, schedule and draw URLs. They can be updated under `admin/settings/` when required.

## Preview locally

From the repository root:

```bash
python3 -m http.server 8080
```

Open `http://localhost:8080/`.

## Launch checklist

The site is ready for tournament content, but these event-specific details are placeholders until supplied by the organiser:

- event date and venue in `index.html` and `admin/index.html`;
- canonical/public deployment URL and social preview URL in `index.html`;
- default Court 1–4, schedule and standings URLs in `js/feed-config.js`;
- competing teams in `js/data.js`;

Shared SportyHQ feed URLs are configured in `js/feed-config.js`. An organiser can temporarily override them in one browser at `admin/settings/`.

## Automatic SportyHQ result sync

The local `Sync Hermanus SportyHQ results` scheduled task reads all four official court feeds every five minutes during 4–6 September 2026. It preserves captured finals, replaces stale live rows and commits `js/captured-results.json` to `main` only when scores change. The public schedule checks that snapshot every minute; completed matches also recalculate the round-robin standings automatically.

For a local one-off sync, install the dependency with `npm ci` and run `npm run sync:sportyhq`. Rankings use match wins, game percentage, point percentage, games won, points won and original box position, in that order. Live or incomplete matches are excluded from the standings.

## Pages

- `/` — public event hub
- `/#draws` — SportyHQ-sourced division boxes and playoff paths
- `/#schedule` — SportyHQ-sourced Friday and Saturday order of play
- `/court1/`, `/court2/`, `/court3/` and `/court4/` — dedicated live score views
- `/schedule/` — full schedule
- `/standings/` — tournament standings
- `/admin/` — organiser dashboard
- `/admin/settings/` — browser-local SportyHQ feed configuration
