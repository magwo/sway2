import { Component, computed, input, signal } from '@angular/core';
import { PlantGenes } from '../../../../procedural/plant-genes';
import { TypeofPipe } from '../../../pipes';
import { Color } from '../../../../procedural/color';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'sway-genes',
  standalone: true,
  imports: [TypeofPipe, DecimalPipe],
  templateUrl: './genes.component.html',
  styleUrl: './genes.component.scss'
})
export class GenesComponent {
  genes = input.required<PlantGenes>();

  isExpanded = signal(false);

  protected displayGenes = computed<{name: string, value: string | number}[]>(() => {
    const genes = this.genes();
    const entries = Object.entries(genes.data).map((keyValuePair) => {
      return {name: keyValuePair[0], value: keyValuePair[1] };
    }).sort((o1, o2) => {
      return o1.name.localeCompare(o2.name)
    });
    return entries;
  });

  toggleExpanded() {
    this.isExpanded.update(val => !val);
  }
}
