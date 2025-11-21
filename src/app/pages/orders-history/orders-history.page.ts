import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

interface Product {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

interface OrderHistory {
  id: number;
  tableNumber: number;
  customerName: string;
  waiter: string;
  partySize: number;
  products: Product[];
  total: number;
  startTime: string;
  closeTime: string;
  date: string;
  comments?: string;
}

@Component({
  selector: 'app-orders-history',
  templateUrl: './orders-history.page.html',
  styleUrls: ['./orders-history.page.scss'],
  standalone:false
})
export class OrdersHistoryPage implements OnInit {

  orders: OrderHistory[] = [];
  filteredOrders: OrderHistory[] = [];
  
  selectedOrder: OrderHistory | null = null;
  isDetailModalOpen = false;
  
  // Filtros
  filterDate: string = '';
  filterWaiter: string = '';
  filterTable: string = '';
  
  // Estadísticas
  stats = {
    totalOrders: 0,
    totalRevenue: 0,
    averageTicket: 0,
    todayRevenue: 0
  };

  currentUser: any = {};

  constructor(private router: Router) { }

  ngOnInit() {
    this.loadCurrentUser();
    this.loadOrders();
    this.calculateStats();
  }

  ionViewWillEnter() {
    this.loadOrders();
    this.calculateStats();
  }

  loadCurrentUser() {
    const stored = localStorage.getItem('currentUser');
    if (stored) {
      this.currentUser = JSON.parse(stored);
      
      if (this.currentUser.roleType !== 'admin') {
        alert('Solo los administradores pueden acceder a esta sección');
        this.router.navigate(['/dashboard']);
      }
    }
  }

  loadOrders() {
    const stored = localStorage.getItem('orderHistory');
    if (stored) {
      this.orders = JSON.parse(stored);
      // Ordenar por más reciente primero
      this.orders.sort((a, b) => b.id - a.id);
    } else {
      this.orders = [];
    }
    this.filteredOrders = [...this.orders];
  }

  calculateStats() {
    this.stats.totalOrders = this.orders.length;
    this.stats.totalRevenue = this.orders.reduce((sum, order) => sum + order.total, 0);
    this.stats.averageTicket = this.stats.totalOrders > 0 
      ? this.stats.totalRevenue / this.stats.totalOrders 
      : 0;
    
    // Calcular ventas de hoy
    const today = new Date().toLocaleDateString('es-CL');
    this.stats.todayRevenue = this.orders
      .filter(order => order.date === today)
      .reduce((sum, order) => sum + order.total, 0);
  }

  applyFilters() {
    this.filteredOrders = this.orders.filter(order => {
      const matchDate = !this.filterDate || order.date.includes(this.filterDate);
      const matchWaiter = !this.filterWaiter || 
        order.waiter.toLowerCase().includes(this.filterWaiter.toLowerCase());
      const matchTable = !this.filterTable || 
        order.tableNumber.toString().includes(this.filterTable);
      
      return matchDate && matchWaiter && matchTable;
    });
  }

  clearFilters() {
    this.filterDate = '';
    this.filterWaiter = '';
    this.filterTable = '';
    this.filteredOrders = [...this.orders];
  }

  openDetailModal(order: OrderHistory) {
    this.selectedOrder = order;
    this.isDetailModalOpen = true;
  }

  closeDetailModal() {
    this.isDetailModalOpen = false;
    this.selectedOrder = null;
  }

  deleteOrder(orderId: number) {
    if (confirm('¿Estás seguro de eliminar esta orden del historial?\n\nEsta acción no se puede deshacer.')) {
      this.orders = this.orders.filter(o => o.id !== orderId);
      localStorage.setItem('orderHistory', JSON.stringify(this.orders));
      this.loadOrders();
      this.calculateStats();
      console.log('✅ Orden eliminada del historial');
    }
  }

  clearAllHistory() {
    if (confirm('⚠️ ¿ESTÁS SEGURO DE ELIMINAR TODO EL HISTORIAL?\n\nEsta acción no se puede deshacer y perderás todas las órdenes registradas.')) {
      if (confirm('🚨 ÚLTIMA CONFIRMACIÓN\n\n¿Realmente quieres borrar TODAS las órdenes?')) {
        localStorage.removeItem('orderHistory');
        this.orders = [];
        this.filteredOrders = [];
        this.calculateStats();
        console.log('✅ Historial completo eliminado');
      }
    }
  }

  exportToCSV() {
    if (this.orders.length === 0) {
      alert('No hay órdenes para exportar');
      return;
    }

    let csv = 'Fecha,Hora Cierre,Mesa,Cliente,Garzón,Personas,Total,Productos\n';
    
    this.orders.forEach(order => {
      const products = order.products.map(p => `${p.name} x${p.quantity}`).join('; ');
      csv += `"${order.date}","${order.closeTime}",${order.tableNumber},"${order.customerName}","${order.waiter}",${order.partySize},${order.total},"${products}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `historial-ordenes-${new Date().toLocaleDateString('es-CL')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    console.log('✅ Historial exportado a CSV');
  }

  getTopProducts(limit: number = 5): { name: string, quantity: number, revenue: number }[] {
    const productMap = new Map<string, { quantity: number, revenue: number }>();
    
    this.orders.forEach(order => {
      order.products.forEach(product => {
        const existing = productMap.get(product.name) || { quantity: 0, revenue: 0 };
        productMap.set(product.name, {
          quantity: existing.quantity + product.quantity,
          revenue: existing.revenue + (product.price * product.quantity)
        });
      });
    });

    return Array.from(productMap.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit);
  }

  getTopWaiters(limit: number = 5): { name: string, orders: number, revenue: number }[] {
    const waiterMap = new Map<string, { orders: number, revenue: number }>();
    
    this.orders.forEach(order => {
      const existing = waiterMap.get(order.waiter) || { orders: 0, revenue: 0 };
      waiterMap.set(order.waiter, {
        orders: existing.orders + 1,
        revenue: existing.revenue + order.total
      });
    });

    return Array.from(waiterMap.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit);
  }

}