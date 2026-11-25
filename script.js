function orderProduct(productId) {
    const products = getProducts();

    const product = products.find(function(item) {
        return item.id == productId;
    });

    if (!product) {
        return;
    }

    const message =
        "Assalamualaikum! I want to order this bag from Bagora.\n\n" +
        "Product: " + product.name + "\n" +
        "Price: Rs. " + product.price + "\n\n" +
        "Please confirm my order.";

    const whatsappLink =
        "https://wa.me/923137925446?text=" +
        encodeURIComponent(message);

    window.open(whatsappLink, "_blank");
}
