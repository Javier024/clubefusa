// js/api.js
// API para interactuar con Google Sheets

class API {
    constructor() {
        this.baseUrl = CONFIG.BASE_URL;
        this.spreadsheetId = CONFIG.SPREADSHEET_ID;
        this.apiKey = CONFIG.API_KEY;
    }

    // Obtener datos de una hoja
    async getSheetData(sheetName) {
        try {
            const url = `${this.baseUrl}/${this.spreadsheetId}/values/${sheetName}?key=${this.apiKey}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (!data.values || data.values.length === 0) {
                return [];
            }
            
            // Convertir a array de objetos
            const headers = data.values[0];
            const rows = data.values.slice(1);
            
            return rows.map(row => {
                const obj = {};
                headers.forEach((header, index) => {
                    obj[header.toLowerCase().replace(/\s+/g, '_')] = row[index] || '';
                });
                return obj;
            });
        } catch (error) {
            console.error('Error fetching sheet data:', error);
            throw error;
        }
    }

    // Obtener jugadores
    async getJugadores() {
        return this.getSheetData('Jugadores');
    }

    // Obtener pagos
    async getPagos() {
        return this.getSheetData('Pagos');
    }

    // Obtener categorías
    async getCategorias() {
        return this.getSheetData('Categorias');
    }

    // Guardar datos en una hoja
    async saveSheetData(sheetName, data) {
        try {
            // Convertir datos a formato de Google Sheets
            const headers = Object.keys(data[0] || {});
            const rows = data.map(item => headers.map(header => item[header] || ''));
            
            // Agregar headers al principio
            const values = [headers, ...rows];
            
            const url = `${this.baseUrl}/${this.spreadsheetId}/values/${sheetName}?valueInputOption=USER_ENTERED&key=${this.apiKey}`;
            
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    values: values
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error saving sheet data:', error);
            throw error;
        }
    }

    // Agregar una fila a una hoja
    async appendRow(sheetName, rowData) {
        try {
            const url = `${this.baseUrl}/${this.spreadsheetId}/values/${sheetName}:append?valueInputOption=USER_ENTERED&key=${this.apiKey}`;
            
            const values = [Object.values(rowData)];
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    values: values
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error appending row:', error);
            throw error;
        }
    }

    // Actualizar una fila específica
    async updateRow(sheetName, rowIndex, rowData) {
        try {
            const range = `${sheetName}!A${rowIndex + 1}:${String.fromCharCode(65 + Object.keys(rowData).length - 1)}${rowIndex + 1}`;
            const url = `${this.baseUrl}/${this.spreadsheetId}/values/${range}?valueInputOption=USER_ENTERED&key=${this.apiKey}`;
            
            const values = [Object.values(rowData)];
            
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    values: values
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error updating row:', error);
            throw error;
        }
    }

    // Eliminar una fila (implementación básica - limpia la fila)
    async deleteRow(sheetName, rowIndex, numColumns) {
        try {
            const range = `${sheetName}!A${rowIndex + 1}:${String.fromCharCode(65 + numColumns - 1)}${rowIndex + 1}`;
            const url = `${this.baseUrl}/${this.spreadsheetId}/values/${range}?valueInputOption=USER_ENTERED&key=${this.apiKey}`;
            
            const values = [Array(numColumns).fill('')];
            
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    values: values
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error deleting row:', error);
            throw error;
        }
    }

    // Buscar jugador por ID
    async getJugadorById(id) {
        const jugadores = await this.getJugadores();
        return jugadores.find(j => j.id === id);
    }

    // Buscar pagos por jugador ID
    async getPagosByJugadorId(jugadorId) {
        const pagos = await this.getPagos();
        return pagos.filter(p => p.jugador_id === jugadorId);
    }

    // Guardar jugador
    async saveJugador(jugador) {
        try {
            // En una implementación real, aquí buscarías si el jugador ya existe
            // y harías un update o append según corresponda
            return await this.appendRow('Jugadores', jugador);
        } catch (error) {
            console.error('Error saving jugador:', error);
            throw error;
        }
    }

    // Guardar pago
    async savePago(pago) {
        try {
            return await this.appendRow('Pagos', pago);
        } catch (error) {
            console.error('Error saving pago:', error);
            throw error;
        }
    }

    // Obtener estadísticas
    async getEstadisticas() {
        try {
            const [jugadores, pagos] = await Promise.all([
                this.getJugadores(),
                this.getPagos()
            ]);
            
            const stats = {
                totalJugadores: jugadores.length,
                jugadoresActivos: jugadores.filter(j => j.activo === 'true').length,
                totalPagos: pagos.length,
                ingresosTotales: pagos.reduce((sum, pago) => {
                    const monto = parseFloat(pago.monto) || 0;
                    return sum + monto;
                }, 0),
                pagosMes: pagos.filter(pago => {
                    const fechaPago = new Date(pago.fecha_pago);
                    const hoy = new Date();
                    return fechaPago.getMonth() === hoy.getMonth() && 
                           fechaPago.getFullYear() === hoy.getFullYear();
                }).length,
                ingresosMes: pagos.filter(pago => {
                    const fechaPago = new Date(pago.fecha_pago);
                    const hoy = new Date();
                    return fechaPago.getMonth() === hoy.getMonth() && 
                           fechaPago.getFullYear() === hoy.getFullYear();
                }).reduce((sum, pago) => {
                    const monto = parseFloat(pago.monto) || 0;
                    return sum + monto;
                }, 0)
            };
            
            return stats;
        } catch (error) {
            console.error('Error getting estadisticas:', error);
            throw error;
        }
    }
}

// Crear instancia global de la API
const api = new API();