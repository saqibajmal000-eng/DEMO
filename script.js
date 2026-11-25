
/* =====================================
   BAGORA SETTINGS
===================================== */

const WHATSAPP_NUMBER = "923137925446";
const ADMIN_PASSWORD = "1234";
const DELIVERY_CHARGES = 100;
const STORAGE_KEY = "bagora_products";

/* =====================================
   STORAGE
===================================== */

function getProducts() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch (error) {
        return [];
    }
}

function saveProducts(products) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

/* =====================================
   SAFE TEXT
===================================== */

function escapeHTML(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/* =====================================
   CUSTOMER PRODUCTS
===================================== */

function displayProducts() {
    const productList = document.getElementById("productList");

    if (!productList) {
        return;
    }

    const products = getProducts();
    productList.innerHTML = "";

    if (products.length === 0) {
        productList.innerHTML =
            '<p class="empty-message">Products coming soon!</p>';
        return;
    }

    products.forEach(function(product) {
        const card = document.createElement("div");
        card.className = "product-card";

        card.innerHTML =
            '<img src="' + product.image + '" alt="' +
            escapeHTML(product.name) + '">' +

            '<div class="product-info">' +
                '<h3>' + escapeHTML(product.name) + '</h3>' +
                '<p>' + escapeHTML(product.description || "") + '</p>' +
                '<div class="price">Rs. ' +
                Number(product.price).toLocaleString("en-PK") +
                '</div>' +
                '<button type="button" class="order-btn">ORDER NOW</button>' +
            '</div>';

        const button = card.querySelector(".order-btn");

        button.addEventListener("click", function() {
            orderProduct(product.id);
        });

        productList.appendChild(card);
    });
}

/* =====================================
   WHATSAPP ORDER
===================================== */

function orderProduct(productId) {
    const products = getProducts();

    const product = products.find(function(item) {
        return String(item.id) === String(productId);
    });

    if (!product) {
        return;
    }

    const total = Number(product.price) + DELIVERY_CHARGES;

    const message =
        "Assalamualaikum! I want to order from Bagora.\n\n" +
        "Product: " + product.name + "\n" +
        "Price: Rs. " + product.price + "\n" +
        "Delivery: Rs. " + DELIVERY_CHARGES + "\n" +
        "Total: Rs. " + total + "\n\n" +
        "Please confirm my order.";

    const link =
        "https://wa.me/" + WHATSAPP_NUMBER +
        "?text=" + encodeURIComponent(message);

    window.open(link, "_blank");
}

/* =====================================
   ADMIN LOGIN
===================================== */

const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", function(event) {
        event.preventDefault();

        const password =
            document.getElementById("adminPassword").value;

        const loginMessage =
            document.getElementById("loginMessage");

        if (password === ADMIN_PASSWORD) {
            document.getElementById("loginBox").style.display = "none";
            document.getElementById("adminDashboard").hidden = false;

            loginMessage.textContent = "";

            displayAdminProducts();
        } else {
            loginMessage.textContent = "Incorrect password!";
        }
    });
}

/* =====================================
   ADMIN LOGOUT
===================================== */

const logoutButton = document.getElementById("logoutButton");

if (logoutButton) {
    logoutButton.addEventListener("click", function() {
        document.getElementById("adminDashboard").hidden = true;
        document.getElementById("loginBox").style.display = "block";

        document.getElementById("adminPassword").value = "";
        document.getElementById("loginMessage").textContent = "";
    });
}

/* =====================================
   ADD PRODUCT
===================================== */

const productForm = document.getElementById("productForm");

if (productForm) {
    productForm.addEventListener("submit", function(event) {
        event.preventDefault();

        const name =
            document.getElementById("productName").value.trim();

        const price =
            Number(document.getElementById("productPrice").value);

        const description =
            document.getElementById("productDescription").value.trim();

        const imageFile =
            document.getElementById("productImage").files[0];

        const uploadMessage =
            document.getElementById("uploadMessage");

        if (!name || !price || price <= 0 || !imageFile) {
            uploadMessage.textContent =
                "Please fill all required fields.";
            return;
        }

        if (!imageFile.type.startsWith("image/")) {
            uploadMessage.textContent =
                "Please select an image file.";
            return;
        }

        if (imageFile.size > 500000) {
            uploadMessage.textContent =
                "Please select an image under 500 KB.";
            return;
        }

        const reader = new FileReader();

        reader.onload = function() {
            const products = getProducts();

            products.push({
                id: Date.now(),
                name: name,
                price: price,
                description: description,
                image: reader.result
            });

            try {
                saveProducts(products);

                productForm.reset();

                uploadMessage.textContent =
                    "Product uploaded successfully!";

                displayAdminProducts();

            } catch (error) {
                uploadMessage.textContent =
                    "Storage full. Use a smaller image.";
            }
        };

        reader.onerror = function() {
            uploadMessage.textContent =
                "Image could not be loaded.";
        };

        reader.readAsDataURL(imageFile);
    });
}

/* =====================================
   ADMIN PRODUCT LIST
===================================== */

function displayAdminProducts() {
    const list = document.getElementById("adminProductList");

    if (!list) {
        return;
    }

    const products = getProducts();
    list.innerHTML = "";

    if (products.length === 0) {
        list.innerHTML =
            '<p class="empty-message">No products uploaded.</p>';
        return;
    }

    products.forEach(function(product) {
        const item = document.createElement("div");
        item.className = "admin-product";

        item.innerHTML =
            '<img src="' + product.image + '" alt="' +
            escapeHTML(product.name) + '">' +

            '<div class="admin-product-details">' +
                '<h3>' + escapeHTML(product.name) + '</h3>' +
                '<p>Rs. ' +
                Number(product.price).toLocaleString("en-PK") +
                '</p>' +
            '</div>' +

            '<button type="button" class="delete-btn">DELETE</button>';

        const deleteButton = item.querySelector(".delete-btn");

        deleteButton.addEventListener("click", function() {
            deleteProduct(product.id);
        });

        list.appendChild(item);
    });
}

/* =====================================
   DELETE PRODUCT
===================================== */

function deleteProduct(productId) {
    if (!confirm("Are you sure you want to delete this product?")) {
        return;
    }

    const products = getProducts().filter(function(product) {
        return String(product.id) !== String(productId);
    });

    saveProducts(products);
    displayAdminProducts();
}

/* =====================================
   START
===================================== */

displayProducts();
