import { Component, signal, computed, output } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { MatCardModule } from '@angular/material/card'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatListModule } from '@angular/material/list'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { FileService, TagService } from '../../services'
import { FileInfo, Tag } from '../../models'

@Component({
   selector: 'app-file-selection',
   imports: [CommonModule, FormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatListModule, MatProgressSpinnerModule],
   templateUrl: './file-selection.component.html',
   styleUrls: ['./file-selection.component.scss'],
})
export class FileSelectionComponent {
   matchingFileEmitter = output<FileInfo[]>()
   fileSelected = output<FileInfo>()

   selectedDirHandle = signal<FileSystemDirectoryHandle | undefined>(undefined)
   selectedFolderName = computed(() => this.selectedDirHandle()?.name ?? '')
   globPattern = signal<string>('**/*.stl')
   matchingFiles = signal<FileInfo[]>([])
   selectedFile = signal<FileInfo | undefined>(undefined)
   isScanning = signal<boolean>(false)
   error = signal<string | undefined>(undefined)

   canScan = computed(() => this.selectedDirHandle() !== undefined && !this.isScanning())

   constructor(
      private fileService: FileService,
      private tagService: TagService,
   ) {}

   async selectFolder(): Promise<void> {
      try {
         this.error.set(undefined)
         const folder = await this.fileService.selectFolder()
         this.selectedDirHandle.set(folder)
      } catch (error) {
         this.error.set(`Failed to select folder: ${error}`)
      } finally {
         this.matchingFiles.set([])
         this.matchingFileEmitter.emit([])
      }
   }

   getTagColor(tag: Tag): string {
      return this.tagService.getTagColor(tag)
   }

   getTagTextColor(tag: Tag): string {
      return this.tagService.getTagTextColor(tag)
   }

   async scanFiles(): Promise<void> {
      if (!this.canScan()) {
         return
      }

      const dirHandler = this.selectedDirHandle()
      if (!dirHandler) {
         return
      }

      try {
         this.isScanning.set(true)
         this.error.set(undefined)

         const files = await this.fileService.scanFiles(dirHandler, this.globPattern())

         this.matchingFiles.set(files)
         this.matchingFileEmitter.emit(files)
      } catch (error) {
         this.error.set(`Failed to scan files: ${error}`)
         this.matchingFiles.set([])
      } finally {
         this.isScanning.set(false)
      }
   }

   onGlobPatternChange(event: Event): void {
      const target = event.target as HTMLInputElement
      this.globPattern.set(target.value)
   }

   tagList(tags?: Tag[]): string {
      return tags ? tags.map(t => t.title).join(', ') : '<no tags>'
   }

   onFileClick(file: FileInfo) {
      this.selectedFile.set(file)
      this.fileSelected.emit(file)
   }
}
