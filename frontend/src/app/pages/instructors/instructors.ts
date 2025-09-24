import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Footer } from '../footer/footer';

@Component({
  selector: 'app-instructors',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, Footer],
  templateUrl: './instructors.html',
  styleUrl: './instructors.css'
})
export class Instructors {
  // Mock instructors data
  instructors = [
    {
      id: '1',
      name: 'Dr. Sarah Johnson',
      title: 'Senior Software Engineer',
      bio: 'Expert in full-stack development with 10+ years of experience.',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      rating: 4.8,
      totalStudents: 1250,
      totalCourses: 15,
      specialties: ['JavaScript', 'React', 'Node.js']
    },
    {
      id: '2',
      name: 'Prof. Michael Chen',
      title: 'Data Science Specialist',
      bio: 'PhD in Computer Science with focus on machine learning and AI.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      rating: 4.9,
      totalStudents: 2100,
      totalCourses: 22,
      specialties: ['Python', 'Machine Learning', 'Data Analysis']
    }
  ];

  constructor() {}
} 