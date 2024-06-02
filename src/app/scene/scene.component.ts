import { Component, input } from '@angular/core';
import { PlantComponent } from './plant/plant.component';
import { RandomGenerator } from '../../procedural/random';
import { Plant } from '../../procedural/plant';
import { Time } from '../app';

@Component({
  selector: 'sway-scene',
  standalone: true,
  imports: [PlantComponent],
  templateUrl: './scene.component.html',
  styleUrl: './scene.component.scss',
})
export class SceneComponent {
  time = input.required<Time>();
  plants: Plant[];

  constructor() {
    const rootGenerator = new RandomGenerator([1, 2, 3, 4]);

    const plantsGenerator = rootGenerator.getDerivedGenerator(0);
    const plantCount = 3;
    // const plantCount = plantsGenerator.getInteger(4, 6);

    this.plants = [...Array(plantCount)].map((_, i) => {
      const plantGenerator = plantsGenerator.getDerivedGenerator(i);
      const alternator = i % 2 === 0 ? -1 : 1;
      return new Plant({ x: 50 + 30 * Math.ceil(i / 2) * alternator, y: 90 + 5 * Math.random() }, plantGenerator);
    });
  }
}
