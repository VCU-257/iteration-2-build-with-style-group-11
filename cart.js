const CART_STORAGE_KEY = "cart";

function formatMoney(amount) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(amount);
}

function loadCart() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    return parsed
      .filter((x) => x && typeof x.id === "string")
      .map((x) => ({
        id: x.id,
        name: String(x.name ?? "Item"),
        price: Number(x.price ?? 0),
        qty: Math.max(1, Number(x.qty ?? 1)),
        image: String(x.image ?? ""),
        alt: String(x.alt ?? x.name ?? "Item"),
      }));
  } catch {
    return null;
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
}

function seedCartIfEmpty() {
  const existing = loadCart();
  if (existing && existing.length) return existing;
  const seed = [
    {
      id: "gpu",
      name: "Graphics Card",
      price: 300,
      qty: 1,
      image: "https://placehold.co/64x64?text=GPU",
      alt: "Graphics Card",
    },
    {
      id: "cpu",
      name: "CPU",
      price: 200,
      qty: 1,
      image: "https://placehold.co/64x64?text=CPU",
      alt: "CPU",
    },
  ];
  saveCart(seed);
  return seed;
}

function cartTotal(cart) {
  return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

function showAlert(message, variant = "success") {
  const host = document.getElementById("cartAlertHost");
  if (!host) return;

  const el = document.createElement("div");
  el.className = `alert alert-${variant} alert-dismissible fade show`;
  el.setAttribute("role", "alert");
  el.innerHTML = `
    <div class="d-flex gap-2 align-items-start">
      <i class="bi ${variant === "danger" ? "bi-exclamation-triangle" : "bi-check-circle"} mt-1"></i>
      <div>${message}</div>
    </div>
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  `;

  host.innerHTML = "";
  host.appendChild(el);
}

function renderEmptyState(tbody) {
  tbody.innerHTML = `
    <tr>
      <td colspan="3" class="text-center py-5">
        <div class="text-muted mb-2"><i class="bi bi-bag-x fs-2"></i></div>
        <div class="fw-semibold">Your cart is empty</div>
        <div class="text-muted small">Add items from the catalog to see them here.</div>
      </td>
    </tr>
  `;
}

function renderCart(cart) {
  const tbody = document.getElementById("cartTbody");
  const totalEl = document.getElementById("cartTotal");
  const checkoutBtn = document.getElementById("checkoutBtn");
  const clearCartBtn = document.getElementById("clearCartBtn");

  if (!tbody || !totalEl || !checkoutBtn || !clearCartBtn) return;

  if (!cart.length) {
    renderEmptyState(tbody);
    totalEl.textContent = formatMoney(0);
    checkoutBtn.classList.remove("disabled");
    checkoutBtn.removeAttribute("aria-disabled");
    checkoutBtn.tabIndex = 0;
    clearCartBtn.disabled = true;
    return;
  }

  clearCartBtn.disabled = false;

  tbody.innerHTML = cart
    .map((item) => {
      const safeName = item.name.replaceAll('"', "&quot;");
      const safeAlt = item.alt.replaceAll('"', "&quot;");
      return `
        <tr data-id="${item.id}">
          <td>
            <div class="d-flex align-items-center gap-2">
              <img
                src="${item.image}"
                width="40"
                height="40"
                class="rounded"
                alt="${safeAlt}"
                loading="lazy"
              >
              <div class="lh-sm">
                <div class="fw-semibold">${safeName}</div>
                <div class="text-muted small">ID: ${item.id}</div>
              </div>
            </div>
          </td>
          <td>${formatMoney(item.price)}</td>
          <td>
            <div class="cart-qty-pill" role="group" aria-label="Quantity">
              <button class="cart-qty-pill-btn" type="button" data-action="trash" aria-label="Decrease quantity or remove item">
                <i class="bi bi-trash" aria-hidden="true"></i>
              </button>
              <span class="cart-qty-value">${item.qty}</span>
              <button class="cart-qty-pill-btn" type="button" data-action="inc" aria-label="Increase quantity">
                <span class="cart-qty-plus" aria-hidden="true">+</span>
              </button>
            </div>
          </td>
        </tr>
      `;
    })
    .join("");

  totalEl.textContent = formatMoney(cartTotal(cart));
}

function getRowId(target) {
  const tr = target.closest("tr[data-id]");
  return tr?.getAttribute("data-id") ?? null;
}

function updateCartItem(cart, id, updater) {
  const idx = cart.findIndex((x) => x.id === id);
  if (idx === -1) return cart;
  const next = [...cart];
  next[idx] = updater({ ...next[idx] });
  next[idx].qty = Math.max(1, Number(next[idx].qty || 1));
  return next;
}

function removeCartItem(cart, id) {
  return cart.filter((x) => x.id !== id);
}

function attachCartHandlers() {
  const tbody = document.getElementById("cartTbody");
  const clearCartBtn = document.getElementById("clearCartBtn");
  const removeItemName = document.getElementById("removeItemName");
  const confirmRemoveBtn = document.getElementById("confirmRemoveBtn");
  const removeModalEl = document.getElementById("removeConfirmModal");
  if (!tbody || !clearCartBtn || !confirmRemoveBtn || !removeModalEl || !removeItemName) return;

  const removeModal = new bootstrap.Modal(removeModalEl);
  let pendingRemoveId = null;

  tbody.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;
    const action = btn.getAttribute("data-action");
    const id = getRowId(btn);
    if (!id) return;

    let cart = loadCart() ?? [];
    const item = cart.find((x) => x.id === id);
    if (!item) return;

    if (action === "remove") {
      pendingRemoveId = id;
      removeItemName.textContent = item.name;
      removeModal.show();
      return;
    }

    if (action === "trash") {
      if (item.qty > 1) {
        cart = updateCartItem(cart, id, (x) => {
          x.qty = x.qty - 1;
          return x;
        });
        saveCart(cart);
        renderCart(cart);
      } else {
        pendingRemoveId = id;
        removeItemName.textContent = item.name;
        removeModal.show();
      }
      return;
    }

    if (action === "inc") {
      cart = updateCartItem(cart, id, (x) => {
        x.qty = x.qty + 1;
        return x;
      });
      saveCart(cart);
      renderCart(cart);
    }
  });

  confirmRemoveBtn.addEventListener("click", () => {
    if (!pendingRemoveId) return;
    let cart = loadCart() ?? [];
    const removed = cart.find((x) => x.id === pendingRemoveId);
    cart = removeCartItem(cart, pendingRemoveId);
    saveCart(cart);
    renderCart(cart);
    removeModal.hide();
    pendingRemoveId = null;
    if (removed) showAlert(`Removed <span class="fw-semibold">${removed.name}</span> from your cart.`, "danger");
  });

  clearCartBtn.addEventListener("click", () => {
    saveCart([]);
    renderCart([]);
    showAlert("Your cart has been cleared.", "danger");
  });
}

function initCart() {
  const cart = seedCartIfEmpty();
  renderCart(cart);
  attachCartHandlers();
}

document.addEventListener("DOMContentLoaded", initCart);

