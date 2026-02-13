// js/pagos.js
let pagos = [];
let jugadores = [];
let currentPage = 1;
const pageSize = 10;

document.addEventListener('DOMContentLoaded', async () => {
  await loadData();
  setupEventListeners();
});

async function loadData() {
  try {
    [jugadores, pagos] = await Promise.all([
      api.getJugadores(),
      api.getPagos()
    ]);
    
    loadJugadoresOptions();
    renderPagos();
    renderPagination();
  } catch (error) {
    console.error('Error loading data:', error);
    showNotification('Error al cargar los datos', 'error');
  }
}

function loadJugadoresOptions() {
  const select = document.getElementById('jugador');
  select.innerHTML = '<option value="">Seleccione jugador</option>';
  
  jugadores.forEach(jugador => {
    const option = document.createElement('option');
    option.value = jugador.id;
    option.textContent = `${jugador.nombre} ${jugador.apellido} - ${jugador.categoria}`;
    select.appendChild(option);
  });
}

function renderPagos() {
  const tbody = document.getElementById('tablaPagos');
  const paginatedPagos = paginate(pagos, currentPage, pageSize);
  
  tbody.innerHTML = paginatedPagos.map(pago => {
    const jugador = jugadores.find(j => j.id === pago.jugador_id);
    return `
      <tr class="border-b hover:bg-gray-50">
        <td class="p-2">${jugador ? `${jugador.nombre} ${jugador.apellido}` : 'N/A'}</td>
        <td class="p-2">${formatDate(pago.fecha_pago)}</td>
        <td class="p-2">${pago.periodo || 'N/A'}</td>
        <td class="p-2">${formatCurrency(pago.monto)}</td>
        <td class="p-2">
          <span class="px-2 py-1 rounded text-xs ${
            pago.tipo_pago === 'COMPLETO' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
          }">
            ${pago.tipo_pago}
          </span>
        </td>
        <td class="p-2">
          <button onclick="verPago('${pago.id}')" class="text-blue-600 hover:text-blue-800 mr-2">
            <i class="fas fa-eye"></i>
          </button>
          <button onclick="eliminarPago('${pago.id}')" class="text-red-600 hover:text-red-800">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

function renderPagination() {
  const container = document.getElementById('paginacionPagos');
  const totalPages = Math.ceil(pagos.length / pageSize);
  
  createPagination(container, currentPage, totalPages, (page) => {
    currentPage = page;
    renderPagos();
  });
}

function setupEventListeners() {
  document.getElementById('formPago').addEventListener('submit', async (e) => {
    e.preventDefault();
    await registrarPago();
  });
}

async function registrarPago() {
  const pago = {
    id: generateId(),
    jugador_id: document.getElementById('jugador').value,
    fecha_pago: document.getElementById('fecha_pago').value,
    mes_inicio: document.getElementById('mes_inicio').value,
    meses_pagados: document.getElementById('meses_pagados').value,
    tipo_pago: document.getElementById('tipo_pago').value,
    monto: 50000 * parseInt(document.getElementById('meses_pagados').value), // Ejemplo: $50,000 por mes
    period: generatePeriod(
      document.getElementById('mes_inicio').value,
      parseInt(document.getElementById('meses_pagados').value)
    )
  };
  
  try {
    // Aquí iría la llamada a la API para guardar
    showNotification('Pago registrado exitosamente');
    document.getElementById('formPago').reset();
    await loadData();
  } catch (error) {
    console.error('Error saving pago:', error);
    showNotification('Error al registrar el pago', 'error');
  }
}

function verPago(id) {
  const pago = pagos.find(p => p.id === id);
  if (!pago) return;
  
  const jugador = jugadores.find(j => j.id === pago.jugador_id);
  
  alert(`
    Detalles del Pago:
    Jugador: ${jugador ? `${jugador.nombre} ${jugador.apellido}` : 'N/A'}
    Fecha: ${formatDate(pago.fecha_pago)}
    Periodo: ${pago.periodo || 'N/A'}
    Monto: ${formatCurrency(pago.monto)}
    Tipo: ${pago.tipo_pago}
  `);
}

function eliminarPago(id) {
  if (!confirm('¿Estás seguro de eliminar este pago?')) return;
  
  try {
    // Aquí iría la llamada a la API para eliminar
    showNotification('Pago eliminado exitosamente');
    loadData();
  } catch (error) {
    console.error('Error deleting pago:', error);
    showNotification('Error al eliminar el pago', 'error');
  }
}

function generatePeriod(startDate, months) {
  const date = new Date(startDate);
  const endDate = new Date(date);
  endDate.setMonth(endDate.getMonth() + months - 1);
  
  return `${date.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })} - ${endDate.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })}`;
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}