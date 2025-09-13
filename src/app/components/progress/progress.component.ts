import { Component, input } from '@angular/core'
import { CommonModule } from '@angular/common'
import { MatCardModule } from '@angular/material/card'
import { MatProgressBarModule } from '@angular/material/progress-bar'
import { MatIconModule } from '@angular/material/icon'
import { MatButtonModule } from '@angular/material/button'

@Component({
   selector: 'app-progress',
   imports: [CommonModule, MatCardModule, MatProgressBarModule, MatIconModule, MatButtonModule],
   templateUrl: './progress.component.html',
   styleUrls: ['./progress.component.scss'],
})
export class ProgressComponent {
   isVisible = input<boolean>(true)
   progress = input<number>(0)
   status = input<string>('')
   error = input<string | undefined>(undefined)
}
