import { Component, ElementRef, computed, effect, input, untracked, viewChild } from '@angular/core';
import { Plant } from '../../../../procedural/plant';
import { Time } from '../../../common';
import { renderFlowers, renderFruits, renderLeaves, renderPlantBranchesPath, updateFlowers, updateLeaves } from './plant-svg';
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
  private flowersElement = viewChild.required<ElementRef<SVGGElement>>('flowers');

  leavesMarkup = computed<string>(() => {
    const plant = this.plant();
    return renderLeaves(plant);
  });

  flowersMarkup = computed<string>(() => {
    const plant = this.plant();
    return renderFlowers(plant);
    // const time = this.time();
    // const plant = this.plant();
    // return this.sanitizer.bypassSecurityTrustHtml(renderFlowers(plant));
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
      const flowersElement = this.flowersElement();
      if (first) {
        leavesElement.nativeElement.innerHTML = untracked(() => this.leavesMarkup());
        flowersElement.nativeElement.innerHTML = untracked(() => this.flowersMarkup());
        first = false;
      }
      updateLeaves(plant, leavesElement.nativeElement);
      updateFlowers(plant, flowersElement.nativeElement);
    })
  }
}
