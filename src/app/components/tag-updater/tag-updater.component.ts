import { Component, input, output, signal, computed, Signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { MatCardModule } from '@angular/material/card'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatListModule } from '@angular/material/list'
import { MatAutocompleteModule } from '@angular/material/autocomplete'
import { MatChipsModule } from '@angular/material/chips'
import { MatCheckboxModule } from '@angular/material/checkbox'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { TagService, FileService } from '../../services'
import { FileInfo, Tag, ChangePreview } from '../../models'

@Component({
   selector: 'app-tag-updater',
   imports: [
      CommonModule,
      FormsModule,
      MatCardModule,
      MatFormFieldModule,
      MatInputModule,
      MatButtonModule,
      MatIconModule,
      MatListModule,
      MatAutocompleteModule,
      MatChipsModule,
      MatCheckboxModule,
      MatProgressSpinnerModule,
   ],
   templateUrl: './tag-updater.component.html',
   styleUrls: ['./tag-updater.component.scss'],
})
export class TagUpdaterComponent {
   constructor(
      private tagService: TagService,
      private fileService: FileService,
   ) {}

   matchingFiles = input<FileInfo[]>([])
   changesApplied = output<string>()
   changesStarted = output<void>()
   progress = output<number>()

   newTag = signal<string>('')
   tagsToAdd = signal<Set<string>>(new Set())
   tagsToRemove = signal<Set<string>>(new Set())
   isProcessing = signal<boolean>(false)
   error = signal<string | undefined>(undefined)

   tagSuggestions = computed(() => this.tagService.getTagSuggestions(this.matchingFiles(), this.newTag()))
   canAddTag = computed(() => this.newTag().trim() !== '' && !this.isProcessing())
   canApply = computed(() => this.changePreview() !== undefined && !this.isProcessing())
   existingTags = computed(() => {
      return this.tagService.extractUniqueTags(this.matchingFiles())
   })

   changePreview: Signal<ChangePreview> = computed(() => {
      const filesToUpdate = this.matchingFiles().length
      const tagsToAdd = Array.from(this.tagsToAdd())
      const tagsToRemove = Array.from(this.tagsToRemove())

      return {
         numFilesToUpdate: filesToUpdate,
         tagsToAdd,
         tagsToRemove,
         affectedFiles: this.matchingFiles(),
      }
   })

   onNewTagChange(event: Event): void {
      const target = event.target as HTMLInputElement
      this.newTag.set(target.value)
   }

   addTag(): void {
      if (!this.canAddTag()) {
         return
      }

      const tagTitle = this.newTag().trim()
      const tags = new Set(this.tagsToAdd())
      tags.add(tagTitle)
      this.tagsToAdd.set(tags)

      // Clear the input and error
      this.newTag.set('')
      this.error.set(undefined)
   }

   removeTag(tagTitle: string): void {
      const currentSet = this.tagsToRemove()
      this.tagsToRemove.set(this.tagService.toggleTagSelection(tagTitle, currentSet))
   }

   isTagSelectedForRemoval(tagTitle: string): boolean {
      return this.tagService.isTagSelected(tagTitle, this.tagsToRemove())
   }

   async applyChanges(): Promise<void> {
      if (!this.canApply()) {
         return
      }

      this.isProcessing.set(true)
      this.changesStarted.emit()
      this.progress.emit(0)
      this.error.set(undefined)

      let count = 0
      try {
         const files = this.matchingFiles()
         this.tagService.addTags(files, Array.from(this.tagsToAdd()))
         this.tagService.removeTags(files, Array.from(this.tagsToRemove()))
         for (const file of files) {
            await this.fileService.writeMetadata(file)
            ++count
            this.progress.emit((count / files.length) * 100)
         }
         this.changesApplied.emit(`Successfully applied to changes to ${files.length} files`)
      } catch (error) {
         this.changesApplied.emit(`Failed to apply all changes: ${error}. Successfully applied to changes to ${count} files`)
      } finally {
         this.isProcessing.set(false)
         this.resetForm()
      }
   }

   private resetForm(): void {
      this.newTag.set('')
      this.tagsToRemove.set(new Set())
      this.tagsToAdd.set(new Set())
   }

   getTagColor(tag: Tag): string {
      return this.tagService.getTagColor(tag)
   }

   getTagTextColor(tag: Tag): string {
      return this.tagService.getTagTextColor(tag)
   }

   getTagUsageCount(tagTitle: string): number {
      return this.matchingFiles().filter(f => f.metadata?.tags.some(t => t.title === tagTitle)).length
   }
}
