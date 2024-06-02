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
    return `translate(${pos.x}, ${pos.y})`;
  });

  svgPath = computed<string>(() => {
    return `M 1 0 L 1 -5 L 3 -6 L 1 -7 L 0 -15 L -1 -2 Z`;
  });
}
