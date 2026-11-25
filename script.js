
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

function escapeHTML(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function formatPrice(price) {
    return Number(price).toLocaleString("en-PK");
}

/* =====================================
   IMAGE COMPRESSION
   Helps save space in browser storage
===================================== */

function compressImage(file) {
    return new Promise(function(resolve, reject) {

        const reader = new FileReader();

        reader.onload = function() {

            const img = new Image();

            img.onload = function() {

                const canvas = document.createElement("canvas");

                const maxSize = 1000;

                let width = img.width;
                let height = img.height;

                if (width > maxSize || height > maxSize) {

                    const ratio = Math.min(
                        maxSize / width,
                        maxSize / height
                    );

                    width = Math.round(width * ratio);
                    height = Math.round(height * ratio);
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext("2d");

                ctx.drawImage(img, 0, 0, width, height);

                resolve(canvas.toDataURL("image/jpeg", 0.72));
            };

            img.onerror = function() {
                reject(new Error("Image loading failed"));
            };

            img.src = reader.result;
        };

        reader.onerror = function() {
            reject(new Error("File reading failed"));
        };

        reader.readAsDataURL(file);
    });
}

/* =====================================
   CUSTOMER PRODUCT DISPLAY
===================================== */

function displayProducts() {

    const productList = document.getElementById("productList");

    if (!productList) return;

    const products = getProducts();

    productList.innerHTML = "";

    if (products.length === 0) {

        productList.innerHTML =
            '<p class="empty-message">Our collection is coming soon!</p>';

        return;
    }

    products.slice().reverse().forEach(function(product) {

        const card = document.createElement("div");

        card.className = "product-card";

        const firstImage =
            product.images && product.images.length
                ? product.images[0]
                : product.image;

        card.innerHTML = `
            <a href="product.html?id=${encodeURIComponent(product.id)}">
                <img src="${firstImage}" alt="${escapeHTML(product.name)}">

                <div class="product-info">
                    <h3>${escapeHTML(product.name)}</h3>

                    <p>${escapeHTML(product.description || "")}</p>

                    <div class="price">
                        Rs. ${formatPrice(product.price)}
                    </div>
                </div>
            </a>

            <div class="product-info">
                <button type="button" class="order-btn">
                    ORDER ON WHATSAPP
                </button>
            </div>
        `;

        card.querySelector(".order-btn").addEventListener("click", function() {
            orderProduct(product.id);
        });

        productList.appendChild(card);
    });
}

/* =====================================
   HOMEPAGE SLIDER
===================================== */

let currentSlide = 0;
let sliderTimer = null;

function displaySlider() {

    const heroImage = document.getElementById("heroImage");
    const heroContent = document.getElementById("heroContent");
    const dotsContainer = document.getElementById("sliderDots");

    if (!heroImage || !heroContent || !dotsContainer) return;

    const products = getProducts();

    dotsContainer.innerHTML = "";

    if (products.length === 0) {

        heroImage.style.backgroundImage = "";

        heroContent.innerHTML = `
            <p class="hero-tag">BAGORA COLLECTION</p>
            <h1>Fashion that<br>carries confidence.</h1>
            <p>Discover bags made for your everyday style.</p>
            <a href="#shop" class="main-btn">SHOP NOW</a>
        `;

        return;
    }

    if (currentSlide >= products.length) {
        currentSlide = 0;
    }

    function showSlide(index) {

        currentSlide = (index + products.length) % products.length;

        const product = products[currentSlide];

        const images =
            product.images && product.images.length
                ? product.images
                : [product.image];

        heroImage.style.backgroundImage =
            'url("' + images[0] + '")';

        heroContent.innerHTML = `
            <p class="hero-tag">BAGORA COLLECTION</p>

            <h1>${escapeHTML(product.name)}</h1>

            <p>Rs. ${formatPrice(product.price)}</p>

            <a href="product.html?id=${encodeURIComponent(product.id)}"
               class="main-btn">
                VIEW PRODUCT
            </a>
        `;

        dotsContainer.innerHTML = "";

        products.forEach(function(item, i) {

            const dot = document.createElement("button");

            dot.className = "slider-dot" +
                (i === currentSlide ? " active" : "");

            dot.setAttribute("aria-label", "Slide " + (i + 1));

            dot.addEventListener("click", function() {
                showSlide(i);
                restartSlider();
            });

            dotsContainer.appendChild(dot);
        });
    }

    function restartSlider() {

        clearInterval(sliderTimer);

        if (products.length > 1) {

            sliderTimer = setInterval(function() {
                showSlide(currentSlide + 1);
            }, 5000);
        }
    }

    const previousButton = document.getElementById("prevSlide");
    const nextButton = document.getElementById("nextSlide");

    if (previousButton) {
        previousButton.onclick = function() {
            showSlide(currentSlide - 1);
            restartSlider();
        };
    }

    if (nextButton) {
        nextButton.onclick = function() {
            showSlide(currentSlide + 1);
            restartSlider();
        };
    }

    showSlide(currentSlide);
    restartSlider();
}

/* =====================================
   WHATSAPP ORDER
===================================== */

function orderProduct(productId) {

    const products = getProducts();

    const product = products.find(function(item) {
        return String(item.id) === String(productId);
    });

    if (!product) return;

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
   PRODUCT DETAIL PAGE
===================================== */

function displayProductDetail() {

    const detail = document.getElementById("productDetail");

    if (!detail) return;

    const params = new URLSearchParams(window.location.search);
    const productId = params.get("id");

    const products = getProducts();

    const product = products.find(function(item) {
        return String(item.id) === String(productId);
    });

    if (!product) {

        detail.innerHTML = `
            <div class="empty-message">
                <h2>Product not found</h2>
                <a href="index.html#shop" class="main-btn">
                    RETURN TO SHOP
                </a>
            </div>
        `;

        return;
    }

    const images =
        product.images && product.images.length
            ? product.images
            : [product.image];

    detail.innerHTML = `
        <div class="detail-gallery">

            <div class="gallery-main">
                <img id="mainProductImage"
                     src="${images[0]}"
                     alt="${escapeHTML(product.name)}">
            </div>

            <div class="gallery-thumbnails" id="galleryThumbnails"></div>

        </div>

        <div class="detail-info">

            <a href="index.html#shop" class="back-link">
                &#8592; Back to Shop
            </a>

            <p class="small-heading">BAGORA COLLECTION</p>

            <h1>${escapeHTML(product.name)}</h1>

            <div class="detail-price">
                Rs. ${formatPrice(product.price)}
            </div>

            <p class="detail-description">
                ${escapeHTML(product.description || "Beautifully selected for your style.")}
            </p>

            <p>Delivery Charges: Rs. ${DELIVERY_CHARGES}</p>

            <p class="detail-price">
                Total: Rs. ${formatPrice(Number(product.price) + DELIVERY_CHARGES)}
            </p>

            <button class="main-btn detail-order" id="detailOrderButton">
                ORDER ON WHATSAPP
            </button>

            <a href="index.html#shop" class="main-btn">
                CONTINUE SHOPPING
            </a>

        </div>
    `;

    const mainImage = document.getElementById("mainProductImage");
    const thumbnails = document.getElementById("galleryThumbnails");

    images.forEach(function(image, index) {

        const thumb = document.createElement("img");

        thumb.src = image;
        thumb.alt = product.name + " photo " + (index + 1);

        if (index === 0) {
            thumb.classList.add("active");
        }

        thumb.addEventListener("click", function() {

            mainImage.src = image;

            thumbnails.querySelectorAll("img").forEach(function(img) {
                img.classList.remove("active");
            });

            thumb.classList.add("active");
        });

        thumbnails.appendChild(thumb);
    });

    document.getElementById("detailOrderButton").addEventListener(
        "click",
        function() {
            orderProduct(product.id);
        }
    );
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
   MULTIPLE IMAGE PREVIEW
===================================== */

const productImageInput = document.getElementById("productImage");

if (productImageInput) {

    productImageInput.addEventListener("change", function() {

        const preview = document.getElementById("imagePreview");

        const files = Array.from(productImageInput.files || []);

        preview.innerHTML = "";

        if (files.length > 8) {

            document.getElementById("uploadMessage").textContent =
                "You can upload a maximum of 8 photos per product.";

            productImageInput.value = "";

            return;
        }

        files.forEach(function(file) {

            if (!file.type.startsWith("image/")) return;

            const img = document.createElement("img");

            img.src = URL.createObjectURL(file);

            preview.appendChild(img);
        });

        document.getElementById("uploadMessage").textContent =
            files.length + " photo(s) selected.";
    });
}

/* =====================================
   ADD PRODUCT
===================================== */

const productForm = document.getElementById("productForm");

if (productForm) {

    productForm.addEventListener("submit", async function(event) {

        event.preventDefault();

        const name =
            document.getElementById("productName").value.trim();

        const price =
            Number(document.getElementById("productPrice").value);

        const description =
            document.getElementById("productDescription").value.trim();

        const imageFiles =
            Array.from(document.getElementById("productImage").files || []);

        const uploadMessage =
            document.getElementById("uploadMessage");

        if (!name || !price || price <= 0 || imageFiles.length === 0) {

            uploadMessage.textContent =
                "Please enter product name, price, and select photos.";

            return;
        }

        if (imageFiles.length > 8) {

            uploadMessage.textContent =
                "Maximum 8 photos allowed.";

            return;
        }

        for (const file of imageFiles) {

            if (!file.type.startsWith("image/")) {

                uploadMessage.textContent =
                    "Only image files are allowed.";

                return;
            }
        }

        uploadMessage.textContent = "Processing photos...";

        try {

            const compressedImages = [];

            for (const file of imageFiles) {
                const compressed = await compressImage(file);
                compressedImages.push(compressed);
            }

            const products = getProducts();

            const newProduct = {
                id: Date.now(),
                name: name,
                price: price,
                description: description,
                images: compressedImages,
                image: compressedImages[0]
            };

            products.push(newProduct);

            saveProducts(products);

            productForm.reset();

            document.getElementById("imagePreview").innerHTML = "";

            uploadMessage.textContent =
                "Product uploaded successfully!";

            displayAdminProducts();

        } catch (error) {

            uploadMessage.textContent =
                "Storage is full. Try fewer or smaller photos.";
        }
    });
}

/* =====================================
   ADMIN PRODUCT LIST
===================================== */

function displayAdminProducts() {

    const list = document.getElementById("adminProductList");

    if (!list) return;

    const products = getProducts();

    list.innerHTML = "";

    if (products.length === 0) {

        list.innerHTML =
            '<p class="empty-message">No products uploaded yet.</p>';

        return;
    }

    products.slice().reverse().forEach(function(product) {

        const item = document.createElement("div");

        item.className = "admin-product";

        const images =
            product.images && product.images.length
                ? product.images
                : [product.image];

        item.innerHTML = `
            <img src="${images[0]}" alt="${escapeHTML(product.name)}">

            <div class="admin-product-details">
                <h3>${escapeHTML(product.name)}</h3>
                <p>Rs. ${formatPrice(product.price)}</p>
                <p>${images.length} photo(s)</p>
            </div>

            <button type="button" class="delete-btn">
                DELETE
            </button>
        `;

        item.querySelector(".delete-btn").addEventListener("click", function() {
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

    displaySlider();

    displayProducts();
}

/* =====================================
   START WEBSITE
===================================== */

displayProducts();
displaySlider();
displayProductDetail();
