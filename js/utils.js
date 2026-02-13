// js/utils.js
// Funciones de utilidad (SIN VERIFICACIÓN DE LOGIN)

// Formatear fecha
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
}

// Formatear moneda
function formatCurrency(amount) {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
    }).format(amount);
}

// Calcular edad
function calculateAge(birthDate) {
    if (!birthDate) return 'N/A';
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    
    return age + ' años';
}

// Paginación
function paginate(array, page, pageSize) {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return array.slice(startIndex, endIndex);
}

// Crear paginación
function createPagination(container, currentPage, totalPages, onPageChange) {
    container.innerHTML = '';
    
    if (totalPages <= 1) return;
    
    let html = '<div class="flex justify-center items-center space-x-2">';
    
    // Botón anterior
    html += `
        <button 
            onclick="changePage(${currentPage - 1})" 
            class="px-3 py-1 rounded ${currentPage === 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white border hover:bg-gray-50'}"
            ${currentPage === 1 ? 'disabled' : ''}
        >
            <i class="fas fa-chevron-left"></i>
        </button>
    `;
    
    // Números de página
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
            html += `
                <button 
                    onclick="changePage(${i})" 
                    class="px-3 py-1 rounded ${i === currentPage ? 'bg-blue-600 text-white' : 'bg-white border hover:bg-gray-50'}"
                >
                    ${i}
                </button>
            `;
        } else if (i === currentPage - 2 || i === currentPage + 2) {
            html += '<span class="px-2">...</span>';
        }
    }
    
    // Botón siguiente
    html += `
        <button 
            onclick="changePage(${currentPage + 1})" 
            class="px-3 py-1 rounded ${currentPage === totalPages ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white border hover:bg-gray-50'}"
            ${currentPage === totalPages ? 'disabled' : ''}
        >
            <i class="fas fa-chevron-right"></i>
        </button>
    `;
    
    html += '</div>';
    container.innerHTML = html;
    
    // Función global para cambiar página
    window.changePage = (page) => {
        if (page >= 1 && page <= totalPages) {
            onPageChange(page);
        }
    };
}

// Mostrar notificación
function showNotification(message, type = 'success') {
    const container = document.getElementById('notificationContainer');
    if (!container) return;
    
    const notification = document.createElement('div');
    notification.className = `notification p-4 rounded-lg shadow-lg mb-4 flex items-center justify-between ${
        type === 'success' ? 'bg-green-500 text-white' :
        type === 'error' ? 'bg-red-500 text-white' :
        type === 'warning' ? 'bg-yellow-500 text-white' :
        'bg-blue-500 text-white'
    }`;
    
    notification.innerHTML = `
        <div class="flex items-center">
            <i class="fas ${
                type === 'success' ? 'fa-check-circle' :
                type === 'error' ? 'fa-exclamation-circle' :
                type === 'warning' ? 'fa-exclamation-triangle' :
                'fa-info-circle'
            } mr-3"></i>
            <span>${message}</span>
        </div>
        <button onclick="this.parentElement.remove()" class="ml-4">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    container.appendChild(notification);
    
    // Auto remover después de 5 segundos
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// Generar ID único
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Validar email
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Validar teléfono (solo números y +)
function validatePhone(phone) {
    const re = /^\+?[0-9]+$/;
    return re.test(phone);
}

// Formatear número de documento
function formatDocument(doc) {
    if (!doc) return '';
    // Eliminar caracteres no numéricos excepto letras para NIT
    return doc.replace(/[^a-zA-Z0-9]/g, '');
}

// Descargar archivo
function downloadFile(data, filename, type = 'text/plain') {
    const blob = new Blob([data], { type });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

// Copiar al portapapeles
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showNotification('Copiado al portapapeles', 'success');
    } catch (err) {
        console.error('Error al copiar:', err);
        showNotification('Error al copiar al portapapeles', 'error');
    }
}

// Obtener diferencia en meses entre dos fechas
function getMonthDifference(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return (end.getFullYear() - start.getFullYear()) * 12 + 
           (end.getMonth() - start.getMonth());
}

// Obtener nombre del mes
function getMonthName(monthIndex) {
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                   'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return months[monthIndex] || '';
}

// Capitalizar primera letra
function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// Limpiar string (eliminar espacios extras)
function cleanString(str) {
    if (!str) return '';
    return str.trim().replace(/\s+/g, ' ');
}

// Verificar si es dispositivo móvil
function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Obtener parámetros de URL
function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// Confirmación personalizada
function customConfirm(message, callback) {
    if (confirm(message)) {
        callback();
    }
}

// Loading spinner
function showLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = '<div class="loading-spinner mx-auto"></div>';
    }
}

function hideLoading(elementId, content = '') {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = content;
    }
}

// Exportar a CSV
function exportToCSV(data, filename) {
    const csv = data.map(row => row.join(',')).join('\n');
    downloadFile(csv, filename, 'text/csv');
}

// Debounce para búsquedas
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}