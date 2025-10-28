import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

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
    id: 0,
    number: 1,
    capacity: 4,
    status: 'available'
  };

  currentUser: any = {};

  constructor(private router: Router) { }

  ngOnInit() {
    this.loadCurrentUser();
    this.loadTables();
  }

  // ← AGREGAR ESTO
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

  loadTables() {
    const stored = localStorage.getItem('tables');
    if (stored) {
      this.tables = JSON.parse(stored);
    } else {
      // Mesas iniciales por defecto
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
      this.saveToStorage();
    }
    
    // Ordenar por número
    this.tables.sort((a, b) => a.number - b.number);
  }

  saveToStorage() {
    localStorage.setItem('tables', JSON.stringify(this.tables));
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
        id: this.getNextId(),
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

  // ========== CRUD ==========
  saveTable() {
    if (!this.isFormValid()) return;

    // Verificar que no exista otra mesa con el mismo número
    const existingTable = this.tables.find(t => 
      t.number === this.currentTable.number && t.id !== this.currentTable.id
    );

    if (existingTable) {
      alert(`Ya existe una mesa con el número ${this.currentTable.number}`);
      return;
    }

    if (this.editingTable) {
      // Actualizar existente
      const index = this.tables.findIndex(t => t.id === this.currentTable.id);
      if (index !== -1) {
        // Preservar estado actual y datos de ocupación
        this.tables[index] = {
          ...this.tables[index],
          number: this.currentTable.number
        };
      }
    } else {
      // Agregar nueva
      this.tables.push({ ...this.currentTable });
    }

    this.saveToStorage();
    this.loadTables(); // Recargar para ordenar
    this.closeModal();
    
    console.log(this.editingTable ? '✅ Mesa actualizada' : '✅ Mesa creada');
  }

  editTable(table: Table) {
    this.openTableModal(table);
  }

  deleteTable(id: number) {
    const table = this.tables.find(t => t.id === id);
    if (!table) return;

    // No permitir eliminar mesas ocupadas o reservadas
    if (table.status !== 'available') {
      alert('No puedes eliminar una mesa ocupada o reservada.\nCierra la mesa desde el Dashboard primero.');
      return;
    }

    if (confirm(`¿Estás seguro de eliminar la Mesa ${table.number}?\n\nEsta acción no se puede deshacer.`)) {
      this.tables = this.tables.filter(t => t.id !== id);
      this.saveToStorage();
      console.log('✅ Mesa eliminada');
    }
  }

  // ========== HELPERS ==========
  getNextId(): number {
    return this.tables.length > 0
      ? Math.max(...this.tables.map(t => t.id)) + 1
      : 1;
  }

  getNextTableNumber(): number {
    return this.tables.length > 0
      ? Math.max(...this.tables.map(t => t.number)) + 1
      : 1;
  }

  isFormValid(): boolean {
    return this.currentTable.number > 0;
  }

}