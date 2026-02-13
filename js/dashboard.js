// js/dashboard.js
document.addEventListener('DOMContentLoaded', async () => {
    await loadDashboardData();
});

async function loadDashboardData() {
    try {
        const stats = await api.getEstadisticas();
        
        // Actualizar contadores
        document.getElementById('totalJugadores').textContent = stats.totalJugadores;
        document.getElementById('pagosMes').textContent = stats.pagosMes;
        document.getElementById('ingresos').textContent = formatCurrency(stats.ingresosMes);
        
        // Calcular deudores
        const jugadores = await api.getJugadores();
        const pagos = await api.getPagos();
        
        const deudores = jugadores.filter(jugador => {
            const pagosJugador = pagos.filter(p => p.jugador_id === jugador.id);
            if (pagosJugador.length === 0) return true;
            
            const ultimoPago = pagosJugador.sort((a, b) => 
                new Date(b.fecha_pago) - new Date(a.fecha_pago)
            )[0];
            
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