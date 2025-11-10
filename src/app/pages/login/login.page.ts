import { Component } from '@angular/core';
import { FirebaseService } from '../../services/firebase.services';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false
})
export class LoginPage {
  email: string = '';
  password: string = '';
  isRegister: boolean = false;

  constructor(
    private firebaseService: FirebaseService,
    private router: Router,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController
  ) {}

  async handleSubmit() {
    // El código del loading es correcto, no se necesita cambiar
    const loading = await this.loadingCtrl.create({
      message: this.isRegister ? 'Creando cuenta...' : 'Iniciando sesión...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      if (this.isRegister) {
        // Esta función ahora crea el usuario Y lo guarda en Firestore
        await this.firebaseService.register(this.email, this.password);
        await loading.dismiss();

        const alert = await this.alertCtrl.create({
          header: 'Registro exitoso',
          // [CAMBIO] Mensaje ajustado para reflejar que el usuario ya puede iniciar sesión.
          message: 'Tu cuenta ha sido creada. Ahora puedes iniciar sesión.',
          buttons: ['OK']
        });
        await alert.present();
        this.toggleMode(); // Vuelve al modo login para que el usuario pueda entrar
      } else {
        await this.firebaseService.login(this.email, this.password);
        await loading.dismiss();
        this.router.navigate(['/dashboard']);
      }
    } catch (error: any) {
      await loading.dismiss();
      const alert = await this.alertCtrl.create({
        header: 'Error',
        message: error.message, // Muestra el error devuelto por Firebase
        buttons: ['OK']
      });
      await alert.present();
    }
  }

  async resetPassword() {
    // Esta función es correcta, no necesita cambios.
    if (!this.email) {
      const alert = await this.alertCtrl.create({
        header: 'Aviso',
        message: 'Por favor, ingresa tu correo electrónico para recuperar tu contraseña.',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }

    try {
      await this.firebaseService.resetPassword(this.email);
      const alert = await this.alertCtrl.create({
        header: 'Recuperación enviada',
        message: 'Revisa tu correo electrónico para restablecer tu contraseña.',
        buttons: ['OK']
      });
      await alert.present();
    } catch (error: any) {
      const alert = await this.alertCtrl.create({
        header: 'Error',
        message: error.message,
        buttons: ['OK']
      });
      await alert.present();
    }
  }

  toggleMode() {
    this.isRegister = !this.isRegister;
  }
}