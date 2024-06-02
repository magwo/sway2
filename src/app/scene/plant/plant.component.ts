import { Component, computed, effect, input } from '@angular/core';
import { Plant } from '../../../procedural/plant';
import { Time } from '../../app';
import { renderFlowers, renderPlantBranchesPath } from './plant-svg';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

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
  plant = input.required<Plant>();
  time = input.required<Time>();

  transform = computed<string>(() => {
    const pos = this.plant().position;
    return `translate(${pos.x}, ${pos.y})`;
  });

  branchesPath = computed<string>(() => {
    const time = this.time();
    const plant = this.plant();
    return renderPlantBranchesPath(plant);
  });

  flowersMarkup = computed<SafeHtml>(() => {
    const time = this.time();
    const plant = this.plant();
    return this.sanitizer.bypassSecurityTrustHtml(renderFlowers(plant));
  });

  constructor(private sanitizer: DomSanitizer) {
    effect(() => {
      const time = this.time();
      const plant = this.plant();

      if(time.currentTime !== time.previousTime) {
        plant.grow(time.currentTime - time.previousTime);
      }
    });
  }
}
