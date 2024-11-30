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
  imagePaths = signal<string[]>([]);
  currentImage = signal("");
  private canvas!: fabric.Canvas; // Fabric.js canvas instance

  constructor(private ipcService: IpcService) { }

  ngAfterViewInit(): void {
    this.canvas = new fabric.Canvas('canvas'); // Ensure 'canvas' matches the ID in your HTML
    this.addZoomHandlers(); // Add zoom functionality

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

          // Clear the canvas and load the deskewed image
          this.canvas.clear(); // Clear the canvas
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
      console.log(fileUrl)
      if (img) {
        img.scaleToWidth(this.canvas.getWidth()); // Scale the image to fit the canvas
        img.set({
          left: 0,
          top: 0,
          selectable: true, // Allow the image to be selected
          hasBorders: false, // Hide borders for resizing
          hasControls: false, // Disable controls for resizing and rotating
          lockScalingX: true, // Lock horizontal scaling
          lockScalingY: true, // Lock vertical scaling
          lockRotation: true, // Lock rotation
          lockMovementX: false, // Lock horizontal movement
          lockMovementY: false, // Lock vertical movement
        });

        this.canvas.add(img); // Add the image to the canvas
        this.canvas.renderAll(); // Render changes
      } else {
        console.error("Image could not be loaded.");
      }
    } catch (error) {
      console.error("Failed to load image onto canvas:", error);
    }
  }

  private addZoomHandlers(): void {
    // Mouse wheel zoom
    this.canvas.on('mouse:wheel', (opt: fabric.TEvent) => {
      const event = opt.e as WheelEvent;
      const delta = event.deltaY > 0 ? -0.1 : 0.1; // Zoom in or out
      const zoom = this.canvas.getZoom() + delta;

      // Limit zoom range
      if (zoom > 5) return;
      if (zoom < 0.5) return;

      const pointer = this.canvas.getPointer(event);
      const zoomPoint = new fabric.Point(pointer.x, pointer.y); // Create a Fabric.js Point
      this.canvas.zoomToPoint(zoomPoint, zoom);

      event.preventDefault();
      event.stopPropagation();
    });
  }

  deskewImage(): void {
    if (!this.currentImage()) {
      console.error("No image selected for deskewing.");
      return;
    }

    this.ipcService.send("deskew-image", this.currentImage());
    this.ipcService.on("deskew-image-reply", (event: any, arg: any) => {
      if (arg.error) {
        console.error("Deskew failed:", arg.error);
      } else {
        console.log("Deskew successful:", arg.filePath);

        // Replace the original image path in the imagePaths list with the deskewed image path
        const updatedPaths = this.imagePaths().map((path) =>
          path === this.currentImage() ? arg.filePath : path
        );
        this.imagePaths.set(updatedPaths);

        // Update the current image to the deskewed image
        this.currentImage.set(arg.filePath);

        // Clear the canvas and load the deskewed image
        this.canvas.clear(); // Clear the canvas
        this.loadImageOntoCanvas(arg.filePath); // Load the deskewed image onto the canvas
      }
    });
  }

  addTextbox(): void {
    const textbox = new fabric.Textbox("Enter text here", {
      left: 50, // Position on the canvas
      top: 50,
      width: 200,
      fontSize: 20,
      fill: 'black', // Text color
      backgroundColor: 'white', // Optional background for better visibility
      borderColor: 'blue', // Border color for resizing
      editable: true, // Allow the textbox to be edited
      hasBorders: true,
      hasControls: true,
    });

    // Add the textbox to the canvas
    this.canvas.add(textbox);

    // Bring the new textbox into focus
    this.canvas.setActiveObject(textbox);

    // Re-render the canvas
    this.canvas.renderAll();
  }

  saveCanvas(): void {
    // Get the canvas content as a Data URL with the required options
    const dataURL = this.canvas.toDataURL({
      format: 'png',
      quality: 1.0, // PNG quality (not highly relevant for PNG, but added for completeness)
      multiplier: 1, // Scale the canvas to its current size
    });

    // Send the dataURL to the Electron IPC handler to save the file
    this.ipcService.send('save-canvas', dataURL);
  }

  ngOnDestroy(): void {
    this.ipcService.removeAllListeners("reply6437821");
  }
}
