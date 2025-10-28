import { Component, OnInit } from '@angular/core';

interface Product {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

interface MenuItem {
  id: number;
  name: string;
  cost: number;
  margin: number;
  price: number;
}

interface Table {
  id: number;
  number: number;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved';
  customerName?: string;
  waiter?: string;
  partySize?: number;
  comments?: string;
  reservationTime?: string;
  startTime?: string;
  orders?: Product[];
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: false
})
export class DashboardPage implements OnInit {

  isModalOpen = false;
  searchProduct = '';
  
  tables: Table[] = [];
  availableProducts: MenuItem[] = [];
  filteredProducts: MenuItem[] = [];
  showSuggestions = false;
  
  selectedTable: Table = {
    id: 0,
    number: 0,
    capacity: 4,
    status: 'available',
    partySize: 1,
    customerName: '',
    waiter: '',
    comments: '',
    orders: []
  };

  constructor() { }

  ngOnInit() {
    this.loadTables();
    this.loadProducts();
  }

  ionViewWillEnter() {
    this.loadTables();
    this.loadProducts();
  }

  // ========== CARGAR PRODUCTOS DEL SISTEMA ==========
  loadProducts() {
    const stored = localStorage.getItem('products');
    if (stored) {
      this.availableProducts = JSON.parse(stored);
      console.log('✅ Productos cargados:', this.availableProducts.length);
    } else {
      this.availableProducts = [];
      console.log('⚠️ No hay productos en el sistema');
    }
  }

  // ========== BÚSQUEDA EN TIEMPO REAL ==========
  onSearchChange() {
    if (this.searchProduct.trim().length === 0) {
      this.filteredProducts = [];
      this.showSuggestions = false;
      return;
    }

    const searchLower = this.searchProduct.toLowerCase();
    this.filteredProducts = this.availableProducts.filter(product =>
      product.name.toLowerCase().includes(searchLower)
    );
    
    this.showSuggestions = this.filteredProducts.length > 0;
  }

  // ========== SELECCIONAR PRODUCTO DE SUGERENCIAS ==========
  selectProduct(product: MenuItem) {
    const existingProduct = this.selectedTable.orders?.find(
      p => p.id === product.id
    );
    
    if (existingProduct) {
      existingProduct.quantity++;
    } else {
      const newProduct: Product = {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1
      };
      
      this.selectedTable.orders?.push(newProduct);
    }

    this.searchProduct = '';
    this.filteredProducts = [];
    this.showSuggestions = false;

    this.saveTableChanges();
    
    console.log('✅ Producto agregado:', product.name);
  }

  // ========== AGREGAR PRODUCTO MANUALMENTE ==========
  addProduct() {
    if (!this.searchProduct.trim()) {
      return;
    }

    const searchLower = this.searchProduct.toLowerCase();
    const foundProduct = this.availableProducts.find(
      p => p.name.toLowerCase() === searchLower
    );

    if (!foundProduct) {
      alert('⚠️ Producto no encontrado en el sistema.\nBusca y selecciona un producto de la lista.');
      return;
    }

    this.selectProduct(foundProduct);
  }

  // ========== HELPER PARA GUARDAR CAMBIOS ==========
  saveTableChanges() {
    const index = this.tables.findIndex(t => t.id === this.selectedTable.id);
    if (index !== -1) {
      this.tables[index] = { ...this.selectedTable };
      this.saveTables();
    }
  }

  isAdmin(): boolean {
    const stored = localStorage.getItem('currentUser');
    if (stored) {
      const user = JSON.parse(stored);
      return user.roleType === 'admin';
    }
    return false;
  }

  loadTables() {
    const stored = localStorage.getItem('tables');
    if (stored) {
      this.tables = JSON.parse(stored);
      this.tables.sort((a, b) => a.number - b.number);
    } else {
      this.tables = [];
      for (let i = 1; i <= 14; i++) {
        this.tables.push({
          id: i,
          number: i,
          capacity: 4,
          status: 'available',
          orders: []
        });
      }
      this.saveTables();
    }
  }

  saveTables() {
    localStorage.setItem('tables', JSON.stringify(this.tables));
  }

  getTableByNumber(number: number): Table | undefined {
    return this.tables.find(t => t.number === number);
  }

  getTableStatus(number: number): 'green' | 'red' | 'yellow' {
    const table = this.getTableByNumber(number);
    if (!table) return 'green';
    return this.mapStatus(table.status);
  }

  getTableStatusByTable(table: Table | null): 'green' | 'red' | 'yellow' {
    if (!table) return 'green';
    return this.mapStatus(table.status);
  }

  mapStatus(status: string): 'green' | 'red' | 'yellow' {
    const statusMap: { [key: string]: 'green' | 'red' | 'yellow' } = {
      'available': 'green',
      'occupied': 'red',
      'reserved': 'yellow'
    };
    return statusMap[status] || 'green';
  }

  openTableModal(tableNumber: number) {
    const table = this.getTableByNumber(tableNumber);
    if (table) {
      this.openTableModalByTable(table);
    }
  }

  openTableModalByTable(table: Table) {
    this.selectedTable = { ...table };
    if (!this.selectedTable.orders) {
      this.selectedTable.orders = [];
    }
    if (!this.selectedTable.partySize) {
      this.selectedTable.partySize = 1;
    }
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.searchProduct = '';
    this.filteredProducts = [];
    this.showSuggestions = false;
  }

  incrementPersons() {
    if (this.selectedTable.partySize && this.selectedTable.partySize < 20) {
      this.selectedTable.partySize++;
    }
  }

  decrementPersons() {
    if (this.selectedTable.partySize && this.selectedTable.partySize > 1) {
      this.selectedTable.partySize--;
    }
  }

  assignTable() {
    console.log('Ocupando mesa:', this.selectedTable);
    
    this.selectedTable.status = 'occupied';
    this.selectedTable.startTime = new Date().toLocaleString('es-CL');
    
    const index = this.tables.findIndex(t => t.id === this.selectedTable.id);
    if (index !== -1) {
      this.tables[index] = { ...this.selectedTable };
      this.saveTables();
    }
    
    this.closeModal();
    console.log('✅ Mesa ocupada - Guardada en localStorage');
  }

  reserveTable() {
    console.log('Reservando mesa:', this.selectedTable);
    
    this.selectedTable.status = 'reserved';
    this.selectedTable.reservationTime = new Date().toLocaleString('es-CL');
    
    const index = this.tables.findIndex(t => t.id === this.selectedTable.id);
    if (index !== -1) {
      this.tables[index] = { ...this.selectedTable };
      this.saveTables();
    }
    
    this.closeModal();
    console.log('✅ Mesa reservada - Guardada en localStorage');
  }

  activateTable() {
    console.log('Confirmando reserva (ocupando mesa):', this.selectedTable);
    
    this.selectedTable.status = 'occupied';
    this.selectedTable.startTime = new Date().toLocaleString('es-CL');
    
    const index = this.tables.findIndex(t => t.id === this.selectedTable.id);
    if (index !== -1) {
      this.tables[index] = { ...this.selectedTable };
      this.saveTables();
    }
    
    this.closeModal();
    console.log('✅ Reserva confirmada - Mesa ocupada');
  }

  cancelReservation() {
    console.log('Cancelando reserva:', this.selectedTable);
    
    this.selectedTable.status = 'available';
    this.selectedTable.customerName = '';
    this.selectedTable.waiter = '';
    this.selectedTable.comments = '';
    this.selectedTable.reservationTime = '';
    this.selectedTable.partySize = 1;
    
    const index = this.tables.findIndex(t => t.id === this.selectedTable.id);
    if (index !== -1) {
      this.tables[index] = { ...this.selectedTable };
      this.saveTables();
    }
    
    this.closeModal();
    console.log('✅ Reserva cancelada');
  }

  incrementProduct(product: Product) {
    product.quantity++;
    this.saveTableChanges();
  }

  decrementProduct(product: Product) {
    if (product.quantity > 1) {
      product.quantity--;
    } else {
      const idx = this.selectedTable.orders?.indexOf(product);
      if (idx !== undefined && idx > -1) {
        this.selectedTable.orders?.splice(idx, 1);
      }
    }
    this.saveTableChanges();
  }

  calculateTotal(): number {
    return this.selectedTable.orders?.reduce(
      (total, product) => total + (product.price * product.quantity), 0
    ) || 0;
  }

  closeTable() {
    console.log('Cerrando mesa:', this.selectedTable);
    
    const total = this.calculateTotal();
    console.log('Total de la cuenta: $', total);
    
    // ========== GUARDAR EN HISTORIAL ==========
    if (this.selectedTable.orders && this.selectedTable.orders.length > 0) {
      const orderHistory = {
        id: Date.now(),
        tableNumber: this.selectedTable.number,
        customerName: this.selectedTable.customerName || 'Sin nombre',
        waiter: this.selectedTable.waiter || 'Sin asignar',
        partySize: this.selectedTable.partySize || 1,
        products: [...this.selectedTable.orders],
        total: total,
        startTime: this.selectedTable.startTime || '',
        closeTime: new Date().toLocaleString('es-CL'),
        date: new Date().toLocaleDateString('es-CL'),
        comments: this.selectedTable.comments || ''
      };
      
      // Obtener historial existente
      const storedHistory = localStorage.getItem('orderHistory');
      let history = storedHistory ? JSON.parse(storedHistory) : [];
      
      // Agregar nueva orden
      history.push(orderHistory);
      
      // Guardar en localStorage
      localStorage.setItem('orderHistory', JSON.stringify(history));
      
      console.log('✅ Orden guardada en historial:', orderHistory);
    }
    
    // Volver a DISPONIBLE
    this.selectedTable.status = 'available';
    this.selectedTable.customerName = '';
    this.selectedTable.waiter = '';
    this.selectedTable.comments = '';
    this.selectedTable.startTime = '';
    this.selectedTable.orders = [];
    this.selectedTable.partySize = 1;
    
    // Actualizar en localStorage
    const index = this.tables.findIndex(t => t.id === this.selectedTable.id);
    if (index !== -1) {
      this.tables[index] = { ...this.selectedTable };
      this.saveTables();
    }
    
    this.closeModal();
    console.log('✅ Mesa cerrada - Disponible nuevamente');
  }

}