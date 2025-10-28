import { Component, OnInit } from '@angular/core';

interface Product {
  id: number;
  name: string;
  cost: number;
  margin: number;
  price: number;
}

@Component({
  selector: 'app-products',
  templateUrl: './products.page.html',
  styleUrls: ['./products.page.scss'],
  standalone: false
})
export class ProductsPage implements OnInit {

  products: Product[] = [];
  sortedProducts: Product[] = [];
  isModalOpen = false;
  editingProduct: Product | null = null;
  
  currentProduct: Product = {
    id: 0,
    name: '',
    cost: 0,
    margin: 0,
    price: 0
  };

  sortColumn: string = 'id';
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor() { }

  ngOnInit() {
    this.loadProducts();
  }

  // ========== VERIFICAR SI ES ADMIN ==========
  isAdmin(): boolean {
    const stored = localStorage.getItem('currentUser');
    if (stored) {
      const user = JSON.parse(stored);
      return user.roleType === 'admin';
    }
    return false;
  }

  // ========== GESTIÓN DE DATOS (localStorage) ==========
  loadProducts() {
    const stored = localStorage.getItem('products');
    if (stored) {
      this.products = JSON.parse(stored);
    } else {
      // Datos iniciales de ejemplo
      this.products = [
        { id: 1, name: 'Bebida', cost: 1000, margin: 600, price: 1600 },
        { id: 2, name: 'Papas Fritas', cost: 1000, margin: 2600, price: 3600 },
        { id: 3, name: 'Ensalada', cost: 1200, margin: 3000, price: 4200 }
      ];
      this.saveToStorage();
    }
    this.sortedProducts = [...this.products];
    this.applySort();
  }

  saveToStorage() {
    localStorage.setItem('products', JSON.stringify(this.products));
  }

  // ========== MODAL ==========
  openProductModal(product?: Product) {
    // Solo admin puede abrir el modal
    if (!this.isAdmin()) {
      alert('No tienes permisos para realizar esta acción');
      return;
    }

    if (product) {
      this.editingProduct = product;
      this.currentProduct = { ...product };
    } else {
      this.editingProduct = null;
      this.currentProduct = {
        id: this.getNextId(),
        name: '',
        cost: 0,
        margin: 0,
        price: 0
      };
    }
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.editingProduct = null;
    this.currentProduct = {
      id: 0,
      name: '',
      cost: 0,
      margin: 0,
      price: 0
    };
  }

  // ========== CRUD ==========
  saveProduct() {
    if (!this.isAdmin()) {
      alert('No tienes permisos para realizar esta acción');
      return;
    }

    if (!this.isFormValid()) return;

    if (this.editingProduct) {
      // Actualizar producto existente
      const index = this.products.findIndex(p => p.id === this.currentProduct.id);
      if (index !== -1) {
        this.products[index] = { ...this.currentProduct };
      }
    } else {
      // Agregar nuevo producto
      this.products.push({ ...this.currentProduct });
    }

    this.saveToStorage();
    this.sortedProducts = [...this.products];
    this.applySort();
    this.closeModal();
    
    console.log(this.editingProduct ? '✅ Producto actualizado' : '✅ Producto creado');
  }

  editProduct(product: Product) {
    if (!this.isAdmin()) {
      alert('No tienes permisos para realizar esta acción');
      return;
    }
    this.openProductModal(product);
  }

  deleteProduct(id: number) {
    if (!this.isAdmin()) {
      alert('No tienes permisos para realizar esta acción');
      return;
    }

    if (confirm('¿Estás seguro de eliminar este producto?')) {
      this.products = this.products.filter(p => p.id !== id);
      this.saveToStorage();
      this.sortedProducts = [...this.products];
      console.log('✅ Producto eliminado');
    }
  }

  // ========== HELPERS ==========
  getNextId(): number {
    return this.products.length > 0
      ? Math.max(...this.products.map(p => p.id)) + 1
      : 1;
  }

  calculatePrice() {
    this.currentProduct.price = this.currentProduct.cost + this.currentProduct.margin;
  }

  isFormValid(): boolean {
    return this.currentProduct.name.trim() !== '' &&
           this.currentProduct.cost > 0 &&
           this.currentProduct.margin >= 0;
  }

  // ========== ORDENAMIENTO ==========
  sortBy(column: string) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.applySort();
  }

  toggleSort() {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    this.applySort();
  }

  applySort() {
    this.sortedProducts = [...this.products].sort((a, b) => {
      let valueA = a[this.sortColumn as keyof Product];
      let valueB = b[this.sortColumn as keyof Product];

      if (typeof valueA === 'string') {
        valueA = valueA.toLowerCase();
        valueB = (valueB as string).toLowerCase();
      }

      if (valueA < valueB) return this.sortDirection === 'asc' ? -1 : 1;
      if (valueA > valueB) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

}