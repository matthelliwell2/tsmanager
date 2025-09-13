import { Component, computed, signal } from '@angular/core'
import { FileSelectionComponent } from '../file-selection/file-selection.component'
import { ProgressComponent } from '../progress/progress.component'
import { TagUpdaterComponent } from '../tag-updater/tag-updater.component'
import { FileInfo, OperationType } from '../../models'
import { MatSnackBar } from '@angular/material/snack-bar'

@Component({
   selector: 'app-tag-manager',
   imports: [FileSelectionComponent, ProgressComponent, TagUpdaterComponent],
   templateUrl: './tag-manager.component.html',
   styleUrl: './tag-manager.component.scss',
})
export class TagManagerComponent {
   constructor(private snackBar: MatSnackBar) {}

   matchingFiles = signal<FileInfo[]>([])
   currentOperation = signal<OperationType | undefined>(undefined)
   isProcessing = signal(false)
   progress = signal(0)

   currentOperationString = computed(() => (this.currentOperation() ? `Processing ${this.currentOperation()}` : ''))

   onMatchingFiles(files: FileInfo[]): void {
      this.matchingFiles.set(files)
   }

   onChangesStarted(): void {
      this.isProcessing.set(true)
   }

   onProgressChange(progress: number): void {
      this.progress.set(progress)
   }

   onChangesApplied(msg: string): void {
      // this.matchingFiles.set([])
      this.progress.set(0)
      this.currentOperation.set(undefined)
      this.isProcessing.set(false)
      this.showToast(msg)
   }

   showToast(msg: string) {
      this.snackBar.open(msg, 'Close', {
         duration: 3000,
         horizontalPosition: 'center',
         verticalPosition: 'top',
      })
   }
}
