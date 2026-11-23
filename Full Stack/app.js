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

/*  session banner  */
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

/*  login  */
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

/*  register  */
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

/*  homepage  */
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
  document.getElementById('grid').innerHTML = items.map(p => `
    <div class="product" data-id="${esc(p._id || p.name)}" data-name="${esc(p.name)}" data-price="${p.price}" data-brand="${esc(p.brand)}" data-vram="${p.vram}">
      <img src="${esc(p.image)}" alt="Graphics card">
      <h3>${esc(p.name)}</h3>
      <p>$${Number(p.price).toFixed(2)}</p>
      <button class="add-btn">Add to Cart</button>
    </div>`).join('');
  document.getElementById('noResults').style.display = items.length ? 'none' : 'block';
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

/*  cart (NEW) 
   The cart is saved in this browser only. It is not sent to
   the server or the database yet; a real per-user cart is a later milestone. */
const CART_KEY = 'gs_cart';

function loadCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
  catch { return []; }
}

function saveCart(cart) {
  try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch { /* storage blocked */ }
}

function updateCartBadge() {
  let badge = document.getElementById('cartBadge');
  if (!badge) {
    badge = document.createElement('div');
    badge.id = 'cartBadge';
    document.body.appendChild(badge);
  }
  const count = loadCart().reduce((total, item) => total + item.qty, 0);
  badge.textContent = 'Cart (' + count + ')';
}

function addToCart(card) {
  const cart = loadCart();
  const id = card.dataset.id;
  const existing = cart.find(item => item.id === id);

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id, name: card.dataset.name, price: Number(card.dataset.price), qty: 1 });
  }

  saveCart(cart);
  updateCartBadge();
}

if (document.getElementById('grid')) {
  document.getElementById('filterContent').addEventListener('click', e => e.stopPropagation());

  // One listener on the grid covers every button, even after the cards are re-drawn.
  document.getElementById('grid').addEventListener('click', e => {
    const btn = e.target.closest('.add-btn');
    if (!btn) return;

    addToCart(btn.closest('.product'));

    btn.textContent = 'Added!';
    btn.disabled = true;
    setTimeout(() => { btn.textContent = 'Add to Cart'; btn.disabled = false; }, 1000);
  });

  updateCartBadge();
  loadProducts();
}

initSession();
