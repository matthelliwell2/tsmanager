import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { MatToolbarModule } from '@angular/material/toolbar'
import { MatIconModule } from '@angular/material/icon'
import { MatSidenavModule } from '@angular/material/sidenav'
import { MatListModule } from '@angular/material/list'
import { MatTabsModule } from '@angular/material/tabs'
import { MatButtonModule } from '@angular/material/button'
import { TagManagerComponent } from './components/tag-manager/tag-manager.component'
import { ThumbnailManagerComponent } from './components/thumbnail-manager/thumbnail-manager.component'

@Component({
   selector: 'app-root',
   imports: [CommonModule, MatToolbarModule, MatTabsModule, MatIconModule, MatSidenavModule, MatListModule, MatButtonModule, TagManagerComponent, ThumbnailManagerComponent],
   templateUrl: './app.component.html',
   styleUrls: ['./app.component.scss'],
})
export class AppComponent {
   title = 'TagSpaces Manager'
}
