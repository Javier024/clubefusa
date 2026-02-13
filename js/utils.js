// js/utils.js
// Funciones utilitarias

function logout() {
  localStorage.removeItem("auth");
  location.href = "login.html";
}

function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES');
}

function formatCurrency(amount) {
  if (!amount) return '$0';
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP'
  }).format(amount);
}

function calculateAge(birthDate) {
  if (!birthDate) return 0;
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
}

function showNotification(message, type = 'success') {
  const notification = document.createElement('div');
  notification.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${
    type === 'success' ? 'bg-green-500' : 
    type === 'error' ? 'bg-red-500' : 
    'bg-blue-500'
  } text-white`;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transition = 'opacity 0.5s';
    setTimeout(() => notification.remove(), 500);
  }, 3000);
}

function paginate(array, page, pageSize) {
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  return array.slice(startIndex, endIndex);
}

function createPagination(container, currentPage, totalPages, callback) {
  container.innerHTML = '';
  
  if (totalPages <= 1) return;
  
  const pagination = document.createElement('div');
  pagination.className = 'flex justify-center space-x-2';
  
  // Botón anterior
  const prevBtn = document.createElement('button');
  prevBtn.className = `px-3 py-1 rounded ${
    currentPage === 1 ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 text-white'
  }`;
  prevBtn.textContent = 'Anterior';
  prevBtn.disabled = currentPage === 1;
  prevBtn.onclick = () => callback(currentPage - 1);
  pagination.appendChild(prevBtn);
  
  // Números de página
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      const pageBtn = document.createElement('button');
      pageBtn.className = `px-3 py-1 rounded ${
        i === currentPage ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'
      }`;
      pageBtn.textContent = i;
      pageBtn.onclick = () => callback(i);
      pagination.appendChild(pageBtn);
    } else if (i === currentPage - 2 || i === currentPage + 2) {
      const dots = document.createElement('span');
      dots.className = 'px-2';
      dots.textContent = '...';
      pagination.appendChild(dots);
    }
  }
  
  // Botón siguiente
  const nextBtn = document.createElement('button');
  nextBtn.className = `px-3 py-1 rounded ${
    currentPage === totalPages ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 text-white'
  }`;
  nextBtn.textContent = 'Siguiente';
  nextBtn.disabled = currentPage === totalPages;
  nextBtn.onclick = () => callback(currentPage + 1);
  pagination.appendChild(nextBtn);
  
  container.appendChild(pagination);
}