import { Component, signal, computed, model, effect } from '@angular/core'
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
import { FileSelectionService } from '../../services/file-selection.service'

@Component({
   selector: 'app-file-selection',
   imports: [CommonModule, FormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatListModule, MatProgressSpinnerModule],
   templateUrl: './file-selection.component.html',
   styleUrls: ['./file-selection.component.scss'],
})
export class FileSelectionComponent {
   selectedDirHandle = signal<FileSystemDirectoryHandle | undefined>(undefined)
   selectedFolderName = computed(() => this.selectedDirHandle()?.name ?? '')
   globPattern = signal<string>('**/*.stl')
   error = signal<string | undefined>(undefined)

   canScan = computed(() => !this.fileSelectionService.isBusy() && this.selectedDirHandle() !== undefined && this.globPattern().length > 0)

   constructor(
      private readonly fileService: FileService,
      private readonly tagService: TagService,
      protected readonly fileSelectionService: FileSelectionService,
   ) {}

   async onSelectFolder(): Promise<void> {
      try {
         this.error.set(undefined)
         const folder = await this.fileService.selectFolder()
         this.selectedDirHandle.set(folder)
      } catch (error) {
         this.error.set(`Failed to select folder: ${error}`)
      } finally {
         this.fileSelectionService.matchingFiles.set([])
      }
   }

   getTagColor(tag: Tag): string {
      return this.tagService.getTagColor(tag)
   }

   getTagTextColor(tag: Tag): string {
      return this.tagService.getTagTextColor(tag)
   }

   async scanFiles(): Promise<void> {
      if (this.fileSelectionService.isBusy()) {
         return
      }

      const dirHandler = this.selectedDirHandle()
      if (!dirHandler) {
         return
      }

      try {
         this.fileSelectionService.isBusy.set(true)
         this.error.set(undefined)

         const files = await this.fileService.scanFiles(dirHandler, this.globPattern())

         this.fileSelectionService.matchingFiles.set(files)
      } catch (error) {
         this.error.set(`Failed to scan files: ${error}`)
         this.fileSelectionService.matchingFiles.set([])
      } finally {
         this.fileSelectionService.isBusy.set(false)
      }
   }

   onFileClick(file: FileInfo) {
      this.fileSelectionService.selectedFile.set(file)
   }
}
