# Back End API

Handles accounts (register, login, logout, email verification) and product search. Passwords are hashed, and inputs are checked to block database injection.

## What uses 
- Node.js 
- MongoDB
- Packages: `express`, `mongoose`, `bcrypt` (install with `npm install express mongoose bcrypt`)
- (if it fails use `sudo apt install npm` then try again)
- A `.env` file (copy `.env.example`)

## Settings (`.env`)
- `MONGO_URI` - where MongoDB is
- `HOST` - IP the API listens on (the VM's VLAN IP)
- `PORT` - 3000
- `COOKIE_SECURE` - `true` only with HTTPS
- `REQUIRE_VERIFICATION` - `true` to require a verified email before login

## Run
```bash
npm start
```
Check it with `curl http://<HOST>:3000/api/health`. It should return `{"ok":true,"db":true}`.
