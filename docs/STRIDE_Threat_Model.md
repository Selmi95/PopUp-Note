# STRIDE Threat Model: Secure Online Notes System

This document identifies potential security threats to the Secure Online Notes System using the STRIDE methodology.

## 1. Spoofing (Impersonation)
- **Threat:** An attacker impersonates a legitimate user to access their notes.
- **Target:** Authentication System, JWT Tokens.
- **Mitigation:**
    - Strong password hashing using **bcrypt** (12 rounds).
    - Secure JWT implementation with a strong secret and 1-hour expiration.
    - Account lockout/Rate limiting on login attempts to prevent brute-force.
    - **Implementation:** `authController.js`, `server.js` (rate limiter).

## 2. Tampering (Data Manipulation)
- **Threat:** An attacker modifies note content or user roles in transit or at rest.
- **Target:** Database, API Requests.
- **Mitigation:**
    - **AES-256-CBC Encryption** for note content at rest.
    - Input validation and sanitization using `validator.js`.
    - Role-Based Access Control (RBAC) verified on every request.
    - **Implementation:** `encryption.js`, `validation.js`, `auth.js` (middleware).

## 3. Repudiation (Denying Actions)
- **Threat:** A user denies creating or deleting a note, or an admin denies disabling an account.
- **Target:** System Logs, Audit Trail.
- **Mitigation:**
    - Server-side logging of all critical actions (login, note creation, admin actions).
    - Timestamps on all database records (`createdAt`, `updatedAt`).
    - **Implementation:** `server.js`, PostgreSQL tables.

## 4. Information Disclosure (Data Exposure)
- **Threat:** An attacker or an administrator reads private notes.
- **Target:** Database, Admin Interface.
- **Mitigation:**
    - **Data at Rest Encryption:** Notes are encrypted with a unique key per user.
    - **RBAC:** Admins can see metadata (note count) but cannot access the `encryptionKey` or decrypted content.
    - **Helmet.js:** Sets security headers to prevent info leakage via browser.
    - **Implementation:** `encryption.js`, `adminController.js` (projection).

## 5. Denial of Service (Service Disruption)
- **Threat:** An attacker floods the API with requests to crash the server.
- **Target:** Web Server, Database.
- **Mitigation:**
    - **Express-rate-limit:** Limits requests per IP.
    - **Body-parser limits:** Prevents large payload attacks (10kb limit).
    - **Implementation:** `server.js`.

## 6. Elevation of Privilege (Unauthorized Access)
- **Threat:** A regular user accesses admin functions or another user's notes.
- **Target:** API Endpoints, RBAC Middleware.
- **Mitigation:**
    - Strict **RBAC middleware** checking roles on protected routes.
    - Ownership checks: API verifies that the `user_id` in the note matches the authenticated `user_id`.
    - **Implementation:** `auth.js`, `noteController.js`.
