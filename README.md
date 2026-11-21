# Weather backend (Node + Express + TiDB)

Stores the app's saved cities and feedback. Same setup as the CSC452
backend lesson.

## Set up

1. In TiDB Cloud, open your cluster in DBeaver and run `schema.sql`.
   It creates two tables: `saved_cities` and `feedback`.
2. `npm install`
3. Copy `.env.example` to `.env` and paste your TiDB connection URL
   (TiDB Connect → Node.js / mysql2).
4. `node index.js`, then open http://localhost:3000 in the browser.
5. Push to GitHub and deploy on Vercel. Add `DATABASE_URL` under
   Environment Variables in Vercel.
6. Put the Vercel URL in the app's `lib/config.dart`.

## API

| Method | Path | Body / query | Does |
|---|---|---|---|
| GET | `/cities?device_id=…` | | A phone's saved cities |
| POST | `/cities` | `{ device_id, name, country, latitude, longitude }` | Save a city, returns it with its `id` |
| DELETE | `/cities` | `{ id, device_id }` | Remove a saved city |
| POST | `/feedback` | `{ device_id, name, rating (1–5), message }` | Save feedback |
| GET | `/feedback` | | Read all feedback (Thunder Client or browser) |

There is no login. The app makes a random `device_id` once and keeps it on
the phone, so each phone only sees its own cities.

Note: `GET /feedback` is open to anyone who knows the URL. That's fine for
the class project, but remove it before a real release.
