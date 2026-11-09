# FRONT-END

**E-commerce website overview** 

Graphic scouts front-end is built with HTML, CSS, JavaScript. For now the project will be hosted on GitHub Pages then moved to nginx. 

All vendors and products are sample data, backend has not been connected as of yet. 

Milestone 1: Home, login, and register pages 

**File map** 

| File | What it does |
|---|---|
|home page.html|Holds the store logic|
|style.css|stylization of the home page|
|login.html|Sign-in form|
|register.html|Creating account|
|auth.css|Style for the login/register page|
|auth.js|Behavior share by login and register page|  

---

**Basic rundown**

Currently the page is filled with sample data. The comparison table and the price cards start empty (productGrid, comparisonTable, priceMatchGrid) and then the script fills in them in.

The user does something --> the code changes state, then calls the matching function. 

You can compare up to 3 products, with the next selection of product dropping the oldest option. 

*Verbose explanation*

The script run down is: 

1. catalog: a list of 5 sample products. Each has a name, brand, category, rating, specs and a list of vendors (store, price, shipping, stock).
2. state: one object that holds everything that changes: search text, category, sort, max price, the products picked to compare (starts as [1, 2, 3]) and the cart.
3. appConfig, safeFetchJSON, productApi: a placeholder for the future backend. While useMockData is true, getProducts() returns the local catalog. Set it to false and it asks the backend at /api/products instead.
4. Helpers: formatPrice formats dollars. escapeHTML makes text safe to put in the page. getBestVendor finds the cheapest store. getBestPrice gives that store's price. It is the one place the price comes from, so cards, filters, sorting and the cart always agree.
5. Render functions, each redraws one part of the page: renderHero (stats and featured card), renderProducts (product cards, after getFilteredProducts applies search, category, price limit and sort), renderComparisonTable (specs side by side), renderPriceMatches (lowest price and each store's price), renderCart (items, count, subtotal).
6. Events: attachFilterEvents updates state and redraws the grid when a filter changes. attachCartEvents opens and closes the cart and runs the demo checkout. The Compare and Add to cart buttons are hooked up after each redraw, because a redraw replaces them.
7. init(): hooks up events, waits for the mock API, then draws everything once.

---
**Style.css** 

The styles follow the order of the page, and the colors are set once at the top.

• Color settings in :root: colors, shadow and animation speed. 
• Order: base layout, top bar, buttons, hero, filters, product cards, comparison table, cart.
• Cart: the padding is on an inner box (.cart-dialog-inner), so only a click on the dark area closes it. 

--- 
**Auth pages** 

The login and register pages are demo forms. So far nothing is sent, saved or checked.

• login.html and register.html use the browser's built-in checks: required fields, a valid email, and a password of at least 10 characters on register.
• auth.js does three things: Show/Hide password buttons, a login submit, and a register submit that checks the two passwords match.
• Both submits call preventDefault() (stop the real submit) and show a "connect a backend" message.
• The password-mismatch message clears when the user edits either password field.
• The forms have no method or action yet, so nothing can be sent until a secure backend exists.

--- 
**AI-usage** 

Tools such as visual studio built-in AI were used to help create some of the code for the front-end

--- 
**Next Steps** 

Connect the Backend
Make the login and register forms call the backend with fetch.
Set up the UFW firewall rules and the VLAN between the three VMs (front end, back end, database).




