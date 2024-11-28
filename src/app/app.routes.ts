import { Routes } from '@angular/router';
import { ImageProcessingComponent } from './domains/shared/pages/image-processing/image-processing.component';
import { HomeComponent } from './domains/modules/home/home.component';

export const routes: Routes = [
    { path: '', component: ImageProcessingComponent },
    { path: 'image-processing', component: HomeComponent },
];
