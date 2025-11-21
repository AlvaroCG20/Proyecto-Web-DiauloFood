import { Component, OnInit } from '@angular/core';
import { ProductsService, BackendProduct } from 'src/app/services/products.service';

interface Product {
  id: number;      // id_producto
  name: string;    // nombre_producto
  cost: number;    // costo_compra
  margin: number;  // margen_ganancia
  price: number;   // precio_venta
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

  constructor(
    private productsService: ProductsService
  ) { }

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

  // ========== CARGAR PRODUCTOS DESDE BACKEND ==========

  loadProducts() {
    this.productsService.getProducts().subscribe({
      next: (data: BackendProduct[]) => {
        this.products = data.map((item) => ({
          id: item.id_producto,
          name: item.nombre_producto,
          cost: item.costo_compra,
          margin: item.margen_ganancia,
          price: item.precio_venta
        }));

        this.sortedProducts = [...this.products];
        this.applySort();

        console.log('✅ Productos cargados desde backend:', this.products.length);
      },
      error: (err) => {
        console.error('Error al cargar productos desde backend', err);
        this.products = [];
        this.sortedProducts = [];
      }
    });
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
        id: 0, // lo asigna la BD
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

  // ========== CRUD (USANDO BACKEND) ==========

  saveProduct() {
    if (!this.isAdmin()) {
      alert('No tienes permisos para realizar esta acción');
      return;
    }

    if (!this.isFormValid()) return;

    // precio_venta = cost + margin (lo mismo que ya haces con calculatePrice)
    const payload: Partial<BackendProduct> = {
      nombre_producto: this.currentProduct.name,
      costo_compra: this.currentProduct.cost,
      precio_venta: this.currentProduct.price,
      // margen_ganancia puede calcularlo el backend,
      // pero si quieres igual lo mandamos:
      margen_ganancia: this.currentProduct.margin,
      descripcion: null
    };

    if (this.editingProduct) {
      // Actualizar producto existente
      this.productsService.updateProduct(this.currentProduct.id, payload).subscribe({
        next: () => {
          console.log('✅ Producto actualizado en backend');
          this.loadProducts(); // recargar lista desde BD
          this.closeModal();
        },
        error: (err) => {
          console.error('Error al actualizar producto', err);
          alert('Error al actualizar el producto');
        }
      });
    } else {
      // Agregar nuevo producto
      this.productsService.createProduct(payload).subscribe({
        next: () => {
          console.log('✅ Producto creado en backend');
          this.loadProducts(); // recargar lista desde BD
          this.closeModal();
        },
        error: (err) => {
          console.error('Error al crear producto', err);
          alert('Error al crear el producto');
        }
      });
    }
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
      this.productsService.deleteProduct(id).subscribe({
        next: () => {
          console.log('✅ Producto eliminado en backend');
          this.loadProducts();
        },
        error: (err) => {
          console.error('Error al eliminar producto', err);
          alert('Error al eliminar el producto');
        }
      });
    }
  }

  // ========== HELPERS ==========

  // ya no usamos getNextId() porque ahora el id lo asigna la BD
  // pero si lo tenías en el HTML, podemos dejarlo sin usar o adaptarlo

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
