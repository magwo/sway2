import { Component, ElementRef, computed, effect, input } from '@angular/core';
import { Plant } from '../../../../procedural/plant';
import { Time } from '../../../common';
import { renderFlowers, renderFruits, renderLeaves, renderPlantBranchesMarkup } from './plant-svg';
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
    return renderPlantBranchesMarkup(plant);
  });

  branchesMarkup = computed<SafeHtml>(() => {
    const time = this.time();
    const plant = this.plant();
    return this.sanitizer.bypassSecurityTrustHtml(renderPlantBranchesMarkup(plant));
  });

  // leavesMarkup = computed<SafeHtml>(() => {
  //   const time = this.time();
  //   const plant = this.plant();
  //   return this.sanitizer.bypassSecurityTrustHtml(renderLeaves(plant));
  // });

  // flowersMarkup = computed<SafeHtml>(() => {
  //   const time = this.time();
  //   const plant = this.plant();
  //   return this.sanitizer.bypassSecurityTrustHtml(renderFlowers(plant));
  // });

  // fruitsMarkup = computed<SafeHtml>(() => {
  //   const time = this.time();
  //   const plant = this.plant();
  //   return this.sanitizer.bypassSecurityTrustHtml(renderFruits(plant));
  // });

  constructor(private elRef:ElementRef, private sanitizer: DomSanitizer) {
    // effect(() => {
    //   // Crate SVG DOM on first render
    //   const time = this.time();
    //   const plant = this.plant();
    // });
    effect(() => {
      const time = this.time();
      const plant = this.plant();

      if(time.currentTime !== time.previousTime) {
        plant.simulate(time.currentTime - time.previousTime, time.currentTime);
      }
    });
  }
}
