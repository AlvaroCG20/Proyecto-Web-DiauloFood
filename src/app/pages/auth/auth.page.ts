import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth'; 

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
  standalone: false
})
export class AuthPage implements OnInit {
  loginForm: FormGroup;
  submitted = false;
  loading = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService 
  ) {
    // Inicializar el formulario con validaciones
    this.loginForm = this.formBuilder.group({
      email: ['', [
        Validators.required,
        Validators.email,
        Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$')
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(6)
      ]],
      remember: [false]
    });
  }

  ngOnInit() {}

  get f() {
    return this.loginForm.controls;
  }


  onLogin() {
    this.submitted = true;

    if (this.loginForm.invalid) return;

    this.loading = true;

    const datos = {
      email: this.loginForm.value.email,
      contrasena: this.loginForm.value.password
    };


    this.authService.login(datos).subscribe({
      next: (res: any) => {
        console.log('✅ Login exitoso:', res);


        this.router.navigate(['/dashboard']); 
      },
      error: (err: any) => {
        console.error('❌ Error en login:', err);
        alert('Error al iniciar sesión. Revisa tus credenciales.');
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  onGoogleLogin() {
    console.log('Google login clicked');
  }
}
