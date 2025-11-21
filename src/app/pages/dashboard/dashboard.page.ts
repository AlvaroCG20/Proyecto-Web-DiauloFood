import { Component, OnInit } from '@angular/core';
import { TablesService, BackendTable } from 'src/app/services/tables.service';
import { ProductsService, BackendProduct } from 'src/app/services/products.service';

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

  loadingTables = false;
  tablesError: string | null = null;

  constructor(
    private tablesService: TablesService,
    private productsService: ProductsService
  ) {}

  ngOnInit() {
    this.loadTables();
    this.loadProducts();
    this.loadTablesFromLocalStorage(); // ← NUEVO
  }

  ionViewWillEnter() {
    this.loadTables();
    this.loadProducts();
    this.loadTablesFromLocalStorage(); // ← NUEVO
  }

  // ========== NUEVO: CARGAR DATOS DESDE LOCALSTORAGE ==========
  
  private loadTablesFromLocalStorage() {
    const storedTables = localStorage.getItem('dashboardTables');
    if (storedTables) {
      try {
        const parsedTables: Table[] = JSON.parse(storedTables);
        
        // Combinar datos del backend con los guardados localmente
        this.tables = this.tables.map(table => {
          const localTable = parsedTables.find(t => t.number === table.number);
          if (localTable) {
            // Mantener los datos locales (nombre, garzón, comentarios, etc.)
            return {
              ...table,
              customerName: localTable.customerName || table.customerName,
              waiter: localTable.waiter || table.waiter,
              partySize: localTable.partySize || table.partySize,
              comments: localTable.comments || table.comments,
              reservationTime: localTable.reservationTime || table.reservationTime,
              startTime: localTable.startTime || table.startTime,
              orders: localTable.orders || table.orders
            };
          }
          return table;
        });
        
        console.log('✅ Datos cargados desde localStorage:', this.tables);
      } catch (error) {
        console.error('Error al cargar datos desde localStorage:', error);
      }
    }
  }

  // ========== NUEVO: GUARDAR TODOS LOS DATOS EN LOCALSTORAGE ==========
  
  private saveTableToLocalStorage() {
    try {
      localStorage.setItem('dashboardTables', JSON.stringify(this.tables));
      console.log('💾 Datos guardados en localStorage');
    } catch (error) {
      console.error('Error al guardar en localStorage:', error);
    }
  }

  // ========== CARGAR PRODUCTOS DEL SISTEMA ==========

  loadProducts() {
    this.productsService.getProducts().subscribe({
      next: (data: BackendProduct[]) => {
        this.availableProducts = data.map((item) => ({
          id: item.id_producto,
          name: item.nombre_producto,
          price: item.precio_venta,
          cost: item.costo_compra,
          margin: item.margen_ganancia
        }));

        console.log('✅ Productos cargados desde backend:', this.availableProducts.length);
      },
      error: (err) => {
        console.error('Error al cargar productos desde backend', err);
        this.availableProducts = [];
      }
    });
  }

  // ========== CARGAR MESAS DESDE BACKEND ==========

  loadTables() {
    this.loadingTables = true;
    this.tablesError = null;

    this.tablesService.getTables().subscribe({
      next: (data: BackendTable[]) => {

        this.tables = data.map((item) => ({
          id: item.numero_mesa,             
          number: item.numero_mesa,
          capacity: item.capacidad,
          status: this.mapStatusFromBackend(item.disponibilidad),
          orders: []
        }));

        this.tables.sort((a, b) => a.number - b.number);
        
        // Cargar datos locales después de cargar del backend
        this.loadTablesFromLocalStorage();

        this.loadingTables = false;
        console.log('✅ Mesas cargadas desde backend:', this.tables);
      },
      error: (err) => {
        console.error('Error al cargar mesas en Dashboard', err);
        this.tablesError = 'Error al cargar las mesas';
        this.loadingTables = false;
      }
    });
  }

  private mapStatusFromBackend(status: string): 'available' | 'occupied' | 'reserved' {
    switch (status) {
      case 'disponible':
        return 'available';
      case 'ocupada':
        return 'occupied';
      case 'reservada':
        return 'reserved';
      default:
        if (status === 'available' || status === 'occupied' || status === 'reserved') {
          return status;
        }
        return 'available';
    }
  }

  private mapStatusToBackend(
    status: 'available' | 'occupied' | 'reserved'
  ): BackendTable['disponibilidad'] {
    switch (status) {
      case 'available':
        return 'disponible';
      case 'occupied':
        return 'ocupada';
      case 'reserved':
        return 'reservada';
      default:
        return 'disponible';
    }
  }

  private syncTableToBackend(table: Table) {
    const payload: Partial<BackendTable> = {
      numero_mesa: table.number,
      capacidad: table.capacity,
      disponibilidad: this.mapStatusToBackend(table.status),
      ubicacion: null
    };

    console.log('➡️ Enviando a PUT /tables:', payload);

    this.tablesService.updateTable(table.number, payload).subscribe({
      next: () => {
        console.log('✅ Mesa sincronizada con backend:', payload);
      },
      error: (err) => {
        console.error('Error al sincronizar mesa con backend', err);
      }
    });
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

  // ========== HELPER PARA GUARDAR CAMBIOS EN LA MESA SELECCIONADA ==========

  saveTableChanges() {
    const index = this.tables.findIndex(t => t.id === this.selectedTable.id);
    if (index !== -1) {
      this.tables[index] = { ...this.selectedTable };
      this.saveTableToLocalStorage(); // ← NUEVO: Guardar en localStorage
      console.log('✅ Cambios guardados en mesa:', this.selectedTable);
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

  // ========== STATUS Y UTILIDADES DE MESAS ==========

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

  // ========== MODAL MESA ==========

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
    // Guardar cambios antes de cerrar
    this.saveTableChanges(); // ← NUEVO
    
    this.isModalOpen = false;
    this.searchProduct = '';
    this.filteredProducts = [];
    this.showSuggestions = false;
  }

  // ========== PERSONAS ==========

  incrementPersons() {
    if (this.selectedTable.partySize && this.selectedTable.partySize < 20) {
      this.selectedTable.partySize++;
      this.saveTableChanges(); // ← NUEVO
    }
  }

  decrementPersons() {
    if (this.selectedTable.partySize && this.selectedTable.partySize > 1) {
      this.selectedTable.partySize--;
      this.saveTableChanges(); // ← NUEVO
    }
  }

  // ========== CAMBIOS DE ESTADO (OCUPAR, RESERVAR, ETC.) ==========

  assignTable() {
    console.log('Ocupando mesa:', this.selectedTable);
    
    this.selectedTable.status = 'occupied';
    this.selectedTable.startTime = new Date().toLocaleString('es-CL');
    
    const index = this.tables.findIndex(t => t.id === this.selectedTable.id);
    if (index !== -1) {
      this.tables[index] = { ...this.selectedTable };
      this.syncTableToBackend(this.selectedTable);
      this.saveTableToLocalStorage(); // ← NUEVO
    }
    
    this.closeModal();
    console.log('✅ Mesa ocupada - Sincronizada con backend y localStorage');
  }

  reserveTable() {
    console.log('Reservando mesa:', this.selectedTable);
    
    this.selectedTable.status = 'reserved';
    this.selectedTable.reservationTime = new Date().toLocaleString('es-CL');
    
    // Guardar reserva en historial de reservas
    const reservation = {
      id: Date.now(),
      mesa: this.selectedTable.number,
      personas: this.selectedTable.partySize || 1,
      cliente: this.selectedTable.customerName || 'Sin nombre',
      garzon: this.selectedTable.waiter || 'Sin asignar',
      comentarios: this.selectedTable.comments || '',
      fecha: new Date().toLocaleDateString('es-CL'),
      hora: new Date().toLocaleTimeString('es-CL'),
      timestamp: new Date().toLocaleString('es-CL')
    };
    
    const storedReservations = localStorage.getItem('reservations');
    let reservations = storedReservations ? JSON.parse(storedReservations) : [];
    reservations.push(reservation);
    localStorage.setItem('reservations', JSON.stringify(reservations));
    
    console.log('✅ Reserva guardada en historial:', reservation);
    
    const index = this.tables.findIndex(t => t.id === this.selectedTable.id);
    if (index !== -1) {
      this.tables[index] = { ...this.selectedTable };
      this.syncTableToBackend(this.selectedTable);
      this.saveTableToLocalStorage(); // ← NUEVO
    }
    
    this.closeModal();
    console.log('✅ Mesa reservada - Sincronizada con backend y localStorage');
  }

  activateTable() {
    console.log('Confirmando reserva (ocupando mesa):', this.selectedTable);
    
    this.selectedTable.status = 'occupied';
    this.selectedTable.startTime = new Date().toLocaleString('es-CL');
    
    const index = this.tables.findIndex(t => t.id === this.selectedTable.id);
    if (index !== -1) {
      this.tables[index] = { ...this.selectedTable };
      this.syncTableToBackend(this.selectedTable);
      this.saveTableToLocalStorage(); // ← NUEVO
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
      this.syncTableToBackend(this.selectedTable);
      this.saveTableToLocalStorage(); // ← NUEVO
    }
    
    this.closeModal();
    console.log('✅ Reserva cancelada');
  }

  // ========== PRODUCTOS EN LA MESA ==========

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

  // ========== CERRAR MESA ==========

  closeTable() {
    console.log('Cerrando mesa:', this.selectedTable);
    
    const total = this.calculateTotal();
    console.log('Total de la cuenta: $', total);
    
    // Guardar en historial de órdenes
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
      
      const storedHistory = localStorage.getItem('orderHistory');
      let history = storedHistory ? JSON.parse(storedHistory) : [];
      history.push(orderHistory);
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
    
    const index = this.tables.findIndex(t => t.id === this.selectedTable.id);
    if (index !== -1) {
      this.tables[index] = { ...this.selectedTable };
      this.syncTableToBackend(this.selectedTable);
      this.saveTableToLocalStorage(); // ← NUEVO
    }
    
    this.closeModal();
    console.log('✅ Mesa cerrada - Disponible nuevamente');
  }

}