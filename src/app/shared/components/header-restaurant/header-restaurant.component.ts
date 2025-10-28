import { Component, OnInit } from '@angular/core';

interface User {
  roleType: 'admin' | 'waiter';
}

@Component({
  selector: 'app-header-restaurant',
  templateUrl: './header-restaurant.component.html',
  styleUrls: ['./header-restaurant.component.scss'],
  standalone:false
})
export class HeaderRestaurantComponent implements OnInit {

  currentUser: User = { roleType: 'admin' };

  constructor() { }

  ngOnInit() {
    this.loadCurrentUser();
  }

  loadCurrentUser() {
    const stored = localStorage.getItem('currentUser');
    if (stored) {
      this.currentUser = JSON.parse(stored);
    }
  }

  // Verificar si el usuario tiene acceso a una sección
  hasAccess(section: string): boolean {
    const permissions: { [key: string]: string[] } = {
      'dashboard': ['admin', 'waiter'],  // Ambos ven Restaurante
      'products': ['admin', 'waiter'],   // Ambos ven Productos
      'admin': ['admin']                 // SOLO admin ve Administrar
    };
    
    return permissions[section]?.includes(this.currentUser.roleType) || false;
  }

}