# DREAD Risk Assessment: Secure Online Notes System

The DREAD model is used to rate the severity of the threats identified in the STRIDE model. Each category is scored from 1 (Low) to 10 (High).

| Threat | Damage | Reproducibility | Exploitability | Affected Users | Discoverability | **Total Score** | Risk Level |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **Credential Brute Force** | 9 | 8 | 7 | 10 | 8 | **42** | CRITICAL |
| **JWT Token Theft** | 9 | 5 | 6 | 10 | 5 | **35** | HIGH |
| **XSS via Note Content** | 7 | 9 | 8 | 8 | 9 | **41** | CRITICAL |
| **SQL/NoSQL Injection** | 10 | 4 | 3 | 10 | 4 | **31** | HIGH |
| **Admin Accessing Notes** | 8 | 10 | 2 | 10 | 3 | **33** | HIGH |
| **DoS via Large Payloads** | 6 | 9 | 9 | 10 | 9 | **43** | CRITICAL |

## Risk Definitions

### 1. Credential Brute Force
- **Mitigation:** Implemented `express-rate-limit` and `bcrypt` with high salt rounds to make offline cracking difficult and online guessing slow.

### 2. XSS via Note Content
- **Mitigation:** Implemented strict **Content Security Policy (CSP)** and frontend **HTML escaping** for all user-generated content.

### 3. DoS via Large Payloads
- **Mitigation:** Restricted JSON body size to **10kb** in `server.js` to prevent memory exhaustion.

### 4. Admin Accessing Notes
- **Mitigation:** Implemented **AES-256 encryption** at rest. Admins can manage users but cannot decrypt note content as they lack the user-specific encryption keys in their view.

## Scoring Legend
- **Damage:** How bad is the attack?
- **Reproducibility:** How easy is it to reproduce?
- **Exploitability:** How much work is it to launch the attack?
- **Affected Users:** How many people are impacted?
- **Discoverability:** How easy is it to find the vulnerability?
