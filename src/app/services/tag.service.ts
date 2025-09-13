import { Injectable } from '@angular/core'
import { FileInfo, Tag, TagOptions } from '../models'

@Injectable({
   providedIn: 'root',
})
export class TagService {
   extractUniqueTags(files: FileInfo[]): Tag[] {
      const tagMap = new Map<string, Tag>()

      for (const file of files) {
         if (file.metadata) {
            for (const tag of file.metadata.tags) {
               if (!tagMap.has(tag.title)) {
                  tagMap.set(tag.title, tag)
               }
            }
         }
      }

      return Array.from(tagMap.values()).sort((a, b) => a.title.localeCompare(b.title))
   }

   removeTags(files: FileInfo[], tags: string[]): void {
      files.forEach((file: FileInfo) => {
         this.removeTagsFromFile(file, tags)
      })
   }

   private removeTagsFromFile(file: FileInfo, tags: string[]): void {
      if (file.metadata === undefined) {
         return
      }
      tags.forEach(tag => {
         file.metadata!.tags = file.metadata!.tags.filter(t => !tags.includes(t.title))
      })
   }

   addTags(files: FileInfo[], tags: string[]): void {
      files.forEach((file: FileInfo) => {
         this.addTagsToFile(file, tags)
      })
   }

   private addTagsToFile(file: FileInfo, tags: string[]): void {
      if (file.metadata === undefined) {
         file.metadata = { tags: [] }
      }
      tags.forEach(tag => {
         if (!this.hasTag(file, tag)) {
            file.metadata!.tags.push(this.createTag(tag))
         }
      })
   }

   private hasTag(file: FileInfo, tag: string): boolean {
      if (!file.metadata) {
         return false
      }
      return file.metadata.tags.some(t => t.title === tag)
   }

   private createTag(title: string): Tag {
      return {
         title: title.trim(),
         type: 'sidecar',
      }
   }

   getTagSuggestions(files: FileInfo[], partial: string): string[] {
      if (!partial || partial.trim() === '') {
         return []
      }

      const allTags = this.extractUniqueTags(files)
      const partialLower = partial.toLowerCase()

      return allTags
         .map(tag => tag.title)
         .filter(title => title.toLowerCase().includes(partialLower))
         .sort()
         .slice(0, 10) // Limit to 10 suggestions
   }

   getTagColor(tag: Tag): string {
      return tag.color || '#ffcc24'
   }

   getTagTextColor(tag: Tag): string {
      return tag.textcolor || '#ffffff'
   }

   isTagSelected(tagTitle: string, selectedTags: Set<string>): boolean {
      return selectedTags.has(tagTitle)
   }

   toggleTagSelection(tagTitle: string, selectedTags: Set<string>): Set<string> {
      const newSet = new Set(selectedTags)
      if (newSet.has(tagTitle)) {
         newSet.delete(tagTitle)
      } else {
         newSet.add(tagTitle)
      }
      return newSet
   }
}
