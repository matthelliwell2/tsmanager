import { Component, signal, computed } from '@angular/core'
import { CommonModule } from '@angular/common'
import { MatToolbarModule } from '@angular/material/toolbar'
import { MatIconModule } from '@angular/material/icon'
import { MatSidenavModule } from '@angular/material/sidenav'
import { MatListModule } from '@angular/material/list'
import { MatTabsModule } from '@angular/material/tabs'
import { MatButtonModule } from '@angular/material/button'
import { TagEditorComponent } from './components/tag-editor/tag-editor.component'
import { ThumbnailEditorComponent } from './components/thumbnail-editor/thumbnail-editor.component'

@Component({
   selector: 'app-root',
   imports: [CommonModule, MatToolbarModule, MatTabsModule, MatIconModule, MatSidenavModule, MatListModule, MatButtonModule, TagEditorComponent, ThumbnailEditorComponent],
   templateUrl: './app.component.html',
   styleUrls: ['./app.component.scss'],
})
export class AppComponent {
   title = 'TagSpaces Manager'
}
