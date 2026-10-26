const selected = { soup: null, main: null, salad: null, drink: null, dessert: null };

function renderGrid(category, filterKind = null) {
    const grid = document.querySelector(`.dishes-grid[data-category="${category}"]`);
    if (!grid) return;
    
    grid.innerHTML = '';
    let filtered = dishes.filter(d => d.category === category && (!filterKind || d.kind === filterKind));

    filtered.forEach(dish => {
        const card = document.createElement('div');
        card.className = 'dish-card';
        if (selected[category] === dish.keyword) card.classList.add('selected');

        card.innerHTML = `
            <img src="${dish.image}" alt="${dish.name}">
            <p class="price">${dish.price} ₽</p>
            <p class="dish-name">${dish.name}</p>
            <p class="weight">${dish.count}</p>
            <button class="add-btn">Добавить</button>
        `;
        
        grid.appendChild(card);

        card.querySelector('.add-btn').onclick = () => {
            document.querySelectorAll('.dish-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            selected[dish.category] = dish.keyword;
            updateOrder();
        };
    });
}

function updateOrder() {
    const summary = document.getElementById('order-summary');
    const totalBlock = document.getElementById('total-cost');
    if (!summary || !totalBlock) return; 

    let total = 0;
    let html = '';
    const names = { soup: 'Суп', main: 'Главное блюдо', salad: 'Салат', drink: 'Напиток', dessert: 'Десерт' };

    for (let key in names) {
        html += `<p class="category-title">${names[key]}:</p>`;
        if (selected[key]) {
            const dish = dishes.find(d => d.keyword === selected[key]);
            if (dish) {
                html += `<p>${dish.name} — ${dish.price} ₽</p>`;
                total += dish.price;
            }
        } else {
            html += `<p>Блюдо не выбрано</p>`;
        }
    }

    summary.innerHTML = total === 0 ? '<p>Ничего не выбрано</p>' : html;
    totalBlock.style.display = total === 0 ? 'none' : 'block';
    if (total > 0) document.getElementById('total-price').textContent = total + ' ₽';
}

function showNotification(text) {
    const overlay = document.createElement('div');
    overlay.className = 'notification-overlay';
    
    const box = document.createElement('div');
    box.className = 'notification-box';
    
    const p = document.createElement('p');
    p.textContent = text;
    
    const btn = document.createElement('button');
    btn.className = 'notification-btn';
    btn.textContent = 'Окей';
    
    btn.onclick = () => overlay.remove();
    
    box.append(p, btn); 
    overlay.append(box);
    document.body.append(overlay);
}

document.addEventListener('DOMContentLoaded', () => {
    ['soup', 'main', 'salad', 'drink', 'dessert'].forEach(cat => renderGrid(cat));
    updateOrder();

    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.onclick = () => {
            const section = btn.closest('section');
            const category = section.querySelector('.dishes-grid').dataset.category;
            if (btn.classList.contains('active')) {
                btn.classList.remove('active');
                renderGrid(category, null);
            } else {
                section.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                renderGrid(category, btn.dataset.kind);
            }
        };
    });

    const asapRadio = document.querySelector('input[name="delivery-time"][value="asap"]');
    const exactRadio = document.querySelector('input[name="delivery-time"][value="exact"]');
    const timeInput = document.getElementById('time');

    if (asapRadio && exactRadio && timeInput) {
        const handleDeliveryTime = () => {
            if (asapRadio.checked) {
                timeInput.value = '';      
                timeInput.disabled = true; 
            } else {
                timeInput.disabled = false; 
            }
        };

        asapRadio.addEventListener('change', handleDeliveryTime);
        exactRadio.addEventListener('change', handleDeliveryTime);
        handleDeliveryTime(); 
    }

    document.querySelector('.order-form').onsubmit = (e) => {
        ['soup', 'main', 'salad', 'drink', 'dessert'].forEach(cat => {
            document.getElementById(`hidden-${cat}`).value = selected[cat] || '';
        });

        const hasSoup = !!selected.soup;
        const hasMain = !!selected.main;
        const hasSalad = !!selected.salad;
        const hasDrink = !!selected.drink;

        const validLunches = [
            hasSoup && hasMain && hasSalad && hasDrink,
            hasSoup && hasMain && !hasSalad && hasDrink,
            hasSoup && !hasMain && hasSalad && hasDrink,
            !hasSoup && hasMain && hasSalad && hasDrink,
            !hasSoup && hasMain && !hasSalad && hasDrink
        ];

        if (!validLunches.includes(true)) {
            e.preventDefault(); 
            let msg = "";

            if (!hasSoup && !hasMain && !hasSalad && !hasDrink) {
                msg = "Ничего не выбрано. Выберите блюда для заказа";
            } 
            else if (hasSoup && !hasMain && !hasSalad) {
                msg = "Выберите главное блюдо/салат/стартер";
            } 
            else if (!hasSoup && !hasMain && hasSalad) {
                msg = "Выберите суп или главное блюдо";
            } 
            else if (!hasDrink) {
                msg = "Выберите напиток";
            } 
            else {
                msg = "Выберите главное блюдо";
            }

            showNotification(msg);
        }
    };
});