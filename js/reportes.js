// js/reportes.js
let jugadores = [];
let pagos = [];

document.addEventListener('DOMContentLoaded', async () => {
  await loadData();
  loadCategorias();
});

async function loadData() {
  try {
    [jugadores, pagos] = await Promise.all([
      api.getJugadores(),
      api.getPagos()
    ]);
  } catch (error) {
    console.error('Error loading data:', error);
    showNotification('Error al cargar los datos', 'error');
  }
}

function loadCategorias() {
  const categorias = ['todas', 'Sub 18-17', 'Sub 16-15', 'Sub 14-13', 'Sub 12-11', 'Sub 10-9', 'Sub 8-7'];
  const select = document.getElementById('categoria');
  
  categorias.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat === 'todas' ? 'Todas las categorías' : cat;
    select.appendChild(option);
  });
}

function exportarExcel() {
  const categoria = document.getElementById('categoria').value;
  
  // Filtrar datos
  let filteredJugadores = jugadores;
  if (categoria !== 'todas') {
    filteredJugadores = jugadores.filter(j => j.categoria === categoria);
  }
  
  // Preparar datos para Excel
  const data = [];
  
  // Encabezados
  data.push([
    'ID',
    'Nombre',
    'Apellido',
    'Documento',
    'Fecha Nacimiento',
    'Edad',
    'Categoría',
    'Teléfono',
    'Email',
    'Dirección',
    'Nombre Padre',
    'Teléfono Padre',
    'Fecha Inscripción',
    'Estado',
    'Total Pagado',
    'Último Pago'
  ]);
  
  // Filas de datos
  filteredJugadores.forEach(jugador => {
    const pagosJugador = pagos.filter(p => p.jugador_id === jugador.id);
    const totalPagado = pagosJugador.reduce((sum, pago) => {
      const monto = parseFloat(pago.monto) || 0;
      return sum + monto;
    }, 0);
    
    const ultimoPago = pagosJugador.length > 0 
      ? pagosJugador.sort((a, b) => new Date(b.fecha_pago) - new Date(a.fecha_pago))[0].fecha_pago
      : 'N/A';
    
    data.push([
      jugador.id || '',
      jugador.nombre || '',
      jugador.apellido || '',
      jugador.documento || '',
      jugador.fecha_nacimiento || '',
      calculateAge(jugador.fecha_nacimiento),
      jugador.categoria || '',
      jugador.telefono || '',
      jugador.email || '',
      jugador.direccion || '',
      jugador.nombre_padre || '',
      jugador.telefono_padre || '',
      jugador.fecha_inscripcion || '',
      jugador.activo === 'true' ? 'Activo' : 'Inactivo',
      totalPagado,
      ultimoPago
    ]);
  });
  
  // Crear libro de Excel
  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Jugadores');
  
  // Descargar archivo
  const fileName = `reporte_jugadores_${categoria === 'todas' ? 'todas' : categoria}_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, fileName);
  
  showNotification('Reporte Excel generado exitosamente');
}

function exportarPDF() {
  const { jsPDF } = window.jspdf;
  const categoria = document.getElementById('categoria').value;
  
  // Filtrar datos
  let filteredJugadores = jugadores;
  if (categoria !== 'todas') {
    filteredJugadores = jugadores.filter(j => j.categoria === categoria);
  }
  
  // Crear documento PDF
  const doc = new jsPDF();
  
  // Título
  doc.setFontSize(16);
  doc.text(`Reporte de Jugadores - ${categoria === 'todas' ? 'Todas las categorías' : categoria}`, 14, 15);
  
  // Fecha
  doc.setFontSize(10);
  doc.text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, 14, 25);
  
  // Tabla
  let yPosition = 35;
  doc.setFontSize(10);
  
  // Encabezados de tabla
  const headers = ['Nombre', 'Documento', 'Categoría', 'Teléfono', 'Estado'];
  const columnWidths = [50, 30, 30, 30, 20];
  let xPosition = 14;
  
  headers.forEach((header, index) => {
    doc.text(header, xPosition, yPosition);
    xPosition += columnWidths[index];
  });
  
  yPosition += 10;
  
  // Filas de datos
  filteredJugadores.forEach(jugador => {
    if (yPosition > 270) {
      doc.addPage();
      yPosition = 20;
    }
    
    xPosition = 14;
    const rowData = [
      `${jugador.nombre} ${jugador.apellido}`.substring(0, 20),
      jugador.documento || 'N/A',
      jugador.categoria || 'N/A',
      jugador.telefono || 'N/A',
      jugador.activo === 'true' ? 'Activo' : 'Inactivo'
    ];
    
    rowData.forEach((data, index) => {
      doc.text(data, xPosition, yPosition);
      xPosition += columnWidths[index];
    });
    
    yPosition += 8;
  });
  
  // Descargar PDF
  const fileName = `reporte_jugadores_${categoria === 'todas' ? 'todas' : categoria}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
  
  showNotification('Reporte PDF generado exitosamente');
}