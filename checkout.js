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
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((x) => x && typeof x.id === "string")
      .map((x) => ({
        id: x.id,
        name: String(x.name ?? "Item"),
        price: Number(x.price ?? 0),
        qty: Math.max(1, Number(x.qty ?? 1)),
      }));
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
}

function cartItemsTotal(cart) {
  return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

function showCheckoutAlert(message, variant = "warning") {
  const host = document.getElementById("checkoutAlertHost");
  if (!host) return;

  const el = document.createElement("div");
  el.className = `alert alert-${variant} alert-dismissible fade show mb-0`;
  el.setAttribute("role", "alert");
  el.innerHTML = `
    <div class="d-flex gap-2 align-items-start">
      <i class="bi ${variant === "danger" ? "bi-exclamation-triangle" : "bi-info-circle"} mt-1"></i>
      <div>${message}</div>
    </div>
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  `;

  host.innerHTML = "";
  host.appendChild(el);
}

function renderSummary() {
  const cart = loadCart();
  const itemsTotal = cartItemsTotal(cart);
  const shipping = 0;
  const total = itemsTotal + shipping;

  const summaryItems = document.getElementById("summaryItems");
  const summaryShipping = document.getElementById("summaryShipping");
  const summaryTotal = document.getElementById("summaryTotal");
  const placeOrderBtn = document.getElementById("placeOrderBtn");

  if (summaryItems) summaryItems.textContent = formatMoney(itemsTotal);
  if (summaryShipping) summaryShipping.textContent = formatMoney(shipping);
  if (summaryTotal) summaryTotal.textContent = formatMoney(total);

  if (placeOrderBtn) {
    placeOrderBtn.disabled = cart.length === 0;
  }

  if (!cart.length) {
    showCheckoutAlert(
      `Your cart is empty. <a href="Cart.html" class="alert-link">Go back to cart</a> to add items.`,
      "warning"
    );
  }
}

function attachCheckoutHandlers() {
  const form = document.getElementById("checkoutForm");
  const placeOrderBtn = document.getElementById("placeOrderBtn");
  const modalEl = document.getElementById("orderPlacedModal");
  if (!form || !placeOrderBtn || !modalEl) return;

  const modal = new bootstrap.Modal(modalEl);

  function validate() {
    form.classList.add("was-validated");
    return form.checkValidity();
  }

  placeOrderBtn.addEventListener("click", () => {
    const cart = loadCart();
    if (!cart.length) {
      showCheckoutAlert(
        `Your cart is empty. <a href="Cart.html" class="alert-link">Go back to cart</a>.`,
        "warning"
      );
      return;
    }

    if (!validate()) {
      showCheckoutAlert("Please fix the highlighted fields before placing your order.", "danger");
      return;
    }

    saveCart([]);
    renderSummary();
    modal.show();
  });

  form.addEventListener("input", () => {
    if (form.classList.contains("was-validated")) {
      form.checkValidity();
    }
  });
}

function initCheckout() {
  renderSummary();
  attachCheckoutHandlers();
}

document.addEventListener("DOMContentLoaded", initCheckout);

