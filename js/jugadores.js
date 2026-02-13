// js/jugadores.js
let jugadores = [];
let currentPage = 1;
const pageSize = 10;

document.addEventListener('DOMContentLoaded', async () => {
  await loadJugadores();
  setupEventListeners();
});

async function loadJugadores() {
  try {
    jugadores = await api.getJugadores();
    renderJugadores();
    renderPagination();
    loadCategorias();
  } catch (error) {
    console.error('Error loading jugadores:', error);
    showNotification('Error al cargar los jugadores', 'error');
  }
}

function renderJugadores() {
  const tbody = document.getElementById('tablaJugadores');
  const searchTerm = document.getElementById('busquedaJugador').value.toLowerCase();
  const categoriaFilter = document.getElementById('filtroCategoria').value;
  
  let filteredJugadores = jugadores.filter(jugador => {
    const matchesSearch = !searchTerm || 
      jugador.nombre.toLowerCase().includes(searchTerm) ||
      jugador.apellido.toLowerCase().includes(searchTerm) ||
      jugador.documento.toLowerCase().includes(searchTerm);
    
    const matchesCategoria = !categoriaFilter || 
      jugador.categoria === categoriaFilter;
    
    return matchesSearch && matchesCategoria;
  });
  
  const paginatedJugadores = paginate(filteredJugadores, currentPage, pageSize);
  
  tbody.innerHTML = paginatedJugadores.map(jugador => `
    <tr class="border-b hover:bg-gray-50">
      <td class="p-2">${jugador.documento || 'N/A'}</td>
      <td class="p-2">${jugador.nombre} ${jugador.apellido}</td>
      <td class="p-2">${calculateAge(jugador.fecha_nacimiento)}</td>
      <td class="p-2">${jugador.categoria || 'N/A'}</td>
      <td class="p-2">${jugador.telefono || 'N/A'}</td>
      <td class="p-2">${formatDate(jugador.fecha_inscripcion)}</td>
      <td class="p-2">
        <span class="px-2 py-1 rounded text-xs ${
          jugador.activo === 'true' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }">
          ${jugador.activo === 'true' ? 'Activo' : 'Inactivo'}
        </span>
      </td>
      <td class="p-2">
        <button onclick="verJugador('${jugador.id}')" class="text-blue-600 hover:text-blue-800 mr-2">
          <i class="fas fa-eye"></i>
        </button>
        <button onclick="editarJugador('${jugador.id}')" class="text-green-600 hover:text-green-800 mr-2">
          <i class="fas fa-edit"></i>
        </button>
        <button onclick="eliminarJugador('${jugador.id}')" class="text-red-600 hover:text-red-800">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    </tr>
  `).join('');
}

function renderPagination() {
  const container = document.getElementById('paginacionJugadores');
  const totalPages = Math.ceil(jugadores.length / pageSize);
  
  createPagination(container, currentPage, totalPages, (page) => {
    currentPage = page;
    renderJugadores();
  });
}

function setupEventListeners() {
  // Búsqueda
  document.getElementById('busquedaJugador').addEventListener('input', () => {
    currentPage = 1;
    renderJugadores();
    renderPagination();
  });
  
  // Filtro por categoría
  document.getElementById('filtroCategoria').addEventListener('change', () => {
    currentPage = 1;
    renderJugadores();
    renderPagination();
  });
  
  // Formulario
  document.getElementById('formJugador').addEventListener('submit', async (e) => {
    e.preventDefault();
    await guardarJugador();
  });
}

function nuevoJugador() {
  document.getElementById('tituloModalJugador').textContent = 'Nuevo Jugador';
  document.getElementById('formJugador').reset();
  document.getElementById('jugadorId').value = '';
  document.getElementById('fechaInscripcion').value = new Date().toISOString().split('T')[0];
  document.getElementById('modalJugador').style.display = 'flex';
}

function editarJugador(id) {
  const jugador = jugadores.find(j => j.id === id);
  if (!jugador) return;
  
  document.getElementById('tituloModalJugador').textContent = 'Editar Jugador';
  document.getElementById('jugadorId').value = jugador.id;
  document.getElementById('nombre').value = jugador.nombre;
  document.getElementById('apellido').value = jugador.apellido;
  document.getElementById('documento').value = jugador.documento;
  document.getElementById('fechaNacimiento').value = jugador.fecha_nacimiento;
  document.getElementById('categoria').value = jugador.categoria;
  document.getElementById('telefono').value = jugador.telefono;
  document.getElementById('email').value = jugador.email;
  document.getElementById('direccion').value = jugador.direccion;
  document.getElementById('nombrePadre').value = jugador.nombre_padre;
  document.getElementById('telefonoPadre').value = jugador.telefono_padre;
  document.getElementById('fechaInscripcion').value = jugador.fecha_inscripcion;
  document.getElementById('activo').checked = jugador.activo === 'true';
  
  document.getElementById('modalJugador').style.display = 'flex';
}

async function guardarJugador() {
  const jugador = {
    id: document.getElementById('jugadorId').value || generateId(),
    nombre: document.getElementById('nombre').value,
    apellido: document.getElementById('apellido').value,
    documento: document.getElementById('documento').value,
    fecha_nacimiento: document.getElementById('fechaNacimiento').value,
    categoria: document.getElementById('categoria').value,
    telefono: document.getElementById('telefono').value,
    email: document.getElementById('email').value,
    direccion: document.getElementById('direccion').value,
    nombre_padre: document.getElementById('nombrePadre').value,
    telefono_padre: document.getElementById('telefonoPadre').value,
    fecha_inscripcion: document.getElementById('fechaInscripcion').value,
    activo: document.getElementById('activo').checked ? 'true' : 'false'
  };
  
  try {
    // Aquí iría la llamada a la API para guardar
    showNotification('Jugador guardado exitosamente');
    cerrarModalJugador();
    await loadJugadores();
  } catch (error) {
    console.error('Error saving jugador:', error);
    showNotification('Error al guardar el jugador', 'error');
  }
}

function verJugador(id) {
  const jugador = jugadores.find(j => j.id === id);
  if (!jugador) return;
  
  document.getElementById('verNombre').textContent = `${jugador.nombre} ${jugador.apellido}`;
  document.getElementById('verDocumento').textContent = jugador.documento || 'N/A';
  document.getElementById('verFechaNacimiento').textContent = formatDate(jugador.fecha_nacimiento);
  document.getElementById('verEdad').textContent = calculateAge(jugador.fecha_nacimiento);
  document.getElementById('verCategoria').textContent = jugador.categoria || 'N/A';
  document.getElementById('verTelefono').textContent = jugador.telefono || 'N/A';
  document.getElementById('verEmail').textContent = jugador.email || 'N/A';
  document.getElementById('verDireccion').textContent = jugador.direccion || 'N/A';
  document.getElementById('verNombrePadre').textContent = jugador.nombre_padre || 'N/A';
  document.getElementById('verTelefonoPadre').textContent = jugador.telefono_padre || 'N/A';
  document.getElementById('verFechaInscripcion').textContent = formatDate(jugador.fecha_inscripcion);
  document.getElementById('verEstado').textContent = jugador.activo === 'true' ? 'Activo' : 'Inactivo';
  
  document.getElementById('modalVerJugador').style.display = 'flex';
}

function eliminarJugador(id) {
  if (!confirm('¿Estás seguro de eliminar este jugador?')) return;
  
  try {
    // Aquí iría la llamada a la API para eliminar
    showNotification('Jugador eliminado exitosamente');
    loadJugadores();
  } catch (error) {
    console.error('Error deleting jugador:', error);
    showNotification('Error al eliminar el jugador', 'error');
  }
}

function cerrarModalJugador() {
  document.getElementById('modalJugador').style.display = 'none';
}

function cerrarModalVerJugador() {
  document.getElementById('modalVerJugador').style.display = 'none';
}

function loadCategorias() {
  const categorias = ['Sub 18-17', 'Sub 16-15', 'Sub 14-13', 'Sub 12-11', 'Sub 10-9', 'Sub 8-7'];
  const filtro = document.getElementById('filtroCategoria');
  
  categorias.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    filtro.appendChild(option);
  });
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}