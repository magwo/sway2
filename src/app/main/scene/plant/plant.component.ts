import { Component, ElementRef, computed, effect, input, untracked, viewChild } from '@angular/core';
import { Plant } from '../../../../procedural/plant';
import { Time } from '../../../common';
import { renderFlowers, renderFruits, renderLeaves, renderPlantBranchesPath, updateLeaves } from './plant-svg';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';

@Component({
  selector: '[swayPlant]',
  standalone: true,
  imports: [CommonModule],
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

  private leavesElement = viewChild.required<ElementRef<SVGGElement>>('leaves');

  leavesMarkup = computed<string>(() => {
    const plant = this.plant();
    return renderLeaves(plant);
  });

  flowersMarkup = computed<SafeHtml>(() => {
    const time = this.time();
    const plant = this.plant();
    return this.sanitizer.bypassSecurityTrustHtml(renderFlowers(plant));
  });

  fruitsMarkup = computed<SafeHtml>(() => {
    const time = this.time();
    const plant = this.plant();
    return this.sanitizer.bypassSecurityTrustHtml(renderFruits(plant));
  });

  constructor(private sanitizer: DomSanitizer) {
    let first = true;
    effect(() => {
      const time = this.time();
      const plant = this.plant();

      if(time.currentTime !== time.previousTime) {
        plant.simulate(time.currentTime - time.previousTime, time.currentTime);
      }
    });

    effect(() => {
      const time = this.time();
      const plant = this.plant();
      const leavesElement = this.leavesElement();
      if (first) {
        leavesElement.nativeElement.innerHTML = untracked(() => this.leavesMarkup());
        first = false;
      }
      updateLeaves(plant, leavesElement.nativeElement);
    })
  }
}
