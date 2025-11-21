import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EmployeesService } from 'src/app/services/employees';
import { HttpErrorResponse } from '@angular/common/http';

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

  constructor(private router: Router, private employeesService: EmployeesService) { }


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
  this.employeesService.obtenerGarzones().subscribe({
    next: (res: any[]) => {
      console.log('✅ Garzones cargados desde la base de datos:', res);

      // Transformamos los datos que vienen de la BD al formato del front
      this.employees = res.map(usuario => ({
        id: usuario.id,
        name: usuario.nombre_usuario,
        email: usuario.email,
        roleType: 'waiter',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(usuario.nombre_usuario)}&background=4caf50&color=fff&size=200`,
        joinDate: new Date().toLocaleDateString('es-CL'),
        assignedTables: '' // aún no se gestionan mesas desde BD
      }));

      this.filterGarzones();
    },
    error: (err: any) => {
      console.error('❌ Error al cargar garzones:', err);
      alert('Error al obtener los garzones desde la base de datos');
    }
  });
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

  // Si está editando, actualizar localmente
  if (this.editingEmployee) {
    const index = this.employees.findIndex(e => e.id === this.currentEmployee.id);
    if (index !== -1) {
      this.employees[index] = { ...this.currentEmployee };
      this.saveToStorage();
      this.filterGarzones();
      this.closeModal();
      console.log('✅ Garzón actualizado');
    }
  } else {
    // 🔥 Nuevo garzón → guardar en la base de datos
    const nuevoGarzon = {
      nombre_usuario: this.currentEmployee.name,
      email: this.currentEmployee.email,
      contrasena: this.currentEmployee.password
    };

    this.employeesService.agregarGarzon(nuevoGarzon).subscribe({
      next: (res: any) => {
        console.log('✅ Garzón agregado en la base de datos:', res);
        alert('Garzón creado correctamente');

        // También lo añadimos a la lista local
        this.employees.push({ ...this.currentEmployee });
        this.saveToStorage();
        this.filterGarzones();
        this.closeModal();
      },
      error: (err: any) => {
        console.error('❌ Error al agregar garzón:', err);
        alert('Error al registrar el garzón');
      }
    });
  }
}


  editEmployee(employee: Employee) {
    this.openEmployeeModal(employee);
  }

  deleteEmployee(id: number) {
  const employee = this.employees.find(e => e.id === id);
  if (!employee) return;

  if (!confirm(`¿Estás seguro de eliminar a ${employee.name}?\n\nEsta acción no se puede deshacer.`)) {
    return;
  }

  this.employeesService.eliminarGarzon(id).subscribe({
    next: (res) => {
      console.log('🗑️ Garzón eliminado en BD:', res);

      // Actualizar lista en el frontend consultando la BD nuevamente
      this.loadEmployees();
    },
    error: (err) => {
      console.error('❌ Error al eliminar garzón:', err);
      alert(err.error?.mensaje ?? 'No se pudo eliminar el garzón.');
    }
  });
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

