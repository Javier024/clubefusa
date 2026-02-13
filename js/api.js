// js/api.js
class GoogleSheetsAPI {
  constructor() {
    this.baseURL = 'https://sheets.googleapis.com/v4/spreadsheets';
    this.apiKey = CONFIG.API_KEY;
    this.spreadsheetId = CONFIG.SPREADSHEET_ID;
  }

  async fetchData(range) {
    try {
      const url = `${this.baseURL}/${this.spreadsheetId}/values/${range}?key=${this.apiKey}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      return data.values || [];
    } catch (error) {
      console.error('Error fetching data:', error);
      return [];
    }
  }

  async getJugadores() {
    const data = await this.fetchData(CONFIG.RANGES.JUGADORES);
    return this.parseJugadores(data);
  }

  async getPagos() {
    const data = await this.fetchData(CONFIG.RANGES.PAGOS);
    return this.parsePagos(data);
  }

  parseJugadores(data) {
    if (data.length < 2) return [];
    
    const headers = data[0];
    const rows = data.slice(1);
    
    return rows.map(row => {
      const jugador = {};
      headers.forEach((header, index) => {
        jugador[header.toLowerCase()] = row[index] || '';
      });
      return jugador;
    });
  }

  parsePagos(data) {
    if (data.length < 2) return [];
    
    const headers = data[0];
    const rows = data.slice(1);
    
    return rows.map(row => {
      const pago = {};
      headers.forEach((header, index) => {
        pago[header.toLowerCase()] = row[index] || '';
      });
      return pago;
    });
  }
}

const api = new GoogleSheetsAPI();