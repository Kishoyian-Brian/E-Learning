import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Footer } from '../footer/footer';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterModule, Footer],
  templateUrl: './about.html',
  styleUrl: './about.css'
})
export class About {
  currentYear = new Date().getFullYear();

  stats = [
    { number: '50,000+', label: 'Students Enrolled', icon: 'fas fa-users' },
    { number: '500+', label: 'Expert Instructors', icon: 'fas fa-chalkboard-teacher' },
    { number: '1,000+', label: 'Courses Available', icon: 'fas fa-book' },
    { number: '95%', label: 'Satisfaction Rate', icon: 'fas fa-heart' }
  ];

  values = [
    {
      title: 'Excellence',
      description: 'We strive for excellence in everything we do, from course quality to student support.',
      icon: 'fas fa-star',
      color: 'text-yellow-500'
    },
    {
      title: 'Innovation',
      description: 'We embrace new technologies and teaching methods to enhance learning experiences.',
      icon: 'fas fa-lightbulb',
      color: 'text-blue-500'
    },
    {
      title: 'Accessibility',
      description: 'We believe education should be accessible to everyone, regardless of background.',
      icon: 'fas fa-universal-access',
      color: 'text-green-500'
    },
    {
      title: 'Community',
      description: 'We foster a supportive learning community where students can grow together.',
      icon: 'fas fa-hands-helping',
      color: 'text-purple-500'
    }
  ];

  team = [
    {
      name: 'Dr. Sarah Johnson',
      role: 'CEO & Founder',
      bio: 'Former professor with 15+ years in education technology. Passionate about making quality education accessible to all.',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      social: {
        linkedin: 'https://linkedin.com',
        twitter: 'https://twitter.com',
        email: 'sarah@edusoma.com'
      }
    },
    {
      name: 'Michael Chen',
      role: 'CTO',
      bio: 'Tech leader with expertise in scalable platforms. Focused on creating seamless learning experiences.',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      social: {
        linkedin: 'https://linkedin.com',
        twitter: 'https://twitter.com',
        email: 'michael@edusoma.com'
      }
    },
    {
      name: 'Emily Rodriguez',
      role: 'Head of Content',
      bio: 'Curriculum specialist with a passion for creating engaging educational content that inspires learning.',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      social: {
        linkedin: 'https://linkedin.com',
        twitter: 'https://twitter.com',
        email: 'emily@edusoma.com'
      }
    },
    {
      name: 'David Kim',
      role: 'Head of Student Success',
      bio: 'Dedicated to ensuring every student achieves their learning goals through personalized support.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      social: {
        linkedin: 'https://linkedin.com',
        twitter: 'https://twitter.com',
        email: 'david@edusoma.com'
      }
    }
  ];

  milestones = [
    {
      year: '2020',
      title: 'Founded',
      description: 'EduSoma was founded with a vision to democratize education through technology.'
    },
    {
      year: '2021',
      title: 'First 1,000 Students',
      description: 'Reached our first milestone of 1,000 enrolled students across various courses.'
    },
    {
      year: '2022',
      title: 'Series A Funding',
      description: 'Secured $5M in Series A funding to expand our platform and course offerings.'
    },
    {
      year: '2023',
      title: 'Global Expansion',
      description: 'Launched courses in 50+ countries with localized content and support.'
    },
    {
      year: '2024',
      title: 'AI-Powered Learning',
      description: 'Introduced AI-driven personalized learning paths and adaptive assessments.'
    }
  ];

  openSocialLink(url: string): void {
    window.open(url, '_blank');
  }

  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
} 