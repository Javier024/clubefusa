// js/alertas.js
let jugadores = [];
let pagos = [];

document.addEventListener('DOMContentLoaded', async () => {
  await loadData();
});

async function loadData() {
  try {
    [jugadores, pagos] = await Promise.all([
      api.getJugadores(),
      api.getPagos()
    ]);
    
    renderAlertas();
  } catch (error) {
    console.error('Error loading data:', error);
    showNotification('Error al cargar los datos', 'error');
  }
}

function renderAlertas() {
  const container = document.getElementById('alertasContainer');
  const deudores = getDeudores();
  
  if (deudores.length === 0) {
    container.innerHTML = `
      <div class="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <i class="fas fa-check-circle text-green-500 text-4xl mb-3"></i>
        <h3 class="text-lg font-semibold text-green-800">¡Excelente!</h3>
        <p class="text-green-600">No hay jugadores con pagos pendientes</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = deudores.map(alerta => `
    <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
      <div class="flex items-start">
        <div class="flex-shrink-0">
          <i class="fas fa-exclamation-triangle text-red-500 text-xl"></i>
        </div>
        <div class="ml-3 flex-1">
          <h3 class="text-sm font-medium text-red-800">
            ${alerta.jugador.nombre} ${alerta.jugador.apellido} - ${alerta.jugador.categoria}
          </h3>
          <div class="mt-2 text-sm text-red-700">
            <p><strong>Meses adeudados:</strong> ${alerta.mesesAdeudados}</p>
            <p><strong>Último pago:</strong> ${alerta.ultimoPago ? formatDate(alerta.ultimoPago.fecha_pago) : 'Nunca ha pagado'}</p>
            <p><strong>Teléfono:</strong> ${alerta.jugador.telefono || 'N/A'}</p>
            <p><strong>Teléfono acudiente:</strong> ${alerta.jugador.telefono_padre || 'N/A'}</p>
          </div>
          <div class="mt-3 flex space-x-2">
            <button onclick="contactar('${alerta.jugador.id}')" class="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition">
              <i class="fas fa-phone mr-1"></i> Contactar
            </button>
            <button onclick="verHistorial('${alerta.jugador.id}')" class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition">
              <i class="fas fa-history mr-1"></i> Ver Historial
            </button>
            <button onclick="registrarPago('${alerta.jugador.id}')" class="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition">
              <i class="fas fa-money-bill mr-1"></i> Registrar Pago
            </button>
          </div>
        </div>
      </div>
    </div>
  `).join('');
  
  // Actualizar contador
  document.getElementById('contadorAlertas').textContent = deudores.length;
}

function getDeudores() {
  const deudores = [];
  
  jugadores.forEach(jugador => {
    const pagosJugador = pagos.filter(p => p.jugador_id === jugador.id);
    
    if (pagosJugador.length === 0) {
      // Nunca ha pagado
      deudores.push({
        jugador,
        ultimoPago: null,
        mesesAdeudados: 'Todos los meses'
      });
    } else {
      // Verificar si tiene pagos atrasados
      const ultimoPago = pagosJugador.sort((a, b) => new Date(b.fecha_pago) - new Date(a.fecha_pago))[0];
      const fechaPago = new Date(ultimoPago.fecha_pago);
      const hoy = new Date();
      
      const mesesDiferencia = (hoy.getFullYear() - fechaPago.getFullYear()) * 12 + 
                             (hoy.getMonth() - fechaPago.getMonth());
      
      if (mesesDiferencia > 1) {
        deudores.push({
          jugador,
          ultimoPago,
          mesesAdeudados: `${mesesDiferencia - 1} mes(es)`
        });
      }
    }
  });
  
  return deudores;
}

function contactar(jugadorId) {
  const jugador = jugadores.find(j => j.id === jugadorId);
  if (!jugador) return;
  
  const mensaje = `Recordatorio de pago:\n\nEstimado(a) ${jugador.nombre} ${jugador.apellido},\n\nLe recordamos que tiene pagos pendientes en la escuela de fútbol EFUSA. Por favor, regularice su situación a la brevedad.\n\nGracias por su comprensión.`;
  
  // Copiar mensaje al portapapeles
  navigator.clipboard.writeText(mensaje).then(() => {
    showNotification('Mensaje copiado al portapapeles', 'success');
  });
  
  // Abrir WhatsApp si hay número
  if (jugador.telefono) {
    const whatsappUrl = `https://wa.me/57${jugador.telefono.replace(/\D/g, '')}?text=${encodeURIComponent(mensaje)}`;
    window.open(whatsappUrl, '_blank');
  }
}

function verHistorial(jugadorId) {
  // Redirigir a historial.html con el ID del jugador
  window.location.href = `historial.html?jugador=${jugadorId}`;
}

function registrarPago(jugadorId) {
  // Redirigir a pagos.html con el ID del jugador preseleccionado
  window.location.href = `pagos.html?jugador=${jugadorId}`;
}