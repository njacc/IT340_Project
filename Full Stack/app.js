const setMsg = (el, text, kind = 'error') => {
    el.textContent = text;
    el.className = text ? kind : '';
};

async function api(path, opts = {}) {
    const res = await fetch('/api' + path, {
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        ...opts
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
}

const esc = s => String(s).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* ---------- session banner ---------- */
async function initSession() {
    const slot = document.getElementById('sessionSlot');
    if (!slot) return;
    try {
        const me = await api('/auth/me');
        slot.innerHTML = `<span>${esc(me.email)}</span> <a href="#" id="logout">Log out</a>`;
        document.getElementById('logout').addEventListener('click', async e => {
            e.preventDefault();
            await api('/auth/logout', { method: 'POST' });
            location.href = 'homepage.html';
        });
    } catch {
        slot.innerHTML = `<a href="login.html">Login</a>`;
    }
}

/* ---------- login ---------- */
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async e => {
        e.preventDefault();
        const msg = document.getElementById('msg');
        setMsg(msg, '');

        const email = document.getElementById('email1').value.trim();
        const password = document.getElementById('password1').value;

        if (!email || !password) { setMsg(msg, 'Please enter your email and password.'); return; }

        try {
            await api('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
            location.href = 'homepage.html';
        } catch (err) { setMsg(msg, err.message); }
    });
}

/* ---------- register ---------- */
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async e => {
        e.preventDefault();
        const msg = document.getElementById('msg');
        setMsg(msg, '');

        const email1 = document.getElementById('email1').value.trim();
        const email2 = document.getElementById('email2').value.trim();
        const password1 = document.getElementById('password1').value;
        const password2 = document.getElementById('password2').value;

        if (email1 !== email2) { setMsg(msg, 'Email addresses dont match'); return; }
        if (password1 !== password2) { setMsg(msg, 'Passwords dont match'); return; }
        if (password1.length < 8) { setMsg(msg, 'Password must be 8+ characters'); return; }

        try {
            await api('/auth/register', { method: 'POST', body: JSON.stringify({ email: email1, password: password1 }) });
            registerForm.reset();
            setMsg(msg, 'Registration complete — check your email to verify.', 'ok');
        } catch (err) { setMsg(msg, err.message); }
    });
}

/* ---------- homepage ---------- */
function toggleFilters() {
    document.getElementById('filterContent').classList.toggle('show');
}

function resetFilters() {
    ['priceFilter', 'brandFilter', 'vramFilter'].forEach(id =>
        document.getElementById(id).value = 'all');
    document.getElementById('sortFilter').value = 'price';
    loadProducts();
}

function applyFilters() {
    loadProducts();
}

function searchProducts(event) {
    event.preventDefault();
    loadProducts();
}

function buildQuery() {
    const p = new URLSearchParams();
    const q = document.getElementById('searchbar').value.trim();
    const price = document.getElementById('priceFilter').value;
    const brand = document.getElementById('brandFilter').value;
    const vram = document.getElementById('vramFilter').value;
    const sort = document.getElementById('sortFilter').value;

    if (q) p.set('q', q);
    if (brand !== 'all') p.set('brand', brand);
    if (vram !== 'all') p.set('vram', vram.replace('GB', ''));
    if (price !== 'all') {
        const [min, max] = price.split('-');
        p.set('min', min);
        p.set('max', max);
    }
    if (sort !== 'price') p.set('sort', sort);
    return p.toString();
}

function renderProducts(items) {
    const grid = document.getElementById('grid');
    grid.innerHTML = '';

    items.forEach(p => {
        const product = document.createElement('div');
        product.className = 'product';

        const img = document.createElement('img');
        img.src = p.image;
        img.alt = 'Graphics card';

        const name = document.createElement('h3');
        name.textContent = p.name;

        const price = document.createElement('p');
        price.textContent = '$' + Number(p.price).toFixed(2);

        const button = document.createElement('button');
        button.textContent = 'Add to Cart';

        button.addEventListener('click', () => {
            addtocart(p.name, Number(p.price));
        });

        product.append(img, name, price, button);
        grid.appendChild(product);
    });

    document.getElementById('noResults').style.display =
        items.length ? 'none' : 'block';
}

async function loadProducts() {
    if (!document.getElementById('grid')) return;
    try {
        const { items } = await api('/products?' + buildQuery());
        renderProducts(items);
    } catch {
        renderProducts([]);
    }
}

if (document.getElementById('grid')) {
    document.getElementById('filterContent').addEventListener('click', e => e.stopPropagation());
    loadProducts();
}

initSession();

/* ---------- cart ---------- */
let cart = [];

try {
    cart = JSON.parse(localStorage.getItem("cart")) || [];
    if (!Array.isArray(cart)) cart = [];
} catch {
    cart = [];
}

function addtocart(name, price) {
    cart.push({
        name: name,
        price: price
    });

    localStorage.setItem("cart", JSON.stringify(cart));
    updateCart();
    alert("Product added to cart");
}

function updateCart() {
    let count = cart.length;
    let cartCount = document.getElementById("cartCount");
    if (cartCount) {
        cartCount.innerText = count;
    }
}

updateCart();