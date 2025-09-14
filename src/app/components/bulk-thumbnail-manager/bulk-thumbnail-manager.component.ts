import { Component, computed, signal, ViewChild } from '@angular/core'
import { MatButton } from '@angular/material/button'
import { MatCard, MatCardContent, MatCardHeader, MatCardSubtitle, MatCardTitle } from '@angular/material/card'
import { MatCheckbox } from '@angular/material/checkbox'
import { ProgressComponent } from '../progress/progress.component'
import { FileSelectionService } from '../../services/file-selection.service'
import { MatIcon } from '@angular/material/icon'
import { ThumbnailService } from '../../services/thumbnail.service'
import { StlModelViewerComponent } from 'angular-stl-model-viewer'
import { AmbientLight, DirectionalLight, Mesh, MeshPhongMaterial, PerspectiveCamera, Scene, Vector3, WebGLRenderer } from 'three'
import { FileInfo } from 'src/app/models'
// @ts-ignore
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader'
import { MatHint } from '@angular/material/form-field'

@Component({
   selector: 'app-bulk-thumbnail-manager',
   imports: [MatButton, MatCard, MatCardContent, MatCardHeader, MatCardSubtitle, MatCardTitle, MatCheckbox, MatIcon, ProgressComponent, StlModelViewerComponent, MatHint],
   templateUrl: './bulk-thumbnail-manager.component.html',
   styleUrl: './bulk-thumbnail-manager.component.scss',
})
export class BulkThumbnailManagerComponent {
   private renderCallback: (() => void) | undefined = undefined

   constructor(
      protected readonly fileSelectionService: FileSelectionService,
      private readonly thumbnailService: ThumbnailService,
   ) {}

   @ViewChild('stlviewer', { static: false }) stlViewerComponent!: StlModelViewerComponent

   // Use a custom renderer otherwise image capture doesn't work
   readonly renderer = new WebGLRenderer({ antialias: true, preserveDrawingBuffer: true })
   readonly camera = new PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 15)

   readonly overwriteExistingThumbnails = signal(false)
   readonly isProcessing = signal(false)
   readonly progress = signal(0)
   readonly error = signal('')
   readonly canUpdateThumbnails = computed(() => !this.isProcessing() && this.fileSelectionService.matchingFiles().length > 0)
   readonly selectedFileContent = signal<string[]>([])
   readonly rotate = signal(true)

   async onGenerateThumbnails() {
      this.isProcessing.set(true)
      for (const fileInfo of this.fileSelectionService.matchingFiles()) {
         console.log('Processing', fileInfo.name)
         const snapshot = await this.generateSnapshot(fileInfo)
      }

      this.isProcessing.set(false)
   }

   // TODO clean this up
   // TODO add progress
   // TODO set camera pos etc on thumbnail manager component
   async generateSnapshot(fileInfo: FileInfo): Promise<void> {
      const hasThumbnail = await this.thumbnailService.hasThumbnail(fileInfo)
      if (!this.overwriteExistingThumbnails() && hasThumbnail) {
         return
      }

      const handle = await fileInfo.dirHandle.getFileHandle(fileInfo.name)
      const file = await handle.getFile()
      const buffer = await file.arrayBuffer()

      const loader = new STLLoader()
      const geometry = loader.parse(buffer)

      const scene = new Scene()
      const material = new MeshPhongMaterial({ color: 0x999999, shininess: 400, specular: 0x222222 })
      const mesh = new Mesh(geometry, material)
      scene.add(mesh)

      const light = new DirectionalLight(0xffffff, 4)
      light.position.set(50, 50, 50)
      scene.add(light)

      const ambient = new AmbientLight(0x404040) // soft light
      scene.add(ambient)

      geometry.computeBoundingBox()
      const boundingBox = geometry.boundingBox!
      const center = boundingBox.getCenter(new Vector3())
      geometry.translate(-center.x, -center.y, -center.z)

      const size = boundingBox.getSize(new Vector3())
      const maxDim = Math.max(size.x, size.y, size.z)

      // Camera setup
      const aspectRatio = 1 // square thumbnail
      const fov = 35 * (Math.PI / 180) // convert to radians
      const distance = maxDim / (2 * Math.tan(fov / 2)) // optimal distance
      const camera = new PerspectiveCamera(35, aspectRatio, 0.1, 1000)
      camera.position.set(distance * 0.6, distance * 0.3, distance * 1.2)
      camera.lookAt(0, 0, 0)

      // Scale geometry to fit 90% of view height
      const viewHeight = 2 * Math.tan(fov / 2) * camera.position.z
      const targetSize = viewHeight * 0.9
      const scaleFactor = targetSize / maxDim
      geometry.scale(scaleFactor, scaleFactor, scaleFactor)

      if (this.rotate()) {
         geometry.rotateX(-Math.PI / 2) // Rotate 90° to convert Z-up to Y-up
      }

      const renderer = new WebGLRenderer({ antialias: true, preserveDrawingBuffer: true })
      renderer.setSize(500, 500)
      renderer.setClearColor(0xffffff) // white background
      renderer.render(scene, camera)

      const dataURL = renderer.domElement.toDataURL('image/jpg')
      await this.thumbnailService.saveThumbnail(fileInfo, dataURL)
      console.log('Thumbnail generated successfully.', fileInfo.name)
   }
}
