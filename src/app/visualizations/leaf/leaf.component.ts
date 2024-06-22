import { Component, computed, signal } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { PlantGeneData, PlantGenes } from '../../../procedural/plant-genes';
import { RandomGenerator } from '../../../procedural/random';
import { createRadialArrowsLeafPath } from '../../main/scene/plant/leaves-svg';

@Component({
  selector: 'app-leaf',
  standalone: true,
  imports: [],
  templateUrl: './leaf.component.html',
  styleUrl: './leaf.component.scss'
})
export class LeafComponent {

  private genes = signal<PlantGenes[]>([]);
  
  leaves = computed<{genes: PlantGeneData, path: SafeHtml}[]>(() => {
    // TODO: Support more than one type of leaf
    const genes = this.genes();
    const result = genes.map(g => {
      const pathElem = `<path d="${createRadialArrowsLeafPath(g.data.leafSubCount, g.data.leafSubPointyness, g.data.leafElongation)}" />`;
      return {genes: g.data, path: this.sanitizer.bypassSecurityTrustHtml(pathElem)};
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
    const genesCount = 9;
    const parentGenerator = new RandomGenerator(Math.random().toString()); // TODO: Seed could be a route parameter
    const genes = [...Array(genesCount)].map((_, i) => {
      const leafGenerator = parentGenerator.getDerivedGenerator(i);
      const leafGenes = PlantGenes.generateNew(leafGenerator);
      return leafGenes;
    });
    this.genes.set(genes);
  }
}
