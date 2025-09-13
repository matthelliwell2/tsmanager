import { Injectable } from '@angular/core'
import { TagSpacesMetadata, Tag } from '../models'

@Injectable({
   providedIn: 'root',
})
export class MetadataService {
   async loadMetadata(file: File): Promise<TagSpacesMetadata> {
      try {
         const content = await file.text()

         const metadata = JSON.parse(content) as TagSpacesMetadata

         if (!this.validateMetadata(metadata)) {
            throw new Error('Invalid metadata format')
         }

         return metadata
      } catch (error) {
         throw new Error(`Failed to parse metadata: ${error}`)
      }
   }

   private validateMetadata(metadata: any): boolean {
      if (!metadata || typeof metadata !== 'object') {
         return false
      }

      // Validate tags array if present
      if (metadata.tags !== undefined) {
         if (!Array.isArray(metadata.tags)) {
            return false
         }

         for (const tag of metadata.tags) {
            if (!this.validateTag(tag)) {
               return false
            }
         }
      }

      // Validate description if present
      if (metadata.description !== undefined && typeof metadata.description !== 'string') {
         return false
      }

      // Validate id if present
      if (metadata.id !== undefined && typeof metadata.id !== 'string') {
         return false
      }

      return true
   }

   private validateTag(tag: any): boolean {
      if (!tag || typeof tag !== 'object') {
         return false
      }

      // Title is required
      if (typeof tag.title !== 'string' || tag.title.trim() === '') {
         return false
      }

      // Optional fields validation
      if (tag.type !== undefined && typeof tag.type !== 'string') {
         return false
      }

      if (tag.color !== undefined && typeof tag.color !== 'string') {
         return false
      }

      if (tag.textcolor !== undefined && typeof tag.textcolor !== 'string') {
         return false
      }

      return true
   }
}
