import { Injectable } from '@angular/core'
import { FileInfo } from '../models'

@Injectable({
   providedIn: 'root',
})
export class ThumbnailService {
   async loadSTL(fileInfo: FileInfo): Promise<string> {
      const handle = await fileInfo.dirHandle.getFileHandle(fileInfo.name)
      const file = await handle.getFile()
      const buffer = await file.arrayBuffer()
      return this.convertBinarySTLToASCII(buffer)
   }

   async loadThumbnail(fileInfo: FileInfo): Promise<string | undefined> {
      const handle = await this.getThumbnailHandle(fileInfo, false)
      if (handle) {
         const file = await handle.getFile()
         return URL.createObjectURL(file)
      } else {
         return undefined
      }
   }

   private async getThumbnailHandle(fileInfo: FileInfo, create: boolean): Promise<FileSystemFileHandle | undefined> {
      try {
         const tsHandle = await fileInfo.dirHandle.getDirectoryHandle('.ts', { create })
         return await tsHandle.getFileHandle(`${fileInfo.name}.jpg`, { create })
      } catch (err) {
         // The .ts folder or the metadata file might not exist
         if (err instanceof DOMException && err.name === 'NotFoundError') {
            return undefined
         }
         throw err // rethrow if it's a different error
      }
   }

   private convertBinarySTLToASCII(buffer: ArrayBuffer): string {
      const view = new DataView(buffer)
      const triangleCount = view.getUint32(80, true)
      const output = new Array<string>(triangleCount * 5 + 2)
      output[0] = 'solid model\n'

      let offset = 84
      let count = 1
      for (let i = 0; i < triangleCount; i++) {
         const nx = view.getFloat32(offset, true)
         const ny = view.getFloat32(offset + 4, true)
         const nz = view.getFloat32(offset + 8, true)
         output[count++] = `  facet normal ${nx} ${ny} ${nz}\n    outer loop\n`

         for (let j = 0; j < 3; j++) {
            const vx = view.getFloat32(offset + 12 + j * 12, true)
            const vy = view.getFloat32(offset + 16 + j * 12, true)
            const vz = view.getFloat32(offset + 20 + j * 12, true)
            output[count++] = `      vertex ${vx} ${vy} ${vz}\n`
         }

         output[count++] = `    endloop\n  endfacet\n`
         offset += 50
      }

      output[count++] = 'endsolid model\n'
      return output.join()
   }

   async saveThumbnail(fileInfo: FileInfo, dataUrl: string): Promise<void> {
      const handle = (await this.getThumbnailHandle(fileInfo, true))!
      // Convert base64 to Blob
      const blob = await (await fetch(dataUrl)).blob()

      // Create writable stream
      const writable = await handle.createWritable()

      // Write blob to file
      await writable.write(blob)

      // Finalize write
      await writable.close()
   }

   async hasThumbnail(fileInfo: FileInfo): Promise<boolean> {
      const handle = await this.getThumbnailHandle(fileInfo, false)
      return handle !== undefined
   }
}
