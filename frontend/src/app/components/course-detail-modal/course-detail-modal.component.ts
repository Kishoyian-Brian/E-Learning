import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Course } from '../../services/courses.service';

@Component({
  selector: 'app-course-detail-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './course-detail-modal.component.html',
  styleUrl: './course-detail-modal.component.css'
})
export class CourseDetailModalComponent {
  @Input() course!: Course;
  @Output() close = new EventEmitter<void>();

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString();
  }
} 