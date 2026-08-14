// ==========================================
// FRESH CHICKEN - APP.JS
// ==========================================

// ---------- SUPABASE ----------
const SUPABASE_URL = 'https://xwzcbxrmfydrjvzrpjye.supabase.co/rest/v1/';
const SUPABASE_KEY = 'sb_publishable_R8MQCTKcU0vlgh5qaC1KIg_JkKgQxQ_';

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);


// ---------- PRODUCTS ----------
const products = [
  {
    id: 'sausage',
    name: 'Sausage',
    cat: 'Extras',
    emoji: '🌭',
    options: [['1 pack', 20]]
  },
  {
    id: 'gizzard',
    name: 'Gizzard',
    cat: 'Extras',
    emoji: '🍗',
    options: [['1 pack', 40]]
  },
  {
    id: 'thighs',
    name: 'Chicken Thighs',
    cat: 'Chicken',
    emoji: '🍗',
    options: [
      ['Small', 30],
      ['Medium', 40],
      ['Large', 50],
      ['X-Large', 60]
    ]
  },
  {
    id: 'drumsticks',
    name: 'Chicken Drumsticks',
    cat: 'Chicken',
    emoji: '🍗',
    options: [
      ['5 pcs', 45],
      ['7 pcs', 60],
      ['10 pcs', 90],
      ['12 pcs', 100],
      ['15 pcs', 130],
      ['20 pcs', 160]
    ]
  },
  {
    id: 'back',
    name: 'Chicken Back',
    cat: 'Chicken',
    emoji: '🦴',
    options: [
      ['4 pcs', 20],
      ['6 pcs', 30],
      ['8 pcs', 40],
      ['10 pcs', 50]
    ]
  },
  {
    id: 'tilapia',
    name: 'Fresh Tilapia',
    cat: 'Fish',
    emoji: '🐟',
    options: [
      ['2 pcs', 50],
      ['3 pcs', 60]
    ]
  },
  {
    id: 'breast',
    name: 'Chicken Breast',
    cat: 'Chicken',
    emoji: '🍗',
    options: [
      ['3 pcs', 60]
    ]
  }
];


// ---------- FIXED FRESH BOXES ----------
const fixedBoxes = [
  {
    id: 'classic',
    name: 'Classic Combo',
    items: [
      '1 pack sausage',
      '3 pcs chicken breast',
      '2 pcs tilapia',
      '5 pcs chicken back',
      '5 pcs drumsticks'
    ],
    price: 170
  },
  {
    id: 'deluxe',
    name: 'Deluxe Combo',
    items: [
      'Classic Combo',
      '1 pack gizzard'
    ],
    price: 210
  }
];


// ---------- HELPERS ----------
let cart = JSON.parse(
  localStorage.getItem('fc_cart') || '[]'
);

const $ = (selector) => document.querySelector(selector);

const money = (amount) =>
  `GH₵${Number(amount).toFixed(0)}`;


function save() {
  localStorage.setItem(
    'fc_cart',
    JSON.stringify(cart)
  );

  renderCart();
}


function add(item) {
  const existing = cart.find(
    (i) => i.key === item.key
  );

  if (existing) {
    existing.qty++;
  } else {
    cart.push({
      ...item,
      qty: 1
    });
  }

  save();

  // IMPORTANT:
  // Do not open the cart automatically.
}

// ---------- PRODUCTS ----------
function renderProducts(category = 'all') {
  const root = $('#products');

  root.innerHTML = products
    .filter(
      (product) =>
        category === 'all' ||
        product.cat === category
    )
    .map(
      (product) => `
        <article class="card">

          <difunction add(v class="product-img">
  ${product.emoji}
</div>

          <h3>${product.name}</h3>

          <div class="cat">
            ${product.cat}
          </div>

          <select data-prod="${product.id}">
            ${product.options
              .map(
                (option, index) =>
                  `<option value="${index}">
                    ${option[0]} — ${money(option[1])}
                  </option>`
              )
              .join('')}
          </select>

          <div class="price-row">
            <span
              class="price"
              data-price="${product.id}"
            >
              ${money(product.options[0][1])}
            </span>
          </div>

          <button
            class="btn primary add-product"
            data-id="${product.id}"
          >
            Add to cart
          </button>

        </article>
      `
    )
    .join('');


  // Change price when option changes
  root
    .querySelectorAll('select')
    .forEach((select) => {
      select.onchange = () => {
        const product = products.find(
          (p) => p.id === select.dataset.prod
        );

        const option =
          product.options[select.value];

        select
          .closest('.card')
          .querySelector('.price')
          .textContent = money(option[1]);
      };
    });


  // Add product to cart
  root
    .querySelectorAll('.add-product')
    .forEach((button) => {
      button.onclick = () => {
        const product = products.find(
          (p) => p.id === button.dataset.id
        );

        const select =
          button
            .closest('.card')
            .querySelector('select');

        const option =
          product.options[select.value];

        add({
          key: `${product.id}-${option[0]}`,
          name: product.name,
          option: option[0],
          price: option[1]
        });
      };
    });
}


// ---------- CUSTOM FRESH BOX ----------
function renderBuilder() {
  const root = $('#builderItems');

  root.innerHTML = products
    .map(
      (product) => `
        <div class="builder-item">

          <div>
            <b>${product.name}</b>
            <div class="cat">
              Choose an option
            </div>
          </div>

          <select data-builder="${product.id}">

            ${product.options
              .map(
                (option, index) =>
                  `<option value="${index}">
                    ${option[0]} — ${money(option[1])}
                  </option>`
              )
              .join('')}

            <option value="-1">
              Don't add
            </option>

          </select>

        </div>
      `
    )
    .join('');


  root
    .querySelectorAll('select')
    .forEach(
      (select) => {
        select.onchange = updateBox;
      }
    );

  updateBox();
}


function boxItems() {
  return [
    ...document.querySelectorAll(
      '[data-builder]'
    )
  ]
    .filter(
      (select) =>
        select.value !== '-1'
    )
    .map((select) => {
      const product =
        products.find(
          (p) =>
            p.id ===
            select.dataset.builder
        );

      const option =
        product.options[select.value];

      return {
        name: product.name,
        option: option[0],
        price: option[1]
      };
    });
}


function updateBox() {
  const items = boxItems();

  const original = items.reduce(
    (total, item) =>
      total + item.price,
    0
  );

  const discount =
    original > 0 ? 10 : 0;

  const total =
    Math.max(
      0,
      original - discount
    );

  $('#boxOriginal').textContent =
    money(original);

  $('#boxDiscount').textContent =
    `- ${money(discount)}`;

  $('#boxTotal').textContent =
    money(total);

  window._box = {
    items,
    original,
    discount,
    total
  };
}


// ---------- FIXED BOXES ----------
function renderFixedBoxes() {
  $('#fixedBoxes').innerHTML =
    fixedBoxes
      .map(
        (box) => `
          <article class="card">

            <div class="product-img">
              📦
            </div>

            <span class="eyebrow">
              FRESH BOX
            </span>

            <h3>
              ${box.name}
            </h3>

            <ul>
              ${box.items
                .map(
                  (item) =>
                    `<li>${item}</li>`
                )
                .join('')}
            </ul>

            <div class="price-row">

              <span class="price">
                ${money(box.price)}
              </span>

              <button
                class="btn primary add-fixed"
                data-id="${box.id}"
              >
                Add box
              </button>

            </div>

          </article>
        `
      )
      .join('');


  $('#fixedBoxes')
    .querySelectorAll('.add-fixed')
    .forEach((button) => {

      button.onclick = () => {

        const box =
          fixedBoxes.find(
            (b) =>
              b.id ===
              button.dataset.id
          );

        add({
          key: box.id,
          name: box.name,
          option: 'Fixed Combo',
          price: box.price
        });
      };

    });
}


// ---------- CART ----------
function renderCart() {
  const root = $('#cartItems');

  const itemCount =
    cart.reduce(
      (total, item) =>
        total + item.qty,
      0
    );

  const total =
    cart.reduce(
      (sum, item) =>
        sum +
        item.price * item.qty,
      0
    );

  $('#cartCount').textContent =
    itemCount;

  $('#cartTotal').textContent =
    money(total);

  root.className =
    'drawer-body';


  if (!cart.length) {

    root.innerHTML = `
      <div
        style="
          padding:30px;
          text-align:center;
          color:#746c68
        "
      >
        Your cart is empty 🛒
      </div>
    `;

    return;
  }


  root.innerHTML =
    cart
      .map(
        (item, index) => `
          <div class="cart-row">

            <div>

              <b>
                ${item.name}
              </b>

              <div class="cat">
                ${item.option}
              </div>

              <div class="price">
                ${money(
                  item.price *
                  item.qty
                )}
              </div>

            </div>

            <div class="qty">

              <button
                data-dec="${index}"
              >
                −
              </button>

              <b>
                ${item.qty}
              </b>

              <button
                data-inc="${index}"
              >
                +
              </button>

              <button
                data-del="${index}"
              >
                ×
              </button>

            </div>

          </div>
        `
      )
      .join('');


  // Increase quantity
  root
    .querySelectorAll('[data-inc]')
    .forEach((button) => {

      button.onclick = () => {

        const index =
          Number(
            button.dataset.inc
          );

        cart[index].qty++;

        save();
      };

    });


  // Decrease quantity
  root
    .querySelectorAll('[data-dec]')
    .forEach((button) => {

      button.onclick = () => {

        const index =
          Number(
            button.dataset.dec
          );

        cart[index].qty--;

        if (
          cart[index].qty <= 0
        ) {
          cart.splice(index, 1);
        }

        save();
      };

    });


  // Delete item
  root
    .querySelectorAll('[data-del]')
    .forEach((button) => {

      button.onclick = () => {

        const index =
          Number(
            button.dataset.del
          );

        cart.splice(index, 1);

        save();
      };

    });
}


// ---------- CART OPEN/CLOSE ----------
function openCart() {
  $('#cartPanel')
    .classList
    .add('open');

  $('#backdrop')
    .classList
    .add('show');
}


function closeCart() {
  $('#cartPanel')
    .classList
    .remove('open');

  $('#backdrop')
    .classList
    .remove('show');
}


// ---------- CHECKOUT ----------
function openCheckout() {

  if (!cart.length) {
    alert(
      'Add something to your cart first.'
    );

    return;
  }

  closeCart();

  const subtotal =
    cart.reduce(
      (sum, item) =>
        sum +
        item.price *
        item.qty,
      0
    );

  $('#checkoutTotal').textContent =
    money(subtotal + 5);

  $('#checkoutModal')
    .classList
    .add('show');
}


function updateDelivery() {

  const selected =
    document.querySelector(
      'input[name="delivery"]:checked'
    );

  if (!selected) return;

  const scheduled =
    selected.value ===
    'scheduled';

  $('#scheduleFields')
    .classList
    .toggle(
      'hidden',
      !scheduled
    );


  if (scheduled) {

    document.querySelector(
      'input[name="payment"][value="after"]'
    ).checked = true;

    $('#paymentNote').innerHTML =
      `
        Scheduled delivery orders are
        placed first and paid after placing
        the order.

        MTN MoMo:
        <b>0547864825</b>
        — Faith Kwasi Nyarko
      `;

  } else {

    $('#paymentNote').innerHTML =
      `
        MTN MoMo:
        <b>0547864825</b>
        — Faith Kwasi Nyarko
      `;
  }
}


// ---------- SAVE ORDER TO SUPABASE ----------
async function saveOrderToSupabase(order) {

  try {

    const { data, error } =
      await supabaseClient
        .from('Orders')
        .insert([
          {
            id: order.id,
            name: order.name,
            phone: order.phone,
            location: order.location,
            landmark: order.landmark,
            delivery: order.delivery,
            date: order.date,
            time: order.time,
            payment: order.payment,
            total: order.total,
            items: order.items,
            created_at: order.createdAt
          }
        ])
        .select();

    if (error) {
      console.error(
        'Supabase order error:',
        error
      );

      return false;
    }

    console.log(
      'Order saved to Supabase:',
      data
    );

    return true;

  } catch (error) {

    console.error(
      'Supabase connection error:',
      error
    );

    return false;
  }
}


// ---------- CHECKOUT SUBMIT ----------
$('#checkoutForm').onsubmit =
  async (event) => {

    event.preventDefault();


    const deliveryChoice =
      document.querySelector(
        'input[name="delivery"]:checked'
      );

    const paymentChoice =
      document.querySelector(
        'input[name="payment"]:checked'
      );


    const scheduled =
      deliveryChoice.value ===
      'scheduled';

    const payment =
      paymentChoice.value;


    // Calculate total
    const subtotal =
      cart.reduce(
        (sum, item) =>
          sum +
          item.price *
          item.qty,
        0
      );

    const deliveryFee = 5;

    const total =
      subtotal +
      deliveryFee;


    // Generate order number
    const sequence =
      Number(
        localStorage.getItem(
          'fc_order_seq'
        ) || 0
      ) + 1;

    const id =
      'FC-' +
      String(sequence)
        .padStart(5, '0');


    localStorage.setItem(
      'fc_order_seq',
      sequence
    );


    // Build order
    const order = {

      id,

      name:
        $('#name').value.trim(),

      phone:
        $('#phone').value.trim(),

      location:
        $('#location').value,

      landmark:
        $('#landmark').value.trim(),

      delivery:
        scheduled
          ? 'scheduled'
          : 'same-day',

      date:
        scheduled
          ? $('#date').value
          : null,

      time:
        scheduled
          ? $('#time').value
          : null,

      payment:
        scheduled
          ? 'after'
          : payment,

      total,

      items: cart,

      createdAt:
        new Date().toISOString()
    };


    // Save locally too
    localStorage.setItem(
      'fc_last_order',
      JSON.stringify(order)
    );


    // Save to Supabase
   // Start delivery animation
const orderButton =
  document.querySelector('.order-button');

if (orderButton) {
  orderButton.classList.add('is-animating');
  orderButton.disabled = true;
}


// Save to Supabase
const saved =
  await saveOrderToSupabase(
    order
  );


// Small pause so the animation can finish
await new Promise(
  (resolve) =>
    setTimeout(resolve, 3500)
);


// Reset button
if (orderButton) {
  orderButton.classList.remove(
    'is-animating'
  );

  orderButton.disabled = false;
}


    // Clear cart
    cart = [];

    save();


    // Close checkout
    $('#checkoutModal')
      .classList
      .remove('show');


    // Success message
    $('#successTitle')
      .textContent =
      `Order ${id}`;


    if (scheduled) {

      $('#successText')
        .textContent =
        `Your scheduled order is placed for ${order.date} at ${order.time}. Payment is due after placing the order.`;

    } else {

      $('#successText')
        .textContent =
        `Your order has been received for same-day delivery. Total: ${money(total)}.`;
    }


    // WhatsApp message
    const message =
      `Fresh Chicken Order ${id}
Name: ${order.name}
Phone: ${order.phone}
Location: ${order.location}
Landmark: ${order.landmark}
Delivery: ${order.delivery}${scheduled ? ` ${order.date} ${order.time}` : ''}
Total: ${money(total)}
Payment: ${order.payment}`;


    const whatsappURL =
      `https://wa.me/233552509943?text=${encodeURIComponent(message)}`;


    $('#waLink').href =
      whatsappURL;


    // Show success modal
    $('#successModal')
      .classList
      .add('show');


    // Tell us if Supabase failed
    if (!saved) {

      console.warn(
        'Order was completed on the website, but Supabase did not save it.'
      );

    }
  };


// ---------- BUTTONS ----------
document
  .querySelectorAll('.filter')
  .forEach((button) => {

    button.onclick = () => {

      document
        .querySelectorAll('.filter')
        .forEach(
          (item) =>
            item.classList
              .remove('active')
        );

      button.classList.add(
        'active'
      );

      renderProducts(
        button.dataset.cat
      );
    };
  });


$('#cartBtn').onclick =
  openCart;

$('#closeCart').onclick =
  closeCart;

$('#backdrop').onclick =
  closeCart;

$('#checkoutBtn').onclick =
  openCheckout;

$('#closeCheckout').onclick =
  () =>
    $('#checkoutModal')
      .classList
      .remove('show');

$('#doneBtn').onclick =
  () =>
    $('#successModal')
      .classList
      .remove('show');


document
  .querySelectorAll(
    'input[name="delivery"]'
  )
  .forEach(
    (radio) =>
      radio.onchange =
        updateDelivery
  );


// ---------- ADD CUSTOM BOX ----------
$('#addBox').onclick = () => {

  const box =
    window._box;

  if (
    !box ||
    !box.items.length
  ) {

    alert(
      'Select at least one product.'
    );

    return;
  }


  add({

    key:
      'custom-' +
      Date.now(),

    name:
      'Custom Fresh Box',

    option:
      `${box.items.length} selected items`,

    price:
      box.total
  });
};


// ---------- ACCOUNT BUTTON ----------
$('#accountBtn').onclick = () => {

  alert(
    'Customer accounts are coming soon.'
  );

};


// ---------- INITIAL LOAD ----------
renderProducts();

renderBuilder();

renderFixedBoxes();

renderCart();


// ---------- SERVICE WORKER ----------
if (
  'serviceWorker' in navigator
) {

  window.addEventListener(
    'load',
    () => {

      navigator.serviceWorker
        .register('./sw.js')
        .then(() => {
          console.log(
            'Fresh Chicken service worker registered.'
          );
        })
        .catch((error) => {
          console.error(
            'Service worker registration failed:',
            error
          );
        });

    }
  );
}