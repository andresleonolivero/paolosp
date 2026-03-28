// --- BASE DE DATOS Y ESTADO GLOBAL ---
let DB = {
    menu: {
        pizzas_completa: [
            { nombre: "Pizza Grande (16 Porc.)", precio: 85000 },
            { nombre: "Pizza Mediana (12 Porc.)", precio: 62000 },
            { nombre: "Pizza Pequeña (8 Porc.)", precio: 50000 },
            { nombre: "Pizza Mini (6 Porc.)", precio: 32000 }
        ],
        crepes: [
            { nombre: "Crepe Paolos", precio: 30000 },
            { nombre: "Crepe Marinero", precio: 30000 },
            { nombre: "Crepe Clásico", precio: 27000 }
        ],
        lasañas: [
            { nombre: "Lasaña Especial", precio_p: 23000, precio_f: 42000 },
            { nombre: "Lasaña Blanca", precio_p: 23000, precio_f: 42000 },
            { nombre: "Lasaña Vegetariana", precio_p: 23000, precio_f: 42000 }
        ],
        bebidas: [] 
    },
    sabores_pizzas: [
        { id: 1, nombre: "Peperoni Picante", precio: 7000 },
        { id: 2, nombre: "Marinera", precio: 7000 },
        { id: 3, nombre: "Mexicana", precio: 7000 },
        { id: 4, nombre: "Camarón y Pollo", precio: 7000 },
        { id: 5, nombre: "BBQ", precio: 7000 },
        { id: 6, nombre: "Carnes", precio: 7000 },
        { id: 7, nombre: "Pollo", precio: 7000 },
        { id: 8, nombre: "Maíz Tocineta", precio: 7000 },
        { id: 9, nombre: "Tropical", precio: 7000 },
        { id: 10, nombre: "De la Huerta", precio: 7000 },
        { id: 11, nombre: "Romana", precio: 7000 },
        { id: 12, nombre: "Salami", precio: 7000 },
        { id: 13, nombre: "Pollo Miel Mostaza", precio: 7000 },
        { id: 14, nombre: "Hawaiana", precio: 7000 },
        { id: 15, nombre: "Pollo Champiñones", precio: 7000 },
        { id: 16, nombre: "Napolitana", precio: 7000 },
        { id: 17, nombre: "Jamón Pollo", precio: 7000 },
        { id: 18, nombre: "Vegetariana", precio: 7000 }
    ],
    bebidas_inv: [
        { id: 101, nombre: "Coca-Cola 1.5L", cantidad: 12, precio: 8500 },
        { id: 102, nombre: "Gaseosa Personal", cantidad: 20, precio: 3500 },
        { id: 103, nombre: "Cerveza", cantidad: 24, precio: 4500 }
    ]
};

let Cuentas = {};
let VentasHistoricas = []; 
let Gastos = []; 
let metodoPagoSeleccionado = 'Efectivo'; 

// --- SISTEMA DE LOGIN Y NAVEGACIÓN ---
function login() {
    const user = document.getElementById('username').value.trim();
    if (user === "admin" || user === "ventas") {
        document.getElementById('login-section').classList.add('hidden');
        document.getElementById('dashboard').classList.remove('hidden');
        document.getElementById('user-display').innerText = user.toUpperCase();
    }
}

function openModule(tipo) {
    document.getElementById('module-selector').classList.add('hidden');
    document.getElementById('work-area').classList.remove('hidden');
    const container = document.getElementById('module-content');
    const title = document.getElementById('module-title');
    
    document.getElementById('btn-back-tables').classList.add('hidden');

    if (tipo === 'pizzas') { 
        title.innerText = "MÓDULO MESAS"; 
        renderTables(container); 
    }
    else if (tipo === 'inv-bebidas') { 
        title.innerText = "INV. BEBIDAS"; 
        renderInventory(container, 'bebidas_inv'); 
    }
    else if (tipo === 'transferencias') {
        title.innerText = "REPORTES TRANSFERENCIAS";
        renderTransferencias(container);
    }
    else if (tipo === 'ventas-dia') {
        title.innerText = "CIERRE DE CAJA DIARIO";
        renderVentasDia(container);
    }
    else if (tipo === 'otros') {
        title.innerText = "OTROS / GASTOS";
        renderOtros(container); 
    }
}

function showMenu() { 
    document.getElementById('work-area').classList.add('hidden'); 
    document.getElementById('module-selector').classList.remove('hidden'); 
    document.getElementById('btn-back-tables').classList.add('hidden');
}

function logout() { location.reload(); }

// --- MÓDULO DE CIERRE DE CAJA (VENTAS DEL DÍA + GASTOS) ---
function renderVentasDia(container) {
    let totales = { porciones: 0, pizzas: 0, crepes: 0, lasañas: 0, bebidas: 0 };
    let totalEfectivo = 0, totalTransf = 0;
    let totalGastos = Gastos.reduce((sum, g) => sum + g.monto, 0);
    
    VentasHistoricas.forEach(v => {
        if(v.metodo === 'Efectivo') totalEfectivo += v.total;
        else totalTransf += v.total;

        if(v.items) {
            v.items.forEach(item => {
                const nombre = item.nombre.toLowerCase();
                if (nombre.includes("porción")) totales.porciones += item.precio;
                else if (nombre.includes("pizza")) totales.pizzas += item.precio;
                else if (nombre.includes("crepe")) totales.crepes += item.precio;
                else if (nombre.includes("lasaña")) totales.lasañas += item.precio;
                else totales.bebidas += item.precio;
            });
        }
    });

    const totalBruto = totalEfectivo + totalTransf;
    const balanceNeto = totalBruto - totalGastos;

    let html = `
        <div class="glass-card" style="margin-bottom:20px; padding:15px;">
            <h3 class="accent">Ventas Detalladas</h3>
            <div class="products-grid" style="grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));">
                <div class="product-card"><h4>🍕 Porciones</h4><span class="price">$${totales.porciones.toLocaleString()}</span></div>
                <div class="product-card"><h4>🥘 Pizzas C.</h4><span class="price">$${totales.pizzas.toLocaleString()}</span></div>
                <div class="product-card"><h4>🥞 Crepes</h4><span class="price">$${totales.crepes.toLocaleString()}</span></div>
                <div class="product-card"><h4>🍝 Lasañas</h4><span class="price">$${totales.lasañas.toLocaleString()}</span></div>
                <div class="product-card"><h4>🥤 Bebidas</h4><span class="price">$${totales.bebidas.toLocaleString()}</span></div>
            </div>
            <hr style="border:0; border-top:1px solid rgba(255,255,255,0.1); margin:15px 0;">
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
                <div class="product-card"><h4>Efectivo</h4><span class="price">$${totalEfectivo.toLocaleString()}</span></div>
                <div class="product-card"><h4>Transf.</h4><span class="price" style="color:var(--accent);">$${totalTransf.toLocaleString()}</span></div>
            </div>
            <div class="inv-total" style="margin-top:15px;">
                <div style="display:flex; justify-content:space-between;"><span>BRUTO:</span> <span>$${totalBruto.toLocaleString()}</span></div>
                <div style="display:flex; justify-content:space-between; color:#ff4444;"><span>GASTOS:</span> <span>-$${totalGastos.toLocaleString()}</span></div>
                <div style="display:flex; justify-content:space-between; border-top:1px solid var(--accent); margin-top:5px; padding-top:5px; font-size:1.3rem;">
                    <span>NETO:</span> <b>$${balanceNeto.toLocaleString()}</b>
                </div>
            </div>
        </div>
        <div style="overflow-x:auto;">
            <table>
                <thead><tr><th>Hora</th><th>Destino</th><th>Total</th><th>Pago</th></tr></thead>
                <tbody>`;
    
    VentasHistoricas.slice().reverse().forEach(v => {
        html += `<tr>
            <td>${v.hora}</td>
            <td>${v.destino}</td>
            <td>$${v.total.toLocaleString()}</td>
            <td><small class="accent">${v.metodo.toUpperCase()}</small></td>
        </tr>`;
    });

    container.innerHTML = html + `</tbody></table></div>`;
}

// --- MÓDULO OTROS (GASTOS) ---
function renderOtros(container) {
    let totalGastos = Gastos.reduce((sum, g) => sum + g.monto, 0);
    
    let html = `
        <div class="inventory-form glass-card">
            <input type="text" id="gasto-desc" placeholder="Descripción del gasto">
            <input type="number" id="gasto-monto" placeholder="Monto $">
            <button class="btn-nav neon-btn" onclick="agregarGasto()">+</button>
        </div>
        <div class="inv-total" style="margin: 15px 0; border-color: #ff4444;">TOTAL GASTOS: $${totalGastos.toLocaleString()}</div>
        <div style="overflow-x:auto;">
            <table>
                <thead><tr><th>Descripción</th><th>Monto</th><th>Acción</th></tr></thead>
                <tbody>`;

    Gastos.forEach((g, idx) => {
        html += `<tr>
            <td>${g.descripcion}</td>
            <td>$${g.monto.toLocaleString()}</td>
            <td><button class="btn-del" onclick="eliminarGasto(${idx})">🗑️</button></td>
        </tr>`;
    });

    container.innerHTML = html + `</tbody></table></div>`;
}

function agregarGasto() {
    const desc = document.getElementById('gasto-desc').value;
    const monto = parseInt(document.getElementById('gasto-monto').value);
    if (desc && monto > 0) {
        Gastos.push({ descripcion: desc, monto: monto });
        renderOtros(document.getElementById('module-content'));
    }
}

function eliminarGasto(idx) {
    if(confirm("¿Eliminar este registro de gasto?")) {
        Gastos.splice(idx, 1);
        renderOtros(document.getElementById('module-content'));
    }
}

// --- MÓDULO DE TRANSFERENCIAS ---
function renderTransferencias(container) {
    const transf = VentasHistoricas.filter(v => v.metodo === 'Transferencia');
    let total = transf.reduce((s, v) => s + v.total, 0);

    let html = `<div class="inv-total" style="margin-bottom:15px; border-color:var(--accent);">TOTAL TRANSFERENCIAS: $${total.toLocaleString()}</div>
                <div class="products-grid">`;
    
    transf.forEach(v => {
        html += `<div class="product-card">
            <small class="accent">${v.hora}</small>
            <h4>${v.destino}</h4>
            <span class="price">$${v.total.toLocaleString()}</span>
        </div>`;
    });

    container.innerHTML = transf.length > 0 ? html + `</div>` : `<div style="text-align:center; color:#666; padding:20px;">No hay transferencias registradas.</div>`;
}

// --- MÓDULO DE MESAS Y VENTAS ---
function renderTables(container) {
    let html = '<div class="tables-grid">';
    for (let i = 1; i <= 8; i++) {
        const mesaId = `Mesa ${i}`;
        const ocupada = Cuentas[mesaId] && Cuentas[mesaId].length > 0;
        html += `<button class="mesa-btn ${ocupada ? 'active-order' : ''}" onclick="selectDestino('${mesaId}')">MESA ${i}</button>`;
    }
    html += `<div class="delivery-group">
        <button class="domicilio-btn" onclick="selectDestino('Domicilio')">🛵 DOMICILIO</button>
        <button class="llevar-btn" onclick="selectDestino('Llevar')">🛍️ LLEVAR</button>
    </div></div>`;
    container.innerHTML = html;
}

function selectDestino(destino) {
    const container = document.getElementById('module-content');
    document.getElementById('module-title').innerText = destino.toUpperCase();
    document.getElementById('btn-back-tables').classList.remove('hidden');

    container.innerHTML = `
        <div class="search-box">
            <input type="text" id="product-search" placeholder="🔍 Buscar producto o sabor..." onkeyup="filterItems('${destino}')">
        </div>
        <div class="categories-grid">
            <button class="category-btn" onclick="renderProductsByCategory('porcion', '${destino}')">🍕 PORCIÓN</button>
            <button class="category-btn" onclick="renderProductsByCategory('pizzas_completa', '${destino}')">🥘 PIZZA C.</button>
            <button class="category-btn" onclick="renderProductsByCategory('crepes', '${destino}')">🥞 CREPES</button>
            <button class="category-btn" onclick="renderProductsByCategory('lasañas', '${destino}')">🍝 LASAÑAS</button>
            <button class="category-btn" onclick="renderProductsByCategory('bebidas', '${destino}')">🥤 BEBIDAS</button>
        </div>
        <div id="product-list-container"></div>
        <div id="summary-container"></div>`;
    renderOrderSummary(destino);
}

// --- FILTRADO Y BÚSQUEDA ---
function filterItems(dest) {
    const searchTerm = document.getElementById('product-search').value.toLowerCase();
    const container = document.getElementById('product-list-container');
    const categoriesDiv = document.querySelector('.categories-grid');

    if (searchTerm === "") {
        categoriesDiv.classList.remove('hidden');
        container.innerHTML = "";
        return;
    }

    categoriesDiv.classList.add('hidden');
    let html = `<div class="products-grid">`;
    let found = false;

    for (const [catKey, items] of Object.entries(DB.menu)) {
        if (catKey === 'bebidas') continue; 
        items.forEach(p => {
            if (p.nombre.toLowerCase().includes(searchTerm)) {
                found = true;
                if (catKey === 'lasañas') {
                    html += `<div class="product-card search-result"><small class="accent">LASAÑAS</small><h4>${p.nombre}</h4>
                        <div style="display:grid; gap:5px;">
                            <button class="category-btn" onclick="addItemToOrder('${dest}', '${p.nombre} (P)', ${p.precio_p})">P: $${p.precio_p.toLocaleString()}</button>
                            <button class="category-btn" onclick="addItemToOrder('${dest}', '${p.nombre} (F)', ${p.precio_f})">F: $${p.precio_f.toLocaleString()}</button>
                        </div></div>`;
                } else {
                    const action = (catKey === 'pizzas_completa') ? `onclick="renderPizzaFlavorSelector('${dest}', '${p.nombre}', ${p.precio})"` : `onclick="addItemToOrder('${dest}', '${p.nombre}', ${p.precio})"`;
                    html += `<div class="product-card search-result"><small class="accent">${catKey.replace('_',' ').toUpperCase()}</small><h4>${p.nombre}</h4>
                        <span class="price">$${(p.precio || p.precio_p).toLocaleString()}</span>
                        <button class="btn-action" ${action}>SELECCIONAR</button></div>`;
                }
            }
        });
    }

    DB.bebidas_inv.forEach(p => {
        if (p.nombre.toLowerCase().includes(searchTerm)) {
            found = true;
            const agotado = p.cantidad <= 0;
            html += `<div class="product-card search-result" style="${agotado ? 'opacity:0.5;' : ''}">
                <small class="accent">BEBIDA (${p.cantidad} DISP.)</small>
                <h4>${p.nombre}</h4>
                <span class="price">$${p.precio.toLocaleString()}</span>
                <button class="btn-action" onclick="sellBebida('${dest}', ${p.id})">
                    ${agotado ? 'AGOTADO' : 'AÑADIR'}
                </button></div>`;
        }
    });

    DB.sabores_pizzas.forEach(s => {
        if (s.nombre.toLowerCase().includes(searchTerm)) {
            found = true;
            html += `<div class="product-card search-result"><small class="accent">PORCIÓN</small><h4>${s.nombre}</h4>
                <span class="price">$${s.precio.toLocaleString()}</span>
                <button class="btn-action" onclick="addItemToOrder('${dest}', 'Porción ${s.nombre}', ${s.precio})">AÑADIR</button></div>`;
        }
    });

    container.innerHTML = found ? html + `</div>` : `<div style="text-align:center; padding:20px; color:#666;">No se encontraron resultados.</div>`;
}

// --- RENDERIZADO DE PRODUCTOS ---
function renderProductsByCategory(cat, dest) {
    document.getElementById('product-search').value = "";
    const container = document.getElementById('product-list-container');
    if (cat === 'porcion') { renderFlavorSelector(container, dest); return; }

    let html = `<div class="products-grid">`;

    if (cat === 'bebidas') {
        DB.bebidas_inv.forEach(p => {
            const agotado = p.cantidad <= 0;
            html += `
                <div class="product-card" style="${agotado ? 'opacity:0.6;' : ''}">
                    <small class="accent">${agotado ? 'AGOTADO' : 'DISPONIBLES: ' + p.cantidad}</small>
                    <h4>${p.nombre}</h4>
                    <span class="price">$${p.precio.toLocaleString()}</span>
                    <button class="btn-action" onclick="sellBebida('${dest}', ${p.id})" ${agotado ? 'disabled' : ''}>
                        ${agotado ? 'SIN STOCK' : 'AGREGAR'}
                    </button>
                </div>`;
        });
    } else {
        DB.menu[cat].forEach(p => {
            if (cat === 'pizzas_completa') {
                html += `<div class="product-card"><h4>${p.nombre}</h4><span class="price">$${p.precio.toLocaleString()}</span>
                <button class="btn-action" onclick="renderPizzaFlavorSelector('${dest}', '${p.nombre}', ${p.precio})">SABORES</button></div>`;
            } else if (cat === 'lasañas') {
                html += `<div class="product-card"><h4>${p.nombre}</h4>
                    <div style="display:grid; gap:5px;">
                        <button class="category-btn" onclick="addItemToOrder('${dest}', '${p.nombre} (P)', ${p.precio_p})">P: $${p.precio_p.toLocaleString()}</button>
                        <button class="category-btn" onclick="addItemToOrder('${dest}', '${p.nombre} (F)', ${p.precio_f})">F: $${p.precio_f.toLocaleString()}</button>
                    </div></div>`;
            } else {
                html += `<div class="product-card"><h4>${p.nombre}</h4><span class="price">$${p.precio.toLocaleString()}</span>
                <button class="btn-action" onclick="addItemToOrder('${dest}', '${p.nombre}', ${p.precio})">AGREGAR</button></div>`;
            }
        });
    }
    container.innerHTML = html + `</div>`;
}

// --- LÓGICA DE STOCK Y VENTAS ---
function sellBebida(dest, productId) {
    const item = DB.bebidas_inv.find(b => b.id == productId);
    if (item && item.cantidad > 0) {
        item.cantidad -= 1;
        addItemToOrder(dest, item.nombre, item.precio);
        const searchVal = document.getElementById('product-search').value;
        if (searchVal === "") renderProductsByCategory('bebidas', dest);
        else filterItems(dest);
    }
}

function setMetodoPago(metodo) {
    metodoPagoSeleccionado = metodo;
    document.querySelectorAll('.pay-btn').forEach(btn => {
        btn.classList.remove('selected');
        if(btn.innerText.toLowerCase().includes(metodo.toLowerCase())) btn.classList.add('selected');
    });
}

function addItemToOrder(dest, nombre, precio) {
    if (!Cuentas[dest]) Cuentas[dest] = [];
    Cuentas[dest].push({ nombre, precio });
    renderOrderSummary(dest);
}

function renderOrderSummary(dest) {
    const rawItems = Cuentas[dest] || [];
    let total = 0;
    const grouped = rawItems.reduce((acc, item, index) => {
        if (!acc[item.nombre]) acc[item.nombre] = { nombre: item.nombre, precio: item.precio, cantidad: 0, indices: [] };
        acc[item.nombre].cantidad++;
        acc[item.nombre].indices.push(index);
        total += item.precio;
        return acc;
    }, {});

    let html = `<div class="order-summary"><div class="summary-title">Resumen: ${dest}</div><div class="summary-list">`;
    Object.values(grouped).forEach(item => {
        html += `<div class="summary-item"><span><b>${item.cantidad}x</b> ${item.nombre}</span>
            <div style="display:flex; align-items:center; gap:10px;"><span>$${(item.precio * item.cantidad).toLocaleString()}</span>
            <button class="btn-del-item" onclick="removeItem('${dest}', ${item.indices[item.indices.length-1]})">✕</button></div></div>`;
    });

    html += `</div>
        <div class="payment-selector">
            <button class="pay-btn ${metodoPagoSeleccionado === 'Efectivo' ? 'selected' : ''}" onclick="setMetodoPago('Efectivo')">💵 EFECTIVO</button>
            <button class="pay-btn ${metodoPagoSeleccionado === 'Transferencia' ? 'selected' : ''}" onclick="setMetodoPago('Transferencia')">📱 TRANSFERENCIA</button>
        </div>
        <div class="summary-total"><span>TOTAL</span><span>$${total.toLocaleString()}</span></div>
        <button class="btn-action" style="background:var(--success); color:#000;" onclick="clearOrder('${dest}')">FINALIZAR</button></div>`;
    
    document.getElementById('summary-container').innerHTML = html;
}

function removeItem(dest, index) { 
    const item = Cuentas[dest][index];
    const bebidaEnInv = DB.bebidas_inv.find(b => b.nombre === item.nombre);
    if (bebidaEnInv) bebidaEnInv.cantidad += 1;
    Cuentas[dest].splice(index, 1); 
    renderOrderSummary(dest); 
}

function clearOrder(dest) { 
    const itemsVendidos = Cuentas[dest] || [];
    const total = itemsVendidos.reduce((sum, i) => sum + i.precio, 0);
    if (total === 0) return;

    if (confirm(`¿Finalizar cuenta de ${dest}?\nTotal: $${total.toLocaleString()}\nPago: ${metodoPagoSeleccionado}`)) { 
        
        VentasHistoricas.push({
            destino: dest,
            total: total,
            metodo: metodoPagoSeleccionado,
            hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            items: [...itemsVendidos] 
        });

        Cuentas[dest] = []; 
        metodoPagoSeleccionado = 'Efectivo'; 
        openModule('pizzas'); 
    } 
}

// --- LÓGICA DE PIZZAS Y SABORES ---
function renderPizzaFlavorSelector(dest, pizzaNombre, precio) {
    const container = document.getElementById('product-list-container');
    let html = `<div class="flavor-selection-box"><h4 class="accent">Sabores: ${pizzaNombre}</h4><div class="flavor-list">`;
    DB.sabores_pizzas.forEach(s => {
        html += `<div class="flavor-item-check"><input type="checkbox" id="ps-${s.id}" value="${s.nombre}" class="pizza-flavor-cb"><label for="ps-${s.id}">${s.nombre}</label></div>`;
    });
    html += `</div><button class="btn-action" onclick="confirmarPizzaCompleta('${dest}', '${pizzaNombre}', ${precio})">CONFIRMAR</button></div>`;
    container.innerHTML = html;
}

function confirmarPizzaCompleta(dest, pizzaNombre, precio) {
    const selected = Array.from(document.querySelectorAll('.pizza-flavor-cb:checked')).map(cb => cb.value);
    if (selected.length === 0 || selected.length > 2) { alert("Selecciona 1 o 2 sabores."); return; }
    addItemToOrder(dest, `${pizzaNombre} (${selected.join(" / ")})`, precio);
}

function renderFlavorSelector(container, dest) {
    let html = `<div class="flavor-list">`;
    DB.sabores_pizzas.forEach(s => {
        html += `<div class="flavor-item"><div><h4>${s.nombre}</h4><span class="accent">$${s.precio.toLocaleString()}</span></div>
            <div class="flavor-qty"><button class="btn-nav" onclick="updateFlavorQty(${s.id}, -1)">-</button><span class="qty-number" id="f-${s.id}">0</span><button class="btn-nav" onclick="updateFlavorQty(${s.id}, 1)">+</button></div></div>`;
    });
    container.innerHTML = html + `</div><button class="btn-action" onclick="savePortions('${dest}')">CONFIRMAR</button>`;
}

function updateFlavorQty(id, d) {
    const el = document.getElementById(`f-${id}`);
    let val = parseInt(el.innerText) + d;
    if (val >= 0) el.innerText = val;
}

function savePortions(dest) {
    if (!Cuentas[dest]) Cuentas[dest] = [];
    DB.sabores_pizzas.forEach(s => {
        const el = document.getElementById(`f-${s.id}`);
        if(el && parseInt(el.innerText) > 0) {
            for(let i=0; i < parseInt(el.innerText); i++) Cuentas[dest].push({ nombre: `Porción ${s.nombre}`, precio: s.precio });
            el.innerText = 0;
        }
    });
    renderOrderSummary(dest);
}

// --- MÓDULO DE INVENTARIO ---
function renderInventory(container, tabla) {
    const data = DB[tabla];
    let html = `<div class="inventory-form glass-card"><input type="text" id="inv-nombre" placeholder="Producto"><input type="number" id="inv-cantidad" placeholder="Stock"><input type="number" id="inv-precio" placeholder="Costo"><button class="btn-nav neon-btn" onclick="addToInventory('${tabla}')">+</button></div>
        <div style="overflow-x:auto;"><table><thead><tr><th>Producto</th><th>Stock</th><th>Estado</th><th>Acción</th></tr></thead><tbody>`;
    data.forEach((item, index) => {
        const isAgotado = item.cantidad <= 0;
        html += `<tr style="${isAgotado ? 'opacity: 0.5;' : ''}"><td>${item.nombre}</td>
            <td><input type="number" value="${item.cantidad}" class="inv-input-inline" onchange="updateInvQty('${tabla}', ${index}, this.value)"></td>
            <td><span class="${isAgotado ? 'text-danger' : 'text-success'}" style="font-size: 0.7rem; font-weight: bold;">${isAgotado ? '● AGOTADO' : '● DISPONIBLE'}</span></td>
            <td><button class="btn-del" onclick="deleteFromInventory('${tabla}', ${index})">🗑️</button></td></tr>`;
    });
    container.innerHTML = html + `</tbody></table></div><div class="inv-total">TOTAL: $${data.reduce((t, i) => t + (i.cantidad * (i.precio || 0)), 0).toLocaleString()}</div>`;
}

function updateInvQty(t, idx, val) { DB[t][idx].cantidad = parseInt(val) || 0; renderInventory(document.getElementById('module-content'), t); }
function deleteFromInventory(t, idx) { if(confirm("¿Eliminar?")) { DB[t].splice(idx, 1); renderInventory(document.getElementById('module-content'), t); } }
function addToInventory(t) {
    const n = document.getElementById('inv-nombre').value, c = parseInt(document.getElementById('inv-cantidad').value), p = parseInt(document.getElementById('inv-precio').value);
    if (n && !isNaN(c)) { DB[t].push({ id: Date.now(), nombre: n, cantidad: c, precio: p || 0 }); renderInventory(document.getElementById('module-content'), t); }
}