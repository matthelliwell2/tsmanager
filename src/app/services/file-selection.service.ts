import { effect, Injectable, signal } from '@angular/core'
import { FileInfo } from '../models'

/**
 * Maintains signals for files selected by the file selection component.
 */
@Injectable({
   providedIn: 'root',
})
export class FileSelectionService {
   /**
    * List of files matching search criteria
    */
   readonly matchingFiles = signal<FileInfo[]>([])
   /**
    * Individual file selected by user
    */
   readonly selectedFile = signal<FileInfo | undefined>(undefined)
   /**
    * Whether the file component is busy doing stuff
    */
   readonly isBusy = signal(false)

   constructor() {
      // If the list of matching files changes, clear the selected file
      effect(() => {
         this.matchingFiles()
         this.selectedFile.set(undefined)
      })
   }
}
