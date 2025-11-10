import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { BehaviorSubject, Observable, of, from } from 'rxjs';
import { map, switchMap, tap, catchError } from 'rxjs/operators';
import firebase from 'firebase/compat/app';
import { Preferences } from '@capacitor/preferences';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  private favoritesSubject = new BehaviorSubject<any[]>([]);
  public readonly favorites$: Observable<any[]> = this.favoritesSubject.asObservable();

  constructor(
    public readonly afAuth: AngularFireAuth,
    private readonly firestore: AngularFirestore
  ) {
    // Suscribirse a cambios de autenticación
    this.afAuth.authState.pipe(
      switchMap(user => {
        if (user) {
          return this.getFavoritesFromFirestore(user.uid);
        } else {
          return of([]);
        }
      })
    ).subscribe(favorites => {
      this.favoritesSubject.next(favorites);
    });
  }

  login(email: string, password: string) {
    return this.afAuth.signInWithEmailAndPassword(email, password);
  }

  async register(email: string, password: string) {
    const userCredential = await this.afAuth.createUserWithEmailAndPassword(email, password);
    if (userCredential.user) {
      await this.saveUserData(userCredential.user);
    }
    return userCredential;
  }

  private saveUserData(user: firebase.User) {
    const userRef = this.firestore.collection('users').doc(user.uid);
    const data = { uid: user.uid, email: user.email, createdAt: new Date() };
    return userRef.set(data, { merge: true });
  }

  resetPassword(email: string) {
    return this.afAuth.sendPasswordResetEmail(email);
  }

  logout() {
    return this.afAuth.signOut();
  }

  // ==================== STORAGE LOCAL ====================
  private async setStorage(key: string, value: any): Promise<void> {
    try {
      await Preferences.set({
        key: key,
        value: JSON.stringify(value),
      });
      console.log('💾 Guardado en storage local:', key);
    } catch (error) {
      console.error('❌ Error al guardar en storage:', error);
    }
  }

  private async getStorage(key: string): Promise<any> {
    try {
      const ret = await Preferences.get({ key: key });
      return ret.value ? JSON.parse(ret.value) : null;
    } catch (error) {
      console.error('❌ Error al leer storage:', error);
      return null;
    }
  }

  private async removeStorage(key: string): Promise<void> {
    try {
      await Preferences.remove({ key: key });
    } catch (error) {
      console.error('❌ Error al eliminar de storage:', error);
    }
  }

  // ==================== FIRESTORE ====================
  private getFavoritesFromFirestore(userId: string): Observable<any[]> {
    const cacheKey = `favorites_${userId}`;
    
    return this.firestore
      .collection('favorites', ref => 
        ref.where('userId', '==', userId).orderBy('createdAt', 'desc')
      )
      .snapshotChanges()
      .pipe(
        map(actions =>
          actions.map(a => {
            const data = a.payload.doc.data() as any;
            const id = a.payload.doc.id;
            return { id, ...data };
          })
        ),
        tap(async favoritesFromFirebase => {
          // Guardar en caché local
          await this.setStorage(cacheKey, favoritesFromFirebase);
          console.log(`✅ ${favoritesFromFirebase.length} favoritos sincronizados desde Firestore`);
        }),
        catchError(error => {
          console.error('❌ Error al obtener favoritos de Firestore:', error);
          // Si falla, cargar desde caché local
          return from(this.loadFavoritesFromCache(userId));
        })
      );
  }

  private async loadFavoritesFromCache(userId: string): Promise<any[]> {
    const cacheKey = `favorites_${userId}`;
    const cached = await this.getStorage(cacheKey);
    console.log('📦 Cargando desde caché local:', cached?.length || 0, 'favoritos');
    return cached || [];
  }

  async getFavoritesFromCache(userId: string): Promise<any[] | null> {
    const cacheKey = `favorites_${userId}`;
    return this.getStorage(cacheKey);
  }

  // ==================== GUARDAR FAVORITO ====================
  async saveFavorite(data: any, userId: string, apiType?: string) {
    console.log('🔄 Iniciando guardado de favorito...');
    console.log('   User ID:', userId);
    console.log('   API Type:', apiType);
    console.log('   Datos:', data);

    try {
      // 1. Crear objeto del favorito
      const favoriteData = {
        ...data,
        api: apiType || 'Desconocido',
        userId,
        createdAt: new Date()
      };

      // 2. Guardar en Firestore
      console.log('📤 Guardando en Firestore...');
      const docRef = await this.firestore.collection('favorites').add(favoriteData);
      console.log('✅ Guardado en Firestore con ID:', docRef.id);

      // 3. Actualizar caché local
      const cacheKey = `favorites_${userId}`;
      const currentFavorites = await this.getStorage(cacheKey) || [];
      const newFavorite = { id: docRef.id, ...favoriteData };
      const updatedFavorites = [newFavorite, ...currentFavorites];
      
      await this.setStorage(cacheKey, updatedFavorites);
      console.log('✅ Caché local actualizado');
      
      // 4. Actualizar el observable para UI
      this.favoritesSubject.next(updatedFavorites);
      console.log('✅ UI actualizada');

      return docRef;
    } catch (error: any) {
      console.error('❌ Error al guardar favorito:', error);
      console.error('   Código:', error.code);
      console.error('   Mensaje:', error.message);
      
      // Si falla Firestore, al menos guardamos localmente
      if (error.code === 'permission-denied' || error.code === 'unavailable') {
        console.log('⚠️ Guardando solo localmente...');
        await this.saveFavoriteLocally(data, userId, apiType);
      }
      
      throw error;
    }
  }

  // Guardar solo localmente (fallback)
  private async saveFavoriteLocally(data: any, userId: string, apiType?: string) {
    try {
      const cacheKey = `favorites_${userId}`;
      const currentFavorites = await this.getStorage(cacheKey) || [];
      const newFavorite = {
        id: `local_${Date.now()}`,
        ...data,
        api: apiType || 'Desconocido',
        userId,
        createdAt: new Date(),
        localOnly: true
      };
      
      const updatedFavorites = [newFavorite, ...currentFavorites];
      await this.setStorage(cacheKey, updatedFavorites);
      this.favoritesSubject.next(updatedFavorites);
      
      console.log('✅ Guardado solo en storage local');
    } catch (error) {
      console.error('❌ Error al guardar localmente:', error);
      throw error;
    }
  }

  // ==================== ELIMINAR FAVORITO ====================
  async removeFavorite(favId: string) {
    console.log('🗑️ Eliminando favorito:', favId);
    
    try {
      // Si es un favorito local, solo eliminamos de caché
      if (favId.startsWith('local_')) {
        console.log('⚠️ Favorito solo local, eliminando de caché...');
        const user = await this.afAuth.currentUser;
        if (user) {
          const cacheKey = `favorites_${user.uid}`;
          const currentFavorites = await this.getStorage(cacheKey) || [];
          const updatedFavorites = currentFavorites.filter((fav: any) => fav.id !== favId);
          
          await this.setStorage(cacheKey, updatedFavorites);
          this.favoritesSubject.next(updatedFavorites);
          console.log('✅ Eliminado de caché local');
        }
        return;
      }

      // Eliminar de Firestore
      await this.firestore.collection('favorites').doc(favId).delete();
      console.log('✅ Eliminado de Firestore');
      
      // Actualizar caché local
      const user = await this.afAuth.currentUser;
      if (user) {
        const cacheKey = `favorites_${user.uid}`;
        const currentFavorites = await this.getStorage(cacheKey) || [];
        const updatedFavorites = currentFavorites.filter((fav: any) => fav.id !== favId);
        
        await this.setStorage(cacheKey, updatedFavorites);
        this.favoritesSubject.next(updatedFavorites);
        console.log('✅ Caché local actualizado');
      }
    } catch (error: any) {
      console.error('❌ Error al eliminar favorito:', error);
      throw error;
    }
  }
}