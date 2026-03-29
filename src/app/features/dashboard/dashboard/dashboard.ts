import { Component } from '@angular/core';
import { NavbarComponent } from '../../../shared/components/navbar/navbar';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NavbarComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class DashboardComponent {

}