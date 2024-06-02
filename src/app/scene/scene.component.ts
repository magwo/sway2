import { Component } from '@angular/core';
import { PlantComponent } from './plant/plant.component';
import { RandomGenerator } from '../../procedural/random';
import { Plant } from '../../procedural/plant';

@Component({
  selector: 'sway-scene',
  standalone: true,
  imports: [PlantComponent],
  templateUrl: './scene.component.html',
  styleUrl: './scene.component.scss',
})
export class SceneComponent {
  plants: Plant[];

  constructor() {
    const rootGenerator = new RandomGenerator([1, 2, 3, 4]);

    const plantsGenerator = rootGenerator.getDerivedGenerator(0);
    const plantCount = plantsGenerator.getInteger(4, 10);

    this.plants = [...Array(plantCount)].map((_, i) => {
      const plantGenerator = plantsGenerator.getDerivedGenerator(i);
      return new Plant({ x: 20 * i, y: 100 }, plantGenerator);
    });
  }
}
