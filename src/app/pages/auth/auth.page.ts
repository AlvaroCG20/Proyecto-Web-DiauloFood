import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
  standalone:false
})
export class AuthPage implements OnInit {
  
  loginForm: FormGroup;
  submitted = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router
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

  ngOnInit() {
  }

  // Getter para acceder fácilmente a los campos del formulario
  get f() {
    return this.loginForm.controls;
  }

  // Función de login
  onLogin() {
    this.submitted = true;

    // Si el formulario es inválido, no hacer nada
    if (this.loginForm.invalid) {
      return;
    }

    // Aquí obtienes los valores del formulario
    const email = this.loginForm.value.email;
    const password = this.loginForm.value.password;
    const remember = this.loginForm.value.remember;

    console.log('Email:', email);
    console.log('Password:', password);
    console.log('Remember:', remember);

    // NAVEGAR A LA SIGUIENTE PÁGINA
    // Cambia '/restaurant' por la ruta que necesites
    this.router.navigate(['/dashboard']);
  }

  // Login con Google (opcional, para después)
  onGoogleLogin() {
    console.log('Google login clicked');
    // this.router.navigate(['/restaurant']);
  }

}