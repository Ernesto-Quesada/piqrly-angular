import { Routes } from '@angular/router';
import { AppComponent } from './app.component';

export const routes: Routes = [
    {
        path:"", redirectTo: "public", pathMatch: "full"
    },
   
    {
        path:"viewpics/:userId/:qrid",loadComponent:()=> import('./viewpic/viewpic.component').then(m => m.ViewpicComponent)
    },
    { path: '**', redirectTo: '' }
];
