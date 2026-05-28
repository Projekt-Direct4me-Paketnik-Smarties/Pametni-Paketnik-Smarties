**API Usage & Mobile Login**

This document explains how to use the backend auth API from a mobile app (React Native / native), including example requests, token handling, and refresh/logout flows.

**API Endpoints**
- **POST /auth/register** — create a new user
  - Body JSON: `{ "username": "marko", "email": "marko@example.com", "password": "secret" }`
  - Success: 201 + `{ message, user }` (user contains id, username, email)

- **POST /auth/login** — authenticate and receive tokens
  - Body JSON: `{ "username": "marko", "password": "secret" }` or `{ "email": "marko@example.com", "password": "secret" }`
  - Success: 200 + `{ message, accessToken, refreshToken, user }`

- **GET /auth/test** — protected test route (requires Authorization header)
  - Header: `Authorization: Bearer <accessToken>`
  - Success: 200 + `{ ok: true, user }`

- **POST /auth/refresh** — exchange `refreshToken` for a new `accessToken`
  - Body JSON: `{ "refreshToken": "<refreshToken>" }`
  - Success: 200 + `{ accessToken }`

- **POST /auth/logout** — revoke the provided refresh token
  - Body JSON: `{ "refreshToken": "<refreshToken>" }`
  - Success: 200 + `{ message: 'Logged out' }`

**Auth design summary**
- The backend issues a short-lived JWT `accessToken` and a long-lived `refreshToken` on login.
- The `accessToken` is sent in `Authorization: Bearer <accessToken>` for protected requests.
- Only the hash of `refreshToken` is stored in the database; the raw refresh token is returned to the client once on login.

**Example curl requests**

- Login (get tokens):
```bash
curl -X POST http://<SERVER_IP>:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"marko","password":"123456"}'
```

- Call protected route with access token:
```bash
curl -H "Authorization: Bearer $ACCESS_TOKEN" http://<SERVER_IP>:5000/auth/test
```

- Refresh access token:
```bash
curl -X POST http://<SERVER_IP>:5000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"<REFRESH_TOKEN>"}'
```

**React Native / JS examples**

- Login and store tokens (using `expo-secure-store` or similar):
```javascript
import * as SecureStore from 'expo-secure-store';

async function login(username, password) {
  const res = await fetch('http://192.168.x.x:5000/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  const data = await res.json();
  // store securely
  await SecureStore.setItemAsync('accessToken', data.accessToken);
  await SecureStore.setItemAsync('refreshToken', data.refreshToken);
  return data.user;
}
```

- Use access token on requests:
```javascript
async function apiGet(path) {
  const token = await SecureStore.getItemAsync('accessToken');
  const res = await fetch(`http://192.168.x.x:5000${path}`, {
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
  });
  if (res.status === 401) {
    // try refresh flow
    const refreshed = await refreshAccessToken();
    if (refreshed) return apiGet(path);
  }
  return res.json();
}

async function refreshAccessToken() {
  const refreshToken = await SecureStore.getItemAsync('refreshToken');
  if (!refreshToken) return false;
  const res = await fetch('http://192.168.x.x:5000/auth/refresh', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken })
  });
  if (res.ok) {
    const { accessToken } = await res.json();
    await SecureStore.setItemAsync('accessToken', accessToken);
    return true;
  }
  // refresh failed: clear tokens and force login
  await SecureStore.deleteItemAsync('accessToken');
  await SecureStore.deleteItemAsync('refreshToken');
  return false;
}
```

**Storing tokens on device**
- Use secure device storage: Keychain (iOS), EncryptedSharedPreferences (Android), or `expo-secure-store`.
- Do not store tokens in AsyncStorage or plain text for production.

**Environment variables (backend)**
- `JWT_SECRET` — a strong secret used to sign JWTs.
- `JWT_EXP` — access token expiry (default: `1h`).
- `REFRESH_TTL_DAYS` — refresh token TTL in days (default: 30).

**Testing tips**
- From a phone on the same LAN use your PC's LAN IP (e.g. `http://192.168.1.42:5000`).
- For quick debug you can call `GET /auth/test` with the `Authorization` header.
- Check server logs for `Login` and `Refresh` activity.

**Security notes**
- Use HTTPS in production. Local testing may use HTTP over LAN.
- Keep `JWT_SECRET` out of source control.
- Rotate and revoke refresh tokens when the user logs out or if a device is lost.

**Files of interest**
- `controllers/authController.js` — issues tokens and implements refresh/logout.
- `middleware/tokenAuth.js` — verifies JWT and sets `req.user`.
- `models/refreshTokenModel.js` — stores hashed refresh tokens.

---
If you want, I can also add a short `frontend/` snippet in your phone app repository with a complete login component wired to this flow.
