# Models

Defines what gets stored in MongoDB.

- `User.js` - accounts: email, hashed password, verified status
- `Session.js` - logged-in sessions (stored as hashes, auto-deleted when expired)
- `Product.js` - graphics cards; adds 3 starter cards if the collection is empty

**Needs:** `mongoose` and a running MongoDB.
