import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TablesService, BackendTable } from 'src/app/services/tables.service';

interface Table {
  number: number;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved';
  customerName?: string;
  waiter?: string;
  partySize?: number;
  comments?: string;
  reservationTime?: string;
  startTime?: string;
  orders?: any[];
}

@Component({
  selector: 'app-tables-management',
  templateUrl: './tables-management.page.html',
  styleUrls: ['./tables-management.page.scss'],
  standalone:false
})
export class TablesManagementPage implements OnInit {

  tables: Table[] = [];
  
  isModalOpen = false;
  editingTable: Table | null = null;
  
  currentTable: Table = {
    number: 1,
    capacity: 4,
    status: 'available'
  };

  currentUser: any = {};

  loading = false;
  errorMessage: string | null = null;

  constructor(
    private router: Router,
    private tablesService: TablesService
  ) { }

  ngOnInit() {
    this.loadCurrentUser();
    this.loadTables();
  }

  ionViewWillEnter() {
    this.loadTables(); // Recargar mesas cada vez que entras a la página
  }

  loadCurrentUser() {
    const stored = localStorage.getItem('currentUser');
    if (stored) {
      this.currentUser = JSON.parse(stored);
      
      // Verificar que sea admin
      if (this.currentUser.roleType !== 'admin') {
        alert('Solo los administradores pueden acceder a esta sección');
        this.router.navigate(['/dashboard']);
      }
    }
  }

  // ========== CARGA DESDE BACKEND ==========
  loadTables() {
    this.loading = true;
    this.errorMessage = null;

    this.tablesService.getTables().subscribe({
      next: (data: BackendTable[]) => {
        this.tables = data.map(item => ({
          number: item.numero_mesa,
          capacity: item.capacidad,
          status: this.mapStatusFromBackend(item.disponibilidad),
          orders: []
        }));

        // Ordenar por número
        this.tables.sort((a, b) => a.number - b.number);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar mesas', err);
        this.errorMessage = 'Error al cargar las mesas';
        this.loading = false;
      }
    });
  }

  // Convierte el estado del backend (disponible/ocupada/reservada) a tu enum (available/occupied/reserved)
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

  // Convierte tu estado del front al enum del backend
  private mapStatusToBackend(
  status: 'available' | 'occupied' | 'reserved'
  ): 'disponible' | 'ocupada' | 'reservada' {
  switch (status) {
    case 'available':
      return 'disponible';
    case 'occupied':
      return 'ocupada';
    case 'reserved':
      return 'reservada';
  }
}


  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'available': 'Disponible',
      'occupied': 'Ocupada',
      'reserved': 'Reservada'
    };
    return labels[status] || status;
  }

  getTableInfo(table: Table): string {
    switch (table.status) {
      case 'available':
        return '✓ Mesa libre';
      case 'occupied':
        return table.partySize 
          ? `👥 Para ${table.partySize} ${table.partySize === 1 ? 'persona' : 'personas'}` 
          : '👥 Ocupada';
      case 'reserved':
        return table.partySize 
          ? `📅 Reservada para ${table.partySize} ${table.partySize === 1 ? 'persona' : 'personas'}` 
          : '📅 Reservada';
      default:
        return '-';
    }
  }

  getTablesByStatus(status: string): number {
    return this.tables.filter(t => t.status === status).length;
  }

  // ========== MODAL ==========
  openTableModal(table?: Table) {
    if (table) {
      this.editingTable = table;
      this.currentTable = { ...table };
    } else {
      this.editingTable = null;
      this.currentTable = {
        number: this.getNextTableNumber(),
        capacity: 4,
        status: 'available'
      };
    }
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.editingTable = null;
  }

  // ========== CRUD (usando backend) ==========
  saveTable() {
    if (!this.isFormValid()) return;

    // Verificar que no exista otra mesa con el mismo número
    const existingTable = this.tables.find(t => 
      t.number === this.currentTable.number &&
      (!this.editingTable || t.number !== this.editingTable.number)
    );

    if (existingTable) {
      alert(`Ya existe una mesa con el número ${this.currentTable.number}`);
      return;
    }

    const payload: BackendTable = {
      numero_mesa: this.currentTable.number,
      capacidad: this.currentTable.capacity,
      disponibilidad: this.mapStatusToBackend(this.currentTable.status),
      ubicacion: 'Salón principal' // TODO: luego puedes manejar esto en el formulario
    };

    if (this.editingTable) {
      // UPDATE
      this.tablesService.updateTable(this.editingTable.number, payload).subscribe({
        next: () => {
          console.log('✅ Mesa actualizada');
          this.loadTables();
          this.closeModal();
        },
        error: (err) => {
          console.error('Error al actualizar mesa', err);
          alert('Error al actualizar la mesa');
        }
      });
    } else {
      // CREATE
      this.tablesService.createTable(payload).subscribe({
        next: () => {
          console.log('✅ Mesa creada');
          this.loadTables();
          this.closeModal();
        },
        error: (err) => {
          console.error('Error al crear mesa', err);
          alert('Error al crear la mesa');
        }
      });
    }
  }

  editTable(table: Table) {
    this.openTableModal(table);
  }

  deleteTable(number: number) {
    const table = this.tables.find(t => t.number === number);
    if (!table) return;

    if (table.status !== 'available') {
      alert('No puedes eliminar una mesa ocupada o reservada.\nCierra la mesa desde el Dashboard primero.');
      return;
    }

    if (confirm(`¿Estás seguro de eliminar la Mesa ${table.number}?\n\nEsta acción no se puede deshacer.`)) {
      this.tablesService.deleteTable(number).subscribe({
        next: () => {
          console.log('✅ Mesa eliminada');
          this.loadTables();
        },
        error: (err) => {
          console.error('Error al eliminar mesa', err);
          alert('Error al eliminar la mesa');
        }
      });
    }
  }

  // ========== HELPERS ==========
  getNextTableNumber(): number {
    return this.tables.length > 0
      ? Math.max(...this.tables.map(t => t.number)) + 1
      : 1;
  }

  isFormValid(): boolean {
    return this.currentTable.number > 0 && this.currentTable.capacity > 0;
  }

}
