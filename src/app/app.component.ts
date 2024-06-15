import { Component, Inject, computed, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SceneComponent } from './scene/scene.component';
import { Time } from './app';
import { DOCUMENT } from '@angular/common';

function random32BitsHex() {
  const rndHex = (() => {
    return Math.floor(Math.random() * 16).toString(16);
  });

  return `${rndHex()}${rndHex()}${rndHex()}${rndHex()}${rndHex()}${rndHex()}${rndHex()}${rndHex()}`;
}


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SceneComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'Sway 2';

  growSpeed = signal(0);
  time = signal<Time>({ currentTime: 0, previousTime: 0 });

  playSlow() {
    this.growSpeed.update((g) => g !== 0 ? 0 : 1);
  }

  playNormal() {
    this.growSpeed.update((g) => g !== 0 ? 0 : 10);
  }

  playFast() {
    this.growSpeed.update((g) => g !== 0 ? 0 : 100);
  }

  newTheme() {
    const newTheme = random32BitsHex();
    this.setNewSearchParam('theme', newTheme);
  }

  newGenes() {
    const newGenes = random32BitsHex();
    this.setNewSearchParam('genes', newGenes);
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
}
