import { Component, effect, signal, ViewChild, WritableSignal } from '@angular/core'
import { MatProgressSpinner } from '@angular/material/progress-spinner'
import { StlModelViewerComponent } from 'angular-stl-model-viewer'
import { FileInfo } from '../../models'
import { ThumbnailService } from '../../services/thumbnail.service'
import { MatButton } from '@angular/material/button'
import { MatCardModule, MatCardContent, MatCardHeader, MatCardSubtitle } from '@angular/material/card'
import { MatIconModule } from '@angular/material/icon'
import { Box3, Object3D, PerspectiveCamera, Vector3, WebGLRenderer } from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { FileSelectionService } from '../../services/file-selection.service'
import { THREE } from '@angular/cdk/keycodes'

@Component({
   selector: 'app-thumbnail-manager',
   imports: [MatProgressSpinner, StlModelViewerComponent, MatButton, MatCardModule, MatCardContent, MatCardHeader, MatCardSubtitle, MatIconModule],
   templateUrl: './thumbnail-manager.component.html',
   styleUrl: './thumbnail-manager.component.scss',
})
export class ThumbnailManagerComponent {
   // Use a custom renderer otherwise image capture doesn't work
   readonly renderer = new WebGLRenderer({ antialias: true, preserveDrawingBuffer: true })
   readonly camera = new PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 15)
   readonly controls: WritableSignal<OrbitControls | undefined> = signal(undefined)

   @ViewChild('stlviewer', { static: false }) stlViewerComponent!: StlModelViewerComponent

   constructor(
      private thumbnailService: ThumbnailService,
      private readonly fileSelectionService: FileSelectionService,
   ) {
      effect(() => {
         const file = this.fileSelectionService.selectedFile()
         if (file) {
            void this.onFileSelected(file)
         }
      })
   }

   readonly isProcessing = signal(false)
   readonly selectedFileContent = signal<string[]>([])
   readonly thumbnailContent = signal<string | undefined>(undefined)
   readonly error = signal<string | undefined>(undefined)

   rotate(axis: string, degrees: number) {
      const radians = degrees * (Math.PI / 180)
      this.stlViewerComponent.meshGroup.rotation[axis] += radians
      this.renderer.render(this.stlViewerComponent.scene, this.camera)
   }

   // xx() {
   //    const boundingBox = new Box3().setFromObject(this.stlViewerComponent.meshGroup)
   //    const size = boundingBox.getSize(new Vector3())
   //    const center = boundingBox.getCenter(new Vector3())
   // }

   async onFileSelected(fileInfo: FileInfo): Promise<void> {
      this.isProcessing.set(true)
      this.fileSelectionService.selectedFile.set(fileInfo)
      const content = await this.thumbnailService.loadSTL(fileInfo)
      setTimeout(() => {
         this.selectedFileContent.set([content])

         // After the stl viewer is re-created we need to recreate the controls, otherwise we can't use the mouse etc
         // to change the view.
         this.setupControls()
         this.isProcessing.set(false)
      }, 50)

      const thumbnail = await this.thumbnailService.loadThumbnail(fileInfo)
      this.thumbnailContent.set(thumbnail)
   }

   private setupControls() {
      const newControls = new OrbitControls(this.camera, this.renderer.domElement)

      newControls.enableZoom = true
      newControls.minDistance = 0.1
      newControls.maxDistance = 100
      newControls.enableDamping = true
      this.controls.set(newControls)
   }

   // Takes a snapshot of the image as currently rendered and saves it has a thumbnail
   async copySTL(): Promise<void> {
      const renderer = this.stlViewerComponent.renderer
      if (renderer && this.fileSelectionService.selectedFile() !== undefined) {
         const dataURL = renderer.domElement.toDataURL('image/jpeg')
         await this.thumbnailService.saveThumbnail(this.fileSelectionService.selectedFile()!, dataURL)
      }
   }
}
