import { Component, signal } from '@angular/core';
import { ImageCanvasComponent } from '../../components/image-canvas/image-canvas.component';
import { IpcService } from '../../services/ipc.service';

@Component({
  selector: 'app-image-processing',
  imports: [ImageCanvasComponent],
  templateUrl: './image-processing.component.html',
})
export class ImageProcessingComponent {
  pong = signal(false);

  constructor(private ipcService: IpcService){}

  ping = (): void => {
    this.ipcService.send("message", "ping");
    this.ipcService.on("reply6437821", (event: any, arg: string) => {
      this.pong.set(arg === "pong");
    });
  }

  getFile() {
    const userDir = process.env['HOME'] || process.env['USERPROFILE']; // Cross-platform way to get the user's home directory
    if (userDir) {
      const dirPath = `${userDir}/CCS/3. WORKSTATION/DOCUMENTS`;
      console.log(dirPath);
      this.ipcService.send("get-files", dirPath);
      this.ipcService.on("get-files-reply", (event: any, arg: any) => {
        console.log(arg);
      });
    } else {
      console.error("User directory is undefined");
    }
  }


  ngOnDestroy(): void {
    this.ipcService.removeAllListeners("reply6437821");
  }
}
