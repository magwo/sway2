import { Component, computed, input } from '@angular/core';
import { PlantComponent } from './plant/plant.component';
import { RandomGenerator } from '../../procedural/random';
import { Plant } from '../../procedural/plant';
import { Time } from '../app';

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
  imports: [PlantComponent],
  templateUrl: './scene.component.html',
  styleUrl: './scene.component.scss',
})
export class SceneComponent {
  time = input.required<Time>();
  plants: Plant[];

  themeCounter = input.required<number>();

  private gradientGenerator: RandomGenerator;

  constructor() {
    // TODO: Maybe don't use getRandom stuff in signals?
    // TODO: Seed with proper seed function etc
    const rootGenerator = new RandomGenerator([Math.round(1000000*Math.random()), 2, 3, 4]);

    const plantsGenerator = rootGenerator.getDerivedGenerator(0);
    this.gradientGenerator = rootGenerator.getDerivedGenerator(1);

    const plantCount = 3;
    // const plantCount = plantsGenerator.getInteger(4, 6);

    // TODO: Maybe use a signal, maybe not
    this.plants = [...Array(plantCount)].map((_, i) => {
      const plantGenerator = plantsGenerator.getDerivedGenerator(i);
      const alternator = i % 2 === 0 ? -1 : 1;
      return new Plant(
        {
          x: 50 + 30 * Math.ceil(i / 2) * alternator,
          y: 90 + 5 * Math.random(),
        },
        plantGenerator
      );
    });
  }

  protected generalSaturationMultiplier = computed<number>(() => {
    const themeCounter = this.themeCounter();
    return Math.max(this.gradientGenerator.getFloat(0.01, 2.0));
  });

  protected primaryColorGradient = computed<[HslaColor, HslaColor]>(() => {
    const themeCounter = this.themeCounter();

    const hue1 = this.gradientGenerator.getInteger(0, 360)
    const hue2 = hue1 + 10 + this.gradientGenerator.getInteger(360-10*2);
    const saturation = this.gradientGenerator.getInteger(60, 100) * this.generalSaturationMultiplier();
    const lightness = this.gradientGenerator.getInteger(30, 60);
    
    const start = new HslaColor(hue1, saturation, lightness, 1);
    const end = new HslaColor(hue2, saturation, lightness, 1);

    return [start, end];
  });

  protected additionalColorGradient = computed<[HslaColor, HslaColor]>(() => {
    const themeCounter = this.themeCounter();

    const hue = this.gradientGenerator.getInteger(0, 360)
    const saturation = this.gradientGenerator.getInteger(60, 100) * this.generalSaturationMultiplier();
    const lightness = this.gradientGenerator.getInteger(30, 60);
    
    const start = new HslaColor(hue, saturation, lightness, 1);
    const end = new HslaColor(hue, saturation, lightness, 0);

    return [start, end];
  });

  protected lightGradient = computed<[HslaColor, HslaColor]>(() => {
    const themeCounter = this.themeCounter();

    const hue = this.gradientGenerator.getInteger(0, 360)
    const saturation = this.gradientGenerator.getInteger(40, 100) * this.generalSaturationMultiplier();
    const lightness = this.gradientGenerator.getInteger(60, 100);
    
    const start = new HslaColor(hue, saturation, lightness, 1);
    const end = new HslaColor(hue, saturation, lightness, 0);

    return [start, end];
  });

  protected overlayGradient = computed<[HslaColor, HslaColor]>(() => {
    const lightGradient = this.lightGradient();

    const startAlpha = this.gradientGenerator.getFloat(0.2, 1.0);
    const endAlpha = Math.min(startAlpha, this.gradientGenerator.getFloat(0.1, 0.4));
    
    const start = HslaColor.withModifiedAlpha(lightGradient[0], startAlpha);
    const end = HslaColor.withModifiedAlpha(lightGradient[1], endAlpha);

    return [start, end];
  });
}
