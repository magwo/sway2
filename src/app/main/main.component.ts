import { Component, Inject, OnInit, computed, signal } from '@angular/core';
import { SceneComponent } from './scene/scene.component';
import { Time } from '../common';
import { CommonModule, DOCUMENT } from '@angular/common';
import { RouterLink } from '@angular/router';

function random32BitsHex() {
  const rndHex = (() => {
    return Math.floor(Math.random() * 16).toString(16);
  });

  return `${rndHex()}${rndHex()}${rndHex()}${rndHex()}${rndHex()}${rndHex()}${rndHex()}${rndHex()}`;
}

@Component({
  selector: 'sway-main',
  standalone: true,
  imports: [SceneComponent, RouterLink],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss',
})
export class MainComponent implements OnInit {
  growSpeed = signal(10);
  time = signal<Time>({ currentTime: 0, previousTime: 0 });

  regrowthCounter = signal<number>(0);

  playSlow() {
    this.growSpeed.update((g) => g !== 3 ? 3 : 0);
  }

  playNormal() {
    this.growSpeed.update((g) => g !== 10 ? 10 : 0);
  }

  playFast() {
    this.growSpeed.update((g) => g !== 100 ? 100 : 0);
  }

  regrow() {
    this.time.set({ currentTime: 0, previousTime: 0 });
    this.regrowthCounter.update(val => val + 1);
  }

  newTheme() {
    const newTheme = random32BitsHex();
    this.setNewSearchParam('theme', newTheme);
  }

  newGenes() {
    const newGenes = random32BitsHex();
    this.setNewSearchParam('genes', newGenes);
  }

  newPlants() {
    const currentOffset = this.plantOffset();
    this.setNewSearchParam('offset', (currentOffset + 10).toString());
  }

  private setNewSearchParam(key: string, value: string) {
    const searchParams = this.searchParams();
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set(key, value);
    this.searchParams.set(newSearchParams);

    const location = new URL(this.document.location.toString());
    location.search = newSearchParams.toString();
    window.history.pushState({}, '', location);
  }

  searchParams = signal(new URLSearchParams(this.document.location.search));

  genes = computed<string>(() => {
    const searchParams = this.searchParams();
    return searchParams.get('genes') ?? '';
  });

  geneOverrides = computed<string | null>(() => {
    const searchParams = this.searchParams();
    return searchParams.get('geneOverrides') ?? '';
  });

  theme = computed<string>(() => {
    const searchParams = this.searchParams();
    return searchParams.get('theme') ?? '';
  });

  plantOffset = computed<number>(() => {
    const searchParams = this.searchParams();
    return parseInt(searchParams.get('offset') ?? '0');
  });

  constructor(@Inject(DOCUMENT) private document: Document) {
    // TODO: Use requestAnimationFrame instead
    setInterval(() => {
      if (this.growSpeed() > 0) {
        const currentTime = this.time().currentTime;
        // const newCurrentTime = Math.min(90, this.time().currentTime + (1/60) * this.growSpeed());
        const newCurrentTime = this.time().currentTime + (1/60) * this.growSpeed();
        if (currentTime !== newCurrentTime) {
          this.time.set({
              currentTime: newCurrentTime,
              previousTime: currentTime,
            });
        }
      }
    }, 1000/60);
  }

  ngOnInit() {
    // ?genes=7c370b46&theme=cebc2379)
    const genes = this.genes();
    if (!genes || genes.length === 0) {
      this.setNewSearchParam('genes', '7c370b46');
    }
    const theme = this.theme();
    if (!theme || theme.length === 0) {
      this.setNewSearchParam('theme', 'cebc2379');
    }
  }
}
