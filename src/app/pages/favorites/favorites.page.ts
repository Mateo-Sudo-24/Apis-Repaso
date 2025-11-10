import { Component, OnInit, OnDestroy } from '@angular/core';
import { FirebaseService } from '../../services/firebase.services';
import { AlertController } from '@ionic/angular';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-favorites',
  templateUrl: './favorites.page.html',
  styleUrls: ['./favorites.page.scss'],
  standalone:false
})
export class FavoritesPage implements OnInit, OnDestroy {
  public readonly user$: Observable<any>;
  public readonly favorites$: Observable<any[]>;


  public selectedCategory: string = 'all';
  private userSubscription: Subscription | undefined;

  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly alertCtrl: AlertController
  ) {
    this.user$ = this.firebaseService.afAuth.authState;
    this.favorites$ = this.firebaseService.favorites$;
  }

  ngOnInit() {
    this.userSubscription = this.user$.subscribe(async (user) => {
      if (user) {
        const cachedFavorites = await this.firebaseService.getFavoritesFromCache(user.uid);
        if (cachedFavorites && this.favorites$ instanceof BehaviorSubject) {
          (this.favorites$ as BehaviorSubject<any[]>).next(cachedFavorites);
        }
      }
    });
  }

  ngOnDestroy() {
    this.userSubscription?.unsubscribe();
  }

  segmentChanged(event: any) {
    this.selectedCategory = event.detail.value;
  }

  async removeFavorite(favId: string) {
    if (!favId) return;

    const alert = await this.alertCtrl.create({
      header: 'Confirmar Eliminación',
      message: '¿Estás seguro de que quieres eliminar este favorito?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          handler: () => {
            this.firebaseService.removeFavorite(favId)
              .catch(err => console.error('Error al eliminar:', err));
          },
        },
      ],
    });
    await alert.present();
  }
}