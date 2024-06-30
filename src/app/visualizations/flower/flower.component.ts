import { Component, computed, signal } from '@angular/core';
import { PlantGeneData, PlantGenes } from '../../../procedural/plant-genes';
import { RandomGenerator } from '../../../procedural/random';
import { createFlowerPath } from '../../main/scene/plant/flowers-svg';

@Component({
  selector: 'app-flower',
  standalone: true,
  imports: [],
  templateUrl: './flower.component.html',
  styleUrl: './flower.component.scss'
})
export class FlowerComponent {

  private genes = signal<PlantGenes[]>([]);
  
  flowers = computed<{genes: PlantGeneData, path: string}[]>(() => {
    const genes = this.genes();
    const result = genes.map(g => {
      const path = createFlowerPath(g.data);
      return {genes: g.data, path};
    });
    return result;
  });

  copyMarkup(e: MouseEvent) {
    if (e.target && (e.target as HTMLElement).hasAttribute('d')) {
      const pathStr = (e.target as HTMLElement).getAttribute('d')!;
      navigator.clipboard.writeText(pathStr)
      .then(() => console.log('copied path', pathStr), error => console.error('failed to copy', error));
    } 
  }

  constructor() {
    const genesCount = 20;
    const parentGenerator = new RandomGenerator(Math.random().toString()); // TODO: Seed could be a route parameter
    const genes = [...Array(genesCount)].map((_, i) => {
      const flowerGenerator = parentGenerator.getDerivedGenerator(`flowers${i}`);
      const flowerGenes = PlantGenes.generateNew(flowerGenerator);
      return flowerGenes;
    });
    this.genes.set(genes);
  }
}
