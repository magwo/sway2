import { Routes } from '@angular/router';
import { LeafComponent } from './visualizations/leaf/leaf.component';
import { FlowerComponent } from './visualizations/flower/flower.component';
import { FruitComponent } from './visualizations/fruit/fruit.component';
import { MainComponent } from './main/main.component';

export const routes: Routes = [
    { path: '', pathMatch: 'full', component: MainComponent, },
    { path: 'visualizations/leaf', component: LeafComponent, },
    { path: 'visualizations/leaf', component: LeafComponent, },
    { path: 'visualizations/flower', component: FlowerComponent, },
    { path: 'visualizations/fruit', component: FruitComponent, },
];
