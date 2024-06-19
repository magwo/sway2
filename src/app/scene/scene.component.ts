import { Component, computed, input, untracked } from '@angular/core';
import { PlantComponent } from './plant/plant.component';
import { RandomGenerator } from '../../procedural/random';
import { Plant } from '../../procedural/plant';
import { Time } from '../app';
import { GenesComponent } from './genes/genes.component';
import { PlantGenes } from '../../procedural/plant-genes';

class HslaColor {
  constructor(
    public readonly h: number,
    public readonly s: number,
    public readonly l: number,
    public readonly a: number
  ) {}

  static withModifiedAlpha(c: HslaColor, a: number) {
    return new HslaColor(c.h, c.s, c.l, a);
  }
  toString() {
    return `hsla(${Math.round(this.h)}, ${Math.round(this.s)}%, ${Math.round(this.l)}%, ${this.a})`;
  }
}

@Component({
  selector: 'sway-scene',
  standalone: true,
  imports: [PlantComponent, GenesComponent],
  templateUrl: './scene.component.html',
  styleUrl: './scene.component.scss',
})
export class SceneComponent {
  time = input.required<Time>();

  genesSeed = input.required<string>();
  themeSeed = input.required<string>();

  plantCountOffset = input.required<number>();

  genesGenerator = computed<RandomGenerator>(() => {
    return new RandomGenerator(this.genesSeed());
  });

  themeGenerator = computed<RandomGenerator>(() => {
    return new RandomGenerator(this.themeSeed());
  });

  gradientGenerator = computed<RandomGenerator>(() => {
    return this.themeGenerator().getDerivedGenerator(0);
  });

  genes = computed<PlantGenes>(() => {
    return PlantGenes.generateNew(this.genesGenerator());
  });

  plants = computed<Plant[]>(() => {
    const genes = this.genes();
    const genesGenerator = this.genesGenerator();
    const plantCount = 3;
    const countOffset = this.plantCountOffset();

    const currentTime = untracked(() => {
      return this.time().currentTime;
    });
    const preGrowToAge = currentTime;

    return [...Array(plantCount)].map((_, i) => {
      const plantGenerator = genesGenerator.getDerivedGenerator(countOffset + i);
      const alternator = i % 2 === 0 ? -1 : 1;
      const plant = new Plant(
        {
          x: 100 + 60 * Math.ceil(i / 2) * alternator,
          y: 150 + 10 * Math.random(),
        },
        genes,
        plantGenerator
      );
      plant.preGrow(preGrowToAge, currentTime);
      return plant;
    });
  });

  protected generalSaturationMultiplier = computed<number>(() => {
    const gradientGenerator = this.gradientGenerator();
    return Math.max(gradientGenerator.getFloat(0.01, 2.0));
  });

  protected primaryColorGradient = computed<[HslaColor, HslaColor]>(() => {
    const gradientGenerator = this.gradientGenerator();

    const hue1 = gradientGenerator.getInteger(0, 359)
    const hue2 = hue1 + 10 + gradientGenerator.getInteger(360-10*2);
    const saturation = gradientGenerator.getInteger(60, 100) * this.generalSaturationMultiplier();
    const lightness = gradientGenerator.getInteger(30, 60);
    
    const start = new HslaColor(hue1, saturation, lightness, 1);
    const end = new HslaColor(hue2, saturation, lightness, 1);

    return [start, end];
  });

  protected additionalColorGradient = computed<[HslaColor, HslaColor]>(() => {
    const gradientGenerator = this.gradientGenerator();

    const hue = gradientGenerator.getInteger(0, 359)
    const saturation = gradientGenerator.getInteger(60, 100) * this.generalSaturationMultiplier();
    const lightness = gradientGenerator.getInteger(30, 60);
    
    const start = new HslaColor(hue, saturation, lightness, 1);
    const end = new HslaColor(hue, saturation, lightness, 0);

    return [start, end];
  });

  protected lightGradient = computed<[HslaColor, HslaColor]>(() => {
    const gradientGenerator = this.gradientGenerator();

    const hue = gradientGenerator.getInteger(0, 360)
    const saturation = gradientGenerator.getInteger(40, 100) * this.generalSaturationMultiplier();
    const lightness = gradientGenerator.getInteger(60, 100);
    
    const start = new HslaColor(hue, saturation, lightness, 1);
    const end = new HslaColor(hue, saturation, lightness, 0);

    return [start, end];
  });

  protected overlayGradient = computed<[HslaColor, HslaColor]>(() => {
    const gradientGenerator = this.gradientGenerator();

    const lightGradient = this.lightGradient();

    const startAlpha = gradientGenerator.getFloat(0.2, 1.0);
    const endAlpha = Math.min(startAlpha, gradientGenerator.getFloat(0.1, 0.4));
    
    const start = HslaColor.withModifiedAlpha(lightGradient[0], startAlpha);
    const end = HslaColor.withModifiedAlpha(lightGradient[1], endAlpha);

    return [start, end];
  });
}
