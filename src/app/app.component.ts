import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ImageProcessingComponent } from "./domains/shared/pages/image-processing/image-processing.component";
import { AppShellComponent } from "./domains/shared/components/app-shell/app-shell.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ImageProcessingComponent, AppShellComponent],
  templateUrl: './app.component.html',
})
export class AppComponent {
  title = 'workstation-poc';
}
