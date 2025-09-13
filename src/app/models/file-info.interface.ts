export interface FileInfo {
   path: string
   name: string
   // Handle to folder holding file and .ts folder
   dirHandle: FileSystemDirectoryHandle
   // Name of the metadata
   metadataHandle?: FileSystemFileHandle
   // When we're reading the metadata, if the json file doesn't exist, this will not be set
   metadata?: TagSpacesMetadata
}

export interface Tag {
   title: string
   type?: string
   color?: string
   textcolor?: string
}

export interface TagSpacesMetadata {
   id?: string
   tags: Tag[]
   description?: string
}

export interface TagOptions {
   type?: string
   color?: string
   textcolor?: string
}

export interface ChangePreview {
   numFilesToUpdate: number
   tagsToAdd: string[]
   tagsToRemove: string[]
   affectedFiles: FileInfo[]
}

export type OperationType = 'scan' | 'add-tags' | 'remove-tags' | 'apply-changes'
