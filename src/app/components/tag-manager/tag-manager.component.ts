import { Component, computed, Signal, signal } from '@angular/core'
import { ProgressComponent } from '../progress/progress.component'
import { MatSnackBar } from '@angular/material/snack-bar'
import { FileSelectionService } from '../../services/file-selection.service'
import { MatAutocomplete, MatAutocompleteTrigger, MatOption } from '@angular/material/autocomplete'
import { MatButton } from '@angular/material/button'
import { MatCard, MatCardContent, MatCardHeader, MatCardSubtitle, MatCardTitle } from '@angular/material/card'
import { MatCheckbox } from '@angular/material/checkbox'
import { MatFormField, MatHint } from '@angular/material/form-field'
import { MatInput, MatLabel } from '@angular/material/input'
import { MatList, MatListItem, MatListItemTitle } from '@angular/material/list'
import { MatProgressSpinner } from '@angular/material/progress-spinner'
import { MatIconModule } from '@angular/material/icon'
import { FileService, TagService } from '../../services'
import { ChangePreview, Tag } from '../../models'

@Component({
   selector: 'app-tag-manager',
   imports: [
      ProgressComponent,
      MatAutocomplete,
      MatAutocompleteTrigger,
      MatButton,
      MatCard,
      MatCardContent,
      MatCardHeader,
      MatCardSubtitle,
      MatCardTitle,
      MatCheckbox,
      MatFormField,
      MatHint,
      MatIconModule,
      MatInput,
      MatLabel,
      MatList,
      MatListItem,
      MatListItemTitle,
      MatOption,
      MatProgressSpinner,
   ],
   templateUrl: './tag-manager.component.html',
   styleUrl: './tag-manager.component.scss',
})
export class TagManagerComponent {
   constructor(
      private readonly snackBar: MatSnackBar,
      protected readonly fileSelectionService: FileSelectionService,
      private readonly tagService: TagService,
      private readonly fileService: FileService,
   ) {}

   readonly newTag = signal<string>('')
   readonly canAddTag = computed(() => this.newTag().trim() !== '' && !this.isProcessing())
   readonly tagsToAdd = signal<Set<string>>(new Set())
   readonly tagsToRemove = signal<Set<string>>(new Set())
   readonly error = signal<string | undefined>(undefined)
   readonly isProcessing = signal(false)
   readonly progress = signal(0)
   readonly canApply = computed(() => this.changePreview() !== undefined && !this.isProcessing())
   readonly tagSuggestions = computed(() => this.tagService.getTagSuggestions(this.fileSelectionService.matchingFiles(), this.newTag()))
   readonly existingTags = computed(() => {
      return this.tagService.extractUniqueTags(this.fileSelectionService.matchingFiles())
   })

   readonly changePreview: Signal<ChangePreview> = computed(() => {
      const filesToUpdate = this.fileSelectionService.matchingFiles().length
      const tagsToAdd = Array.from(this.tagsToAdd())
      const tagsToRemove = Array.from(this.tagsToRemove())

      return {
         numFilesToUpdate: filesToUpdate,
         tagsToAdd,
         tagsToRemove,
         affectedFiles: this.fileSelectionService.matchingFiles(),
      }
   })

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

   async applyChanges(): Promise<void> {
      if (!this.canApply()) {
         return
      }

      this.isProcessing.set(true)
      this.progress.set(0)
      this.error.set(undefined)

      let count = 0
      try {
         const files = this.fileSelectionService.matchingFiles()
         this.tagService.addTags(files, Array.from(this.tagsToAdd()))
         this.tagService.removeTags(files, Array.from(this.tagsToRemove()))
         for (const file of files) {
            await this.fileService.writeMetadata(file)
            ++count
            this.progress.set((count / files.length) * 100)
         }
         this.changesApplied(`Successfully applied to changes to ${files.length} files`)
      } catch (error) {
         this.changesApplied(`Failed to apply all changes: ${error}. Successfully applied to changes to ${count} files`)
      } finally {
         this.isProcessing.set(false)
         this.resetForm()
      }
   }

   isTagSelectedForRemoval(tagTitle: string): boolean {
      return this.tagService.isTagSelected(tagTitle, this.tagsToRemove())
   }

   private resetForm(): void {
      this.newTag.set('')
      this.tagsToRemove.set(new Set())
      this.tagsToAdd.set(new Set())
   }

   changesApplied(msg: string): void {
      this.progress.set(0)
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

   getTagColor(tag: Tag): string {
      return this.tagService.getTagColor(tag)
   }

   getTagTextColor(tag: Tag): string {
      return this.tagService.getTagTextColor(tag)
   }

   getTagUsageCount(tagTitle: string): number {
      return this.fileSelectionService.matchingFiles().filter(f => f.metadata?.tags.some(t => t.title === tagTitle)).length
   }
}
