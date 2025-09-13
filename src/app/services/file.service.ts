import { Injectable } from '@angular/core'
import { FileInfo } from '../models'
import { MetadataService } from './metadata.service'
import { minimatch } from 'minimatch'

/**
 * FileService provides methods for accessing files on the local disk
 */
@Injectable({
   providedIn: 'root',
})
export class FileService {
   constructor(private metadataService: MetadataService) {}

   /**
    * Allows the user to select a directory and returns the handle to the chosen directory
    */
   async selectFolder(): Promise<FileSystemDirectoryHandle | undefined> {
      try {
         // Check if File System Access API is supported
         if (!('showDirectoryPicker' in window)) {
            throw new Error('File System Access API is not supported in this browser')
         }

         // Show directory picker
         return (await (window as any).showDirectoryPicker({
            mode: 'readwrite',
         })) as FileSystemDirectoryHandle | undefined
      } catch (error) {
         if (error instanceof Error && error.name === 'AbortError') {
            throw new Error('Folder selection was cancelled')
         }
         throw new Error(`Failed to select folder: ${error}`)
      }
   }

   async writeMetadata(file: FileInfo): Promise<void> {
      // Create or get the metadata file handle
      if (!file.metadataHandle) {
         file.metadataHandle = await this.getCreateMetadataHandle(file.dirHandle, file.name)
      }

      // Create a writable stream
      const writable = await file.metadataHandle.createWritable()

      // Write the metadata content
      const content = JSON.stringify(file.metadata, null, 2)
      await writable.write(content)
      await writable.close()
   }

   /**
    * Scan files within the specified directory, parsing the metadata for each file.
    */
   async scanFiles(handle: FileSystemDirectoryHandle, globPattern: string): Promise<FileInfo[]> {
      const matchingFiles: FileInfo[] = []
      await this.scanDirectoryRecursive(handle, globPattern, matchingFiles)
      return matchingFiles
   }

   private async scanDirectoryRecursive(dirHandle: FileSystemDirectoryHandle, globPattern: string, fileInfos: FileInfo[], currentPath: string = ''): Promise<void> {
      for await (const [name, handle] of (dirHandle as any).entries()) {
         const fullPath = currentPath ? `${currentPath}/${name}` : name

         if (handle.kind === 'file') {
            // Filter early using minimatch
            if (!minimatch(fullPath, globPattern, { matchBase: true, nocase: true })) {
               continue
            }

            const metadataHandle = await this.getMetadataHandle(dirHandle, name)
            const fileInfo: FileInfo = {
               path: fullPath,
               name,
               metadataHandle,
               dirHandle,
            }

            if (metadataHandle) {
               const file = await metadataHandle.getFile()
               const metadata = await this.metadataService.loadMetadata(file)
               metadata.tags = metadata.tags ?? []
               fileInfo.metadata = metadata
            }

            fileInfos.push(fileInfo)
         } else if (handle.kind === 'directory' && name !== '.ts') {
            await this.scanDirectoryRecursive(handle as FileSystemDirectoryHandle, globPattern, fileInfos, fullPath)
         }
      }
   }

   private async getMetadataHandle(dirHandle: FileSystemDirectoryHandle, fileName: string): Promise<FileSystemFileHandle | undefined> {
      try {
         const metadataDirHandle = await dirHandle.getDirectoryHandle('.ts', { create: false })
         return await metadataDirHandle.getFileHandle(`${fileName}.json`, { create: false })
      } catch (err) {
         // The .ts folder or the metadata file might not exist
         if (err instanceof DOMException && err.name === 'NotFoundError') {
            return undefined
         }
         throw err // rethrow if it's a different error
      }
   }

   private async getCreateMetadataHandle(dirHandle: FileSystemDirectoryHandle, fileName: string): Promise<FileSystemFileHandle> {
      const metadataDirHandle = await dirHandle.getDirectoryHandle('.ts', { create: true })
      return await metadataDirHandle.getFileHandle(`${fileName}.json`, { create: true })
   }
}
