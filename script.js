
/* ================================
   BAGORA WEBSITE SETTINGS
================================ */

// Your WhatsApp number (country code + number)
const WHATSAPP_NUMBER = "923137925446";

// Admin password
const ADMIN_PASSWORD = "1234";

// Delivery charges
const DELIVERY_CHARGES = 100;

// Local storage key
const STORAGE_KEY = "bagora_products";


/* ================================
   DEFAULT PRODUCTS
================================ */

const defaultProducts = [
    {
        id: 1,
        name: "Elegant Ladies Handbag",
        price: 2500,
        description: "Elegant handbag for everyday style.",
        image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=700&q=80"
    },
    {
        id: 2,
        name: "Classic Shoulder Bag",
        price: 3200,
        description: "Beautiful shoulder bag for every occasion.",
        image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=700&q=80"
    },
    {
        id: 3,
        name: "Fashion Tote Bag",
        price: 2800,
        description: "Stylish and spacious tote bag.",
        image: "https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=700&q=80"
    },
    {
        id: 4,
        name: "Luxury Mini Bag",
        price: 2000,
        description: "A compact bag with a stylish look.",
        image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=700&q=80"
    }
];


/* ================================
   PRODUCT STORAGE
================================ */

function getProducts() {
    let products = localStorage.getItem(STORAGE_KEY);

    if (!products) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultProducts));
        return defaultProducts;
    }

    try {
        return JSON.parse(products) || [];
    } catch (error) {
        return [];
    }
}

function saveProducts(products) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}


/* ================================
   CUSTOMER WEBSITE
================================ */

function displayProducts() {
    const productList = document.getElementById("productList");

    if (!productList) return;

    const products = getProducts();

    productList.innerHTML = "";

    if (products.length === 0) {
        productList.innerHTML =
            '<p class="empty-message">No products available right now.</p>';
        return;
    }

    products.forEach(product => {
        const card = document.createElement("div");
        card.className = "product-card";

        card.innerHTML = `
            <img src="${product.image}" alt="Bag image"
                 onerror="this.src='https://placehold.co/600x600?text=Bagora+Bag'">

            <div class="product-info">
                <h3>${escapeHTML(product.name)}</h3>

                <p>${escapeHTML(product.description || "")}</p>

                <div class="price">
                    Rs. ${Number(product.price).toLocaleString("en-PK")}
                </div>

                <button class="order-btn"
                    onclick="orderProduct(${Number(product.id)})">
                    ORDER NOW
                </button>
            </div>
        `;

        productList.appendChild(card);
    });
}


/* ================================
   WHATSAPP ORDER
================================ */

function orderProduct(productId) {
    const products = getProducts();

    const product = products.find(
        item => Number(item.id) === Number(productId)
    );

    if (!product) {
        alert("Product not found.");
        return;
    }

    const customerName = prompt("Enter your full name:");

    if (!customerName || !customerName.trim()) {
        alert("Please enter your name.");
        return;
    }

    const customerPhone = prompt("Enter your WhatsApp / mobile number:");

    if (!customerPhone || !customerPhone.trim()) {
        alert("Please enter your mobile number.");
        return;
    }

    const quantityInput = prompt("Enter quantity:", "1");

    if (!quantityInput) return;

    const quantity = parseInt(quantityInput);

    if (isNaN(quantity) || quantity < 1) {
        alert("Please enter a valid quantity.");
        return;
    }

    const productTotal = Number(product.price) * quantity;
    const grandTotal = productTotal + DELIVERY_CHARGES;

    const message = `
BAGORA - NEW ORDER

Customer Name: ${customerName}
Customer WhatsApp: ${customerPhone}

Product: ${product.name}
Price: Rs. ${Number(product.price).toLocaleString("en-PK")}
Quantity: ${quantity}

Product Total: Rs. ${productTotal.toLocaleString("en-PK")}
Delivery Charges: Rs. ${DELIVERY_CHARGES}
Grand Total: Rs. ${grandTotal.toLocaleString("en-PK")}

Please confirm my order.
    `.trim();

    const whatsappURL =
        "https://wa.me/" + WHATSAPP_NUMBER +
        "?text=" + encodeURIComponent(message);

    window.open(whatsappURL, "_blank");
}


/* ================================
   ADMIN LOGIN
================================ */

function adminLogin() {
    const password = document.getElementById("adminPassword");
    const message = document.getElementById("loginMessage");

    if (!password || !message) return;

    if (password.value === ADMIN_PASSWORD) {
        document.getElementById("loginBox").style.display = "none";
        document.getElementById("adminDashboard").style.display = "block";

        displayAdminProducts();
    } else {
        message.textContent = "Incorrect password. Please try again.";
        password.value = "";
    }
}

function adminLogout() {
    document.getElementById("adminDashboard").style.display = "none";
    document.getElementById("loginBox").style.display = "block";

    document.getElementById("adminPassword").value = "";
    document.getElementById("loginMessage").textContent = "";
}


/* ================================
   ADMIN - ADD PRODUCT
================================ */

const productForm = document.getElementById("productForm");

if (productForm) {
    productForm.addEventListener("submit", function(event) {
        event.preventDefault();

        const name = document.getElementById("productName").value.trim();
        const price = Number(document.getElementById("productPrice").value);
        const description = document.getElementById("productDescription").value.trim();
        const imageFile = document.getElementById("productImage").files[0];

        if (!name || price <= 0 || !imageFile) {
            alert("Please enter product details and select an image.");
            return;
        }

        // Keep product image size small for browser storage
        if (imageFile.size > 1500000) {
            alert("Image is too large. Please select an image under 1.5 MB.");
            return;
        }

        const reader = new FileReader();

        reader.onload = function() {
            try {
                const products = getProducts();

                const newProduct = {
                    id: Date.now(),
                    name: name,
                    price: price,
                    description: description,
                    image: reader.result
                };

                products.push(newProduct);
                saveProducts(products);

                productForm.reset();

                document.getElementById("uploadMessage").textContent =
                    "Product added successfully!";

                displayAdminProducts();

            } catch (error) {
                alert("Storage is full. Please use a smaller product image.");
            }
        };

        reader.onerror = function() {
            alert("Unable to read image.");
        };

        reader.readAsDataURL(imageFile);
    });
}


/* ================================
   ADMIN - SHOW PRODUCTS
================================ */

function displayAdminProducts() {
    const list = document.getElementById("adminProductList");

    if (!list) return;

    const products = getProducts();

    list.innerHTML = "";

    if (products.length === 0) {
        list.innerHTML =
            '<p class="empty-message">No products have been uploaded.</p>';
        return;
    }

    products.forEach(product => {
        const item = document.createElement("div");
        item.className = "admin-product";

        item.innerHTML = `
            <img src="${product.image}" alt="Product"
                 onerror="this.src='https://placehold.co/100?text=Bag'">

            <div class="admin-product-details">
                <h3>${escapeHTML(product.name)}</h3>
                <p>Rs. ${Number(product.price).toLocaleString("en-PK")}</p>
            </div>

            <button class="delete-btn"
                onclick="deleteProduct(${Number(product.id)})">
                DELETE
            </button>
        `;

        list.appendChild(item);
    });
}


/* ================================
   ADMIN - DELETE PRODUCT
================================ */

function deleteProduct(productId) {
    const confirmDelete = confirm("Are you sure you want to delete this product?");

    if (!confirmDelete) return;

    const products = getProducts().filter(
        product => Number(product.id) !== Number(productId)
    );

    saveProducts(products);
    displayAdminProducts();
}


/* ================================
   HTML TEXT PROTECTION
================================ */

function escapeHTML(text) {
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* ================================
   START WEBSITE
================================ */

displayProducts();
