import { Component, OnInit, OnDestroy } from '@angular/core';
import { FirebaseService } from '../../services/firebase.services';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone:false
})
export class DashboardPage implements OnInit, OnDestroy {
  public readonly user$: Observable<any>;
  public readonly favorites$: Observable<any[]>;

  public selectedApi: string = '';
  public currentUser: any; 

  private userSubscription: Subscription | undefined;

  public readonly apiCategories = [
    { title: 'Chiste', value: 'joke', icon: 'happy-outline' },
    { title: 'Gato', value: 'cat', icon: 'paw-outline' },
    { title: 'Perro', value: 'dog', icon: 'paw' },
    { title: 'Chiste con Mascota', value: 'combo', icon: 'chatbubbles-outline' },
    { title: 'Color Aleatorio', value: 'colors', icon: 'color-palette-outline' }
  ];

  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly router: Router
  ) {
    this.user$ = this.firebaseService.afAuth.authState;
    this.favorites$ = this.firebaseService.favorites$;
  }

  ngOnInit() {
    this.userSubscription = this.user$.subscribe(async (user) => {
      this.currentUser = user;
      if (user) {
        const cachedFavorites = await this.firebaseService.getFavoritesFromCache(user.uid);
        if (cachedFavorites && this.favorites$ instanceof BehaviorSubject) {
          (this.favorites$ as BehaviorSubject<any[]>).next(cachedFavorites);
        }
      } else {
        this.router.navigate(['/login']);
      }
    });
  }
  
  ngOnDestroy() {
    this.userSubscription?.unsubscribe();
  }

  logout() {
    this.firebaseService.logout();
    this.router.navigate(['/login']);
  }

  selectApi(api: string) {
    this.selectedApi = api;
  }

  removeFavorite(favId: string) {
    if (!favId) return;
    this.firebaseService.removeFavorite(favId)
      .catch(err => console.error('Error al eliminar el favorito:', err));
  }
}