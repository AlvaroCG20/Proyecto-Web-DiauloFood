import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

interface Employee {
  id: number;
  name: string;
  email: string;
  password?: string;
  roleType: 'admin' | 'waiter';
  avatar: string;
  joinDate: string;
  assignedTables?: string;
}

@Component({
  selector: 'app-employees',
  templateUrl: './employees.page.html',
  styleUrls: ['./employees.page.scss'],
  standalone:false
})
export class EmployeesPage implements OnInit {

  employees: Employee[] = [];
  garzones: Employee[] = [];
  
  isModalOpen = false;
  editingEmployee: Employee | null = null;
  
  currentEmployee: Employee = {
    id: 0,
    name: '',
    email: '',
    password: '',
    roleType: 'waiter',
    avatar: '',
    joinDate: new Date().toLocaleDateString('es-CL'),
    assignedTables: ''
  };

  currentUser: any = {};

  constructor(private router: Router) { }

  ngOnInit() {
    this.loadCurrentUser();
    this.loadEmployees();
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

  loadEmployees() {
    const stored = localStorage.getItem('employees');
    if (stored) {
      this.employees = JSON.parse(stored);
    } else {
      // Datos iniciales
      this.employees = [
        {
          id: 1,
          name: 'Juan Pérez',
          email: 'juan.perez@diablofood.com',
          roleType: 'admin',
          avatar: 'https://ui-avatars.com/api/?name=Juan+Perez&background=ff6b35&color=fff&size=200',
          joinDate: '01/01/2024'
        },
        {
          id: 2,
          name: 'María González',
          email: 'maria.gonzalez@diablofood.com',
          roleType: 'waiter',
          avatar: 'https://ui-avatars.com/api/?name=Maria+Gonzalez&background=4caf50&color=fff&size=200',
          joinDate: '15/02/2024',
          assignedTables: '5, 6, 7, 8'
        },
        {
          id: 3,
          name: 'Carlos Ramírez',
          email: 'carlos.ramirez@diablofood.com',
          roleType: 'waiter',
          avatar: 'https://ui-avatars.com/api/?name=Carlos+Ramirez&background=2196F3&color=fff&size=200',
          joinDate: '10/03/2024',
          assignedTables: '9, 10, 11'
        },
        {
          id: 4,
          name: 'Ana Torres',
          email: 'ana.torres@diablofood.com',
          roleType: 'waiter',
          avatar: 'https://ui-avatars.com/api/?name=Ana+Torres&background=9c27b0&color=fff&size=200',
          joinDate: '20/03/2024',
          assignedTables: '1, 2, 3, 4'
        }
      ];
      this.saveToStorage();
    }
    this.filterGarzones();
  }

  saveToStorage() {
    localStorage.setItem('employees', JSON.stringify(this.employees));
  }

  filterGarzones() {
    this.garzones = this.employees.filter(emp => emp.roleType === 'waiter');
  }

  // ========== MODAL ==========
  openEmployeeModal(employee?: Employee) {
    if (employee) {
      this.editingEmployee = employee;
      this.currentEmployee = { ...employee };
    } else {
      this.editingEmployee = null;
      this.currentEmployee = {
        id: this.getNextId(),
        name: '',
        email: '',
        password: '',
        roleType: 'waiter',
        avatar: '',
        joinDate: new Date().toLocaleDateString('es-CL'),
        assignedTables: ''
      };
    }
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.editingEmployee = null;
  }

  // ========== CRUD ==========
  saveEmployee() {
    if (!this.isFormValid()) return;

    // Generar avatar
    this.currentEmployee.avatar = 
      `https://ui-avatars.com/api/?name=${encodeURIComponent(this.currentEmployee.name)}&background=4caf50&color=fff&size=200`;

    if (this.editingEmployee) {
      // Actualizar existente
      const index = this.employees.findIndex(e => e.id === this.currentEmployee.id);
      if (index !== -1) {
        this.employees[index] = { ...this.currentEmployee };
      }
    } else {
      // Agregar nuevo
      this.employees.push({ ...this.currentEmployee });
    }

    this.saveToStorage();
    this.filterGarzones();
    this.closeModal();
    
    console.log(this.editingEmployee ? '✅ Garzón actualizado' : '✅ Garzón creado');
  }

  editEmployee(employee: Employee) {
    this.openEmployeeModal(employee);
  }

  deleteEmployee(id: number) {
    const employee = this.employees.find(e => e.id === id);
    if (!employee) return;

    if (confirm(`¿Estás seguro de eliminar a ${employee.name}?\n\nEsta acción no se puede deshacer.`)) {
      this.employees = this.employees.filter(e => e.id !== id);
      this.saveToStorage();
      this.filterGarzones();
      console.log('✅ Garzón eliminado');
    }
  }

  // ========== HELPERS ==========
  getNextId(): number {
    return this.employees.length > 0
      ? Math.max(...this.employees.map(e => e.id)) + 1
      : 1;
  }

  isFormValid(): boolean {
    const hasBasicInfo = this.currentEmployee.name.trim() !== '' &&
                         this.currentEmployee.email.trim() !== '';
    
    const hasPassword = this.editingEmployee !== null || 
                        (this.currentEmployee.password !== undefined && 
                         this.currentEmployee.password !== '' && 
                         this.currentEmployee.password.length >= 6);
    
    return hasBasicInfo && hasPassword;
  }

}