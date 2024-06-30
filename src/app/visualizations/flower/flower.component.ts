import { Component, computed, signal } from '@angular/core';
import { PlantGeneData, PlantGenes } from '../../../procedural/plant-genes';
import { RandomGenerator } from '../../../procedural/random';
import { createFlowerMarkup } from '../../main/scene/plant/flowers-svg';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-flower',
  standalone: true,
  imports: [],
  templateUrl: './flower.component.html',
  styleUrl: './flower.component.scss'
})
export class FlowerComponent {

  private genes = signal<PlantGenes[]>([]);
  
  flowers = computed<{genes: PlantGeneData, markup: SafeHtml}[]>(() => {
    const genes = this.genes();
    const result = genes.map(g => {
      const markup = this.sanitizer.bypassSecurityTrustHtml(createFlowerMarkup(g.data));
      return {genes: g.data, markup};
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

  constructor(private sanitizer: DomSanitizer) {
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
