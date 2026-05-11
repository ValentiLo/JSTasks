class ProductShowcase {
    constructor() {
        this.products = [];
        this.cart = JSON.parse(localStorage.getItem('cart')) || [];
        this.filteredProducts = [];
        
        this.init();
    }

    async init() {
        await this.loadProducts();
        this.renderProducts();
        this.setupEventListeners();
        this.updateCartCount();
    }

    async loadProducts() {
        try {
            // В реальном проекте здесь был бы fetch к API
            const response = await fetch('./data/products.json');
            const data = await response.json();
            this.products = data.products;
            this.filteredProducts = [...this.products];
        } catch (error) {
            console.error('Ошибка загрузки товаров:', error);
        }
    }

    setupEventListeners() {
        // Фильтрация по категории
        document.getElementById('category-filter').addEventListener('change', (e) => {
            this.filterProducts();
        });

        // Сортировка
        document.getElementById('sort-by').addEventListener('change', (e) => {
            this.sortProducts(e.target.value);
        });

        // Поиск
        document.getElementById('search-input').addEventListener('input', (e) => {
            this.filterProducts();
        });

        // Модальное окно корзины
        document.getElementById('view-cart-btn').addEventListener('click', () => {
            this.showCart();
        });

        document.querySelector('.close').addEventListener('click', () => {
            this.hideCart();
        });

        // Оформление заказа
        document.getElementById('checkout-btn').addEventListener('click', () => {
            this.checkout();
        });

        // Закрытие модального окна при клике вне его
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('cart-modal');
            if (e.target === modal) {
                this.hideCart();
            }
        });
    }

    filterProducts() {
        const categoryFilter = document.getElementById('category-filter').value;
        const searchTerm = document.getElementById('search-input').value.toLowerCase();

        this.filteredProducts = this.products.filter(product => {
            const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
            const matchesSearch = product.name.toLowerCase().includes(searchTerm) || 
                                product.description.toLowerCase().includes(searchTerm);
            return matchesCategory && matchesSearch;
        });

        this.renderProducts();
    }

    sortProducts(sortType) {
        switch(sortType) {
            case 'name':
                this.filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'price-asc':
                this.filteredProducts.sort((a, b) => a.price - b.price);
                break;
            case 'price-desc':
                this.filteredProducts.sort((a, b) => b.price - a.price);
                break;
            case 'rating':
                this.filteredProducts.sort((a, b) => b.rating - a.rating);
                break;
        }
        this.renderProducts();
    }

    renderProducts() {
        const container = document.getElementById('products-container');
        
        if (this.filteredProducts.length === 0) {
            container.innerHTML = '<p class="no-products">Товары не найдены</p>';
            return;
        }

        container.innerHTML = this.filteredProducts.map(product => `
            <div class="product-card">
                <img src="${product.image}" alt="${product.name}" class="product-image">
                <h3 class="product-name">${product.name}</h3>
                <div class="product-price">${this.formatPrice(product.price)} руб.</div>
                <div class="product-rating">${this.renderRating(product.rating)}</div>
                <p class="product-description">${product.description}</p>
                <button class="add-to-cart-btn" onclick="showcase.addToCart(${product.id})">
                    Добавить в корзину
                </button>
            </div>
        `).join('');
    }

    renderRating(rating) {
        const fullStars = '★'.repeat(Math.floor(rating));
        const emptyStars = '☆'.repeat(5 - Math.ceil(rating));
        return fullStars + emptyStars + ` (${rating})`;
    }

    formatPrice(price) {
        return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    }

    addToCart(productId) {
        const product = this.products.find(p => p.id === productId);
        const existingItem = this.cart.find(item => item.id === productId);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push({
                ...product,
                quantity: 1
            });
        }

        this.saveCart();
        this.updateCartCount();
        this.showNotification(`"${product.name}" добавлен в корзину!`);
    }

    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.saveCart();
        this.updateCartCount();
        this.showCart();
    }

    updateCartCount() {
        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        document.getElementById('cart-count').textContent = totalItems;
    }

    showCart() {
        const modal = document.getElementById('cart-modal');
        const cartItems = document.getElementById('cart-items');
        
        if (this.cart.length === 0) {
            cartItems.innerHTML = '<p>Корзина пуста</p>';
        } else {
            cartItems.innerHTML = this.cart.map(item => `
                <div class="cart-item">
                    <div>
                        <strong>${item.name}</strong>
                        <div>${this.formatPrice(item.price)} руб. × ${item.quantity}</div>
                    </div>
                    <div>
                        <strong>${this.formatPrice(item.price * item.quantity)} руб.</strong>
                        <button onclick="showcase.removeFromCart(${item.id})" 
                                style="margin-left: 10px; color: red; border: none; background: none; cursor: pointer;">
                            ❌
                        </button>
                    </div>
                </div>
            `).join('');
        }

        const totalPrice = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        document.getElementById('total-price').textContent = this.formatPrice(totalPrice);
        
        modal.style.display = 'block';
    }

    hideCart() {
        document.getElementById('cart-modal').style.display = 'none';
    }

    checkout() {
        if (this.cart.length === 0) {
            alert('Корзина пуста!');
            return;
        }

        const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        alert(`Заказ оформлен! Сумма: ${this.formatPrice(total)} руб.\nСпасибо за покупку!`);
        
        this.cart = [];
        this.saveCart();
        this.updateCartCount();
        this.hideCart();
    }

    showNotification(message) {
        // Простое уведомление
        alert(message);
    }

    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.cart));
    }
}

// Инициализация приложения
const showcase = new ProductShowcase();