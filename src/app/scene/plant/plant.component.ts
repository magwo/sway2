import { Component, computed, input } from '@angular/core';
import { Position } from '../../../procedural/position';

@Component({
  selector: '[swayPlant]',
  standalone: true,
  imports: [],
  templateUrl: './plant.component.html',
  styleUrl: './plant.component.scss',
  host: {
    '[attr.transform]': 'transform()',
  }
})
export class PlantComponent {
  position = input.required<Position>();

  transform = computed<string>(() => {
    const pos = this.position();
    return `translate(${pos[0]}, ${pos[1]})`;
  });
}
