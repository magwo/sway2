import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SceneComponent } from './scene/scene.component';
import { Time } from './app';

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
    this.growSpeed.update((g) => g !== 0 ? 0 : 0.5);
  }

  playNormal() {
    this.growSpeed.update((g) => g !== 0 ? 0 : 1);
  }

  playFast() {
    this.growSpeed.update((g) => g !== 0 ? 0 : 3);
  }

  newTheme() {
    this.themeCounter.update((tc => tc+1));
  }

  themeCounter = signal(10000*Math.random());

  constructor() {
    // TODO: Use requestAnimationFrame
    setInterval(() => {
      if (this.growSpeed() > 0) {
        this.time.update((t) => {
          return {
            currentTime: t.currentTime + 0.05 * this.growSpeed(),
            previousTime: t.currentTime,
          }
        });
      }
    }, 1000/60);
  }
}
