
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IonContent, IonHeader, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-restaurante',
  standalone: true,
  imports: [CommonModule, RouterLink, IonHeader, IonToolbar, IonContent],
  templateUrl: './restaurante.page.html',
  styleUrls: ['./restaurante.page.scss']
})
export class RestaurantePage {
  mesas = [
    { numero: 1,  estado: 'ocupada'    },
    { numero: 2,  estado: 'ocupada'    },
    { numero: 3,  estado: 'disponible' },
    { numero: 4,  estado: 'disponible' },
    { numero: 5,  estado: 'disponible' },
    { numero: 6,  estado: 'disponible' },
    { numero: 7,  estado: 'disponible' },
    { numero: 8,  estado: 'disponible' },
    { numero: 9,  estado: 'reservada'  },
    { numero: 10, estado: 'disponible' },
    { numero: 11, estado: 'ocupada'    },
    { numero: 12, estado: 'disponible' },
    { numero: 13, estado: 'disponible' },
    { numero: 14, estado: 'reservada'  },
  ];
}
