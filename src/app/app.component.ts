import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ImageProcessingComponent } from "./domains/shared/pages/image-processing/image-processing.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ImageProcessingComponent],
  templateUrl: './app.component.html',
})
export class AppComponent {
  title = 'workstation-poc';
}
