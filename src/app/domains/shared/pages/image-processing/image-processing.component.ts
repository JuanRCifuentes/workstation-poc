import { Component, signal } from '@angular/core';
import { ImageCanvasComponent } from '../../components/image-canvas/image-canvas.component';
import { IpcService } from '../../services/ipc.service';
import { CommonModule } from '@angular/common';
import * as fabric from 'fabric'; // v6

@Component({
  selector: 'app-image-processing',
  imports: [ImageCanvasComponent, CommonModule],
  templateUrl: './image-processing.component.html',
})
export class ImageProcessingComponent {
  pong = signal(false);
  imagePaths = signal([]);
  currentImage = signal("");
  private canvas!: fabric.Canvas; // Fabric.js canvas instance

  constructor(private ipcService: IpcService) { }

  ngAfterViewInit(): void {
    this.canvas = new fabric.Canvas('canvas'); // Ensure 'canvas' matches the ID in your HTML
  }

  ping = (): void => {
    this.ipcService.send("message", "ping");
    this.ipcService.on("reply6437821", (event: any, arg: string) => {
      this.pong.set(arg === "pong");
    });
  }

  getFile() {
    const userDir = process.env['HOME'] || process.env['USERPROFILE']; // Cross-platform way to get the user's home directory
    if (userDir) {
      const dirPath = `${userDir}/Documents/CCS/POCs/DOCUMENTS`;
      this.ipcService.send("get-files", dirPath);
      this.ipcService.on("get-files-reply", (event: any, arg: any) => {
        if (arg.error) {
          console.error(arg.error);
        } else {
          this.imagePaths.set(arg.files);
          this.currentImage.set(arg.files[0]);
          this.loadImageOntoCanvas(arg.files[0]);
        }
      });
    } else {
      console.error("User directory is undefined");
    }
  }

  thumbnailClick(imagePath: string): void {
    console.log("Thumbnail clicked:", imagePath);
    this.currentImage.set(imagePath);
    this.loadImageOntoCanvas(imagePath);
  }


  private async loadImageOntoCanvas(imagePath: string): Promise<void> {
    try {

      // Convert the local file path to a file:// URL
      const fileUrl = `file://${imagePath}`;

      // Clear the canvas before loading the new image
      this.canvas.clear();

      // Load the image onto the Fabric.js canvas
      const img = await fabric.Image.fromURL(fileUrl);
      if (img) {
        img.scaleToWidth(this.canvas.getWidth()); // Scale the image to fit the canvas
        img.set({ left: 0, top: 0 });
        this.canvas.add(img); // Add the image to the canvas
        this.canvas.renderAll(); // Render changes

      } else {
        console.error("Image could not be loaded.");
      }
    } catch (error) {
      console.error("Failed to load image onto canvas:", error);
    }
  }

  ngOnDestroy(): void {
    this.ipcService.removeAllListeners("reply6437821");
  }
}
