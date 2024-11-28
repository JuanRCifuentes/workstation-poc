import { Component } from '@angular/core';

import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-shell',
  imports: [ RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './app-shell.component.html',
})
export class AppShellComponent {
  pages = [
    {
      title: 'Home',
      url: '/',
      icon: 'home'
    },
    {
      title: 'Image Processing',
      url: '/image-processing',
      icon: 'image'
    }
  ]

}
