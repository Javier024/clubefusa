// js/historial.js
let jugadores = [];
let pagos = [];

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
    
    loadJugadoresList();
  } catch (error) {
    console.error('Error loading data:', error);
    showNotification('Error al cargar los datos', 'error');
  }
}

function loadJugadoresList() {
  const lista = document.getElementById('listaJugadores');
  lista.innerHTML = jugadores.map(jugador => `
    <li class="p-3 border rounded hover:bg-gray-50 cursor-pointer transition" 
        onclick="selectJugador('${jugador.id}')">
      <div class="flex justify-between items-center">
        <div>
          <strong>${jugador.nombre} ${jugador.apellido}</strong>
          <span class="text-gray-500 text-sm ml-2">(${jugador.categoria})</span>
        </div>
        <i class="fas fa-chevron-right text-gray-400"></i>
      </div>
    </li>
  `).join('');
}

function selectJugador(jugadorId) {
  const jugador = jugadores.find(j => j.id === jugadorId);
  if (!jugador) return;
  
  // Actualizar información del jugador
  document.getElementById('infoJugador').innerHTML = `
    <p><strong>Nombre:</strong> ${jugador.nombre} ${jugador.apellido}</p>
    <p><strong>Documento:</strong> ${jugador.documento || 'N/A'}</p>
    <p><strong>Categoría:</strong> ${jugador.categoria}</p>
    <p><strong>Fecha Inscripción:</strong> ${formatDate(jugador.fecha_inscripcion)}</p>
  `;
  
  // Cargar pagos del jugador
  const pagosJugador = pagos.filter(p => p.jugador_id === jugadorId);
  const listaPagos = document.getElementById('listaPagos');
  
  if (pagosJugador.length === 0) {
    listaPagos.innerHTML = '<li class="text-gray-500">No hay pagos registrados</li>';
  } else {
    listaPagos.innerHTML = pagosJugador.map(pago => `
      <li class="p-3 border rounded mb-2">
        <div class="flex justify-between items-start">
          <div>
            <p><strong>Fecha:</strong> ${formatDate(pago.fecha_pago)}</p>
            <p><strong>Periodo:</strong> ${pago.periodo || 'N/A'}</p>
            <p><strong>Monto:</strong> ${formatCurrency(pago.monto)}</p>
            <p><strong>Tipo:</strong> ${pago.tipo_pago}</p>
          </div>
          <span class="px-2 py-1 rounded text-xs ${
            pago.tipo_pago === 'COMPLETO' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
          }">
            ${pago.tipo_pago}
          </span>
        </div>
      </li>
    `).join('');
  }
}

function setupEventListeners() {
  // Buscar jugador
  document.getElementById('buscarJugador').addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredJugadores = jugadores.filter(jugador => 
      jugador.nombre.toLowerCase().includes(searchTerm) ||
      jugador.apellido.toLowerCase().includes(searchTerm) ||
      jugador.documento.toLowerCase().includes(searchTerm)
    );
    
    const lista = document.getElementById('listaJugadores');
    if (filteredJugadores.length === 0) {
      lista.innerHTML = '<li class="text-gray-500 p-3">No se encontraron jugadores</li>';
    } else {
      lista.innerHTML = filteredJugadores.map(jugador => `
        <li class="p-3 border rounded hover:bg-gray-50 cursor-pointer transition" 
            onclick="selectJugador('${jugador.id}')">
          <div class="flex justify-between items-center">
            <div>
              <strong>${jugador.nombre} ${jugador.apellido}</strong>
              <span class="text-gray-500 text-sm ml-2">(${jugador.categoria})</span>
            </div>
            <i class="fas fa-chevron-right text-gray-400"></i>
          </div>
        </li>
      `).join('');
    }
  });
}