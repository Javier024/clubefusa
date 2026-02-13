// js/dashboard.js
document.addEventListener('DOMContentLoaded', async () => {
  await loadDashboardData();
});

async function loadDashboardData() {
  try {
    // Cargar jugadores
    const jugadores = await api.getJugadores();
    document.getElementById('totalJugadores').textContent = jugadores.length;
    
    // Cargar pagos
    const pagos = await api.getPagos();
    const totalPagos = pagos.reduce((sum, pago) => {
      const monto = parseFloat(pago.monto) || 0;
      return sum + monto;
    }, 0);
    document.getElementById('totalPagos').textContent = formatCurrency(totalPagos);
    
    // Calcular deudores
    const deudores = jugadores.filter(jugador => {
      const ultimoPago = pagos.find(pago => pago.jugador_id === jugador.id);
      if (!ultimoPago) return true;
      
      const fechaPago = new Date(ultimoPago.fecha_pago);
      const hoy = new Date();
      const mesesDiferencia = (hoy.getFullYear() - fechaPago.getFullYear()) * 12 + 
                             (hoy.getMonth() - fechaPago.getMonth());
      
      return mesesDiferencia > 1;
    });
    
    document.getElementById('deudores').textContent = deudores.length;
    
  } catch (error) {
    console.error('Error loading dashboard data:', error);
    showNotification('Error al cargar los datos del dashboard', 'error');
  }
}