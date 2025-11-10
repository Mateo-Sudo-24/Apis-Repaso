import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FirebaseService } from '../../services/firebase.services';
import { AlertController, LoadingController } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-api-display',
  templateUrl: './api-display.component.html',
  styleUrls: ['./api-display.component.scss'],
  standalone: false
})
export class ApiDisplayComponent implements OnChanges {
  @Input() api: string = '';
  @Input() user: any;

  public data: any = null;
  public isLoading: boolean = false;
  public error: string | null = null;

  constructor(
    private http: HttpClient,
    private firebaseService: FirebaseService,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['api']) {
      this.fetchData();
    }
    
    // Debug: Verificar cuando cambia el usuario
    if (changes['user']) {
      console.log('👤 Usuario recibido en api-display:', this.user);
    }
  }

  async fetchData() {
    if (!this.api) return;

    this.isLoading = true;
    this.data = null;
    this.error = null;

    try {
      if (this.api === 'joke') {
        this.data = await firstValueFrom(this.http.get('https://v2.jokeapi.dev/joke/Any?lang=es'));
      } else if (this.api === 'cat') {
        const res = await firstValueFrom(this.http.get<any[]>('https://api.thecatapi.com/v1/images/search'));
        this.data = res[0];
      } else if (this.api === 'dog') {
        this.data = await firstValueFrom(this.http.get('https://dog.ceo/api/breeds/image/random'));
      } else if (this.api === 'quote') {
        this.data = await firstValueFrom(this.http.get('https://api.quotable.io/random'));
      } else if (this.api === 'colors') {
        const colors = await firstValueFrom(this.http.get<any[]>('https://www.colourlovers.com/api/colors/random?format=json'));
        this.data = colors[0];
      } else if (this.api === 'combo') {
        const [joke, animalResponse] = await Promise.all([
          firstValueFrom(this.http.get('https://v2.jokeapi.dev/joke/Any?lang=es')),
          Math.random() > 0.5
            ? firstValueFrom(this.http.get<any[]>('https://api.thecatapi.com/v1/images/search'))
            : firstValueFrom(this.http.get('https://dog.ceo/api/breeds/image/random'))
        ]);
        
        const isCat = Array.isArray(animalResponse);
        this.data = { 
          joke, 
          animal: isCat ? animalResponse[0] : animalResponse, 
          type: isCat ? 'cat' : 'dog' 
        };
      }
      
      console.log('Datos cargados:', this.data);
    } catch (error: any) {
      console.error('API fetch error:', error);
      this.error = `No se pudieron cargar los datos. Es posible que la API no esté disponible. (Error: ${error.status})`;
    } finally {
      this.isLoading = false;
    }
  }

  async saveFavorite() {
    // 🔍 DEBUGGING COMPLETO
    console.log('========== INICIO GUARDADO ==========');
    console.log('Usuario completo:', this.user);
    console.log('Usuario UID:', this.user?.uid);
    console.log('Datos a guardar:', this.data);
    console.log('API Type:', this.api);
    console.log('====================================');

    // Validación mejorada
    if (!this.user) {
      console.error('ERROR: No hay usuario');
      const alert = await this.alertCtrl.create({
        header: 'Error',
        message: 'Debes iniciar sesión para guardar favoritos.',
        buttons: ['OK'],
      });
      await alert.present();
      return;
    }

    if (!this.user.uid) {
      console.error('ERROR: Usuario sin UID');
      const alert = await this.alertCtrl.create({
        header: 'Error',
        message: 'Usuario no válido. Intenta cerrar sesión e iniciar de nuevo.',
        buttons: ['OK'],
      });
      await alert.present();
      return;
    }

    if (!this.data) {
      console.error('ERROR: No hay datos para guardar');
      const alert = await this.alertCtrl.create({
        header: 'Error',
        message: 'No hay datos para guardar. Intenta cargar el contenido de nuevo.',
        buttons: ['OK'],
      });
      await alert.present();
      return;
    }

    // Mostrar loading
    const loading = await this.loadingCtrl.create({
      message: 'Guardando...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      console.log('Llamando a saveFavorite del servicio...');
      
      const result = await this.firebaseService.saveFavorite(
        this.data, 
        this.user.uid, 
        this.api
      );
      
      console.log('Resultado del guardado:', result);
      
      await loading.dismiss();
      
      const alert = await this.alertCtrl.create({
        header: '¡Guardado!',
        message: 'Tu favorito ha sido guardado correctamente.',
        buttons: ['OK'],
      });
      await alert.present();
      
      console.log('========== FIN GUARDADO EXITOSO ==========');
    } catch (error: any) {
      console.error('========== ERROR AL GUARDAR ==========');
      console.error(' Error completo:', error);
      console.error(' Mensaje:', error.message);
      console.error(' Código:', error.code);
      console.error(' Stack:', error.stack);
      console.error('======================================');
      
      await loading.dismiss();
      
      const alert = await this.alertCtrl.create({
        header: 'Error',
        message: `No se pudo guardar el favorito.\n\nError: ${error.message || error.code || 'Desconocido'}\n\nRevisa la consola para más detalles.`,
        buttons: ['OK'],
      });
      await alert.present();
    }
  }
}