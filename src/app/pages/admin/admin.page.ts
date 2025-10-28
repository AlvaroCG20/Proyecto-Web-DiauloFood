import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

interface User {
  id: number;
  name: string;
  role: string;
  roleType: 'admin' | 'waiter';
  email: string;
  avatar: string;
  status: 'online' | 'offline';
}

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
  standalone:false
})
export class AdminPage implements OnInit {

  isUserSelectorOpen = false;

  currentUser: User = {
    id: 1,
    name: 'Juan Pérez',
    role: 'Administrador',
    roleType: 'admin',
    email: 'juan.perez@diablofood.com',
    avatar: 'https://ui-avatars.com/api/?name=Juan+Perez&background=ff6b35&color=fff&size=200',
    status: 'online'
  };

  availableUsers: User[] = [
    {
      id: 1,
      name: 'Juan Pérez',
      role: 'Administrador',
      roleType: 'admin',
      email: 'juan.perez@diablofood.com',
      avatar: 'https://ui-avatars.com/api/?name=Juan+Perez&background=ff6b35&color=fff&size=200',
      status: 'online'
    },
    {
      id: 2,
      name: 'María González',
      role: 'Garzón',
      roleType: 'waiter',
      email: 'maria.gonzalez@diablofood.com',
      avatar: 'https://ui-avatars.com/api/?name=Maria+Gonzalez&background=4caf50&color=fff&size=200',
      status: 'online'
    },
    {
      id: 3,
      name: 'Carlos Ramírez',
      role: 'Garzón',
      roleType: 'waiter',
      email: 'carlos.ramirez@diablofood.com',
      avatar: 'https://ui-avatars.com/api/?name=Carlos+Ramirez&background=2196F3&color=fff&size=200',
      status: 'online'
    },
    {
      id: 4,
      name: 'Ana Torres',
      role: 'Garzón',
      roleType: 'waiter',
      email: 'ana.torres@diablofood.com',
      avatar: 'https://ui-avatars.com/api/?name=Ana+Torres&background=9c27b0&color=fff&size=200',
      status: 'online'
    }
  ];

  // Estadísticas del día (simuladas)
  todayStats = {
    tables: 8,
    sales: 450000,
    orders: 34
  };

  constructor(private router: Router) { }

  ngOnInit() {
    this.loadUserFromStorage();
  }

  // Cargar usuario actual desde localStorage
  loadUserFromStorage() {
    const stored = localStorage.getItem('currentUser');
    if (stored) {
      this.currentUser = JSON.parse(stored);
    } else {
      // Usuario por defecto (admin)
      localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
    }
  }

  // ========== NAVEGACIÓN ==========
  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  // ========== MODAL DE SELECCIÓN ==========
  openUserSelector() {
    this.isUserSelectorOpen = true;
  }

  closeUserSelector() {
    this.isUserSelectorOpen = false;
  }

  selectUser(user: User) {
    this.currentUser = { ...user };
    localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
    
    // Recargar el componente del header
    window.location.reload();
  }

  getRoleBadgeText(roleType: string): string {
    const badges: { [key: string]: string } = {
      admin: '🔑 Administrador',
      waiter: '🍽️ Garzón'
    };
    return badges[roleType] || roleType;
  }

}