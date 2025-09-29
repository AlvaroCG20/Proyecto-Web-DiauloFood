import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: 'administrar', loadComponent: () => import('./pages/administrar/administrar.page').then(m => m.AdministrarPage) },
  { path: 'productos', loadComponent: () => import('./pages/productos/productos.page').then(m => m.ProductosPage) },
  { path: 'restaurante', loadComponent: () => import('./pages/restaurante/restaurante.page').then(m => m.RestaurantePage) },
  { path: 'contacto', loadComponent: () => import('./pages/contacto/contacto.page').then(m => m.ContactoPage) },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', loadComponent: () => import('./pages/home/home.page').then(m => m.HomePage) },
  {
    path: '',
    redirectTo: 'auth',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadChildren: () => import('./pages/auth/auth.module').then( m => m.AuthPageModule)
  },
  {
    path: 'auth',
    loadChildren: () => import('./pages/auth/auth.module').then( m => m.AuthPageModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
