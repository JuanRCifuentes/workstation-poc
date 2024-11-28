import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageProcessingComponent } from './image-processing.component';

describe('ImageProcessingComponent', () => {
  let component: ImageProcessingComponent;
  let fixture: ComponentFixture<ImageProcessingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImageProcessingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImageProcessingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
