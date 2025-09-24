import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './footer.html',
  styleUrl: './footer.css'
})
export class Footer {
  newsletterEmail = '';
  currentYear = new Date().getFullYear();

  footerLinks = {
    platform: [
      { name: 'Browse Courses', path: '/courses' },
      { name: 'My Courses', path: '/mycourses' },
      { name: 'Learning Paths', path: '/learning-paths' },
      { name: 'Certificates', path: '/certificates' },
      { name: 'Live Sessions', path: '/live-sessions' }
    ],
    company: [
      { name: 'About Us', path: '/about' },
      { name: 'Careers', path: '/careers' },
      { name: 'Press', path: '/press' },
      { name: 'Partners', path: '/partners' },
      { name: 'Blog', path: '/blog' }
    ],
    support: [
      { name: 'Help Center', path: '/help' },
      { name: 'Contact Us', path: '/contact' },
      { name: 'Community', path: '/community' },
      { name: 'Feedback', path: '/feedback' },
      { name: 'Status', path: '/status' }
    ],
    legal: [
      { name: 'Privacy Policy', path: '/privacy' },
      { name: 'Terms of Service', path: '/terms' },
      { name: 'Cookie Policy', path: '/cookies' },
      { name: 'GDPR', path: '/gdpr' },
      { name: 'Accessibility', path: '/accessibility' }
    ]
  };

  socialLinks = [
    { name: 'Facebook', icon: 'fab fa-facebook', url: 'https://facebook.com' },
    { name: 'Twitter', icon: 'fab fa-twitter', url: 'https://twitter.com' },
    { name: 'LinkedIn', icon: 'fab fa-linkedin', url: 'https://linkedin.com' },
    { name: 'YouTube', icon: 'fab fa-youtube', url: 'https://youtube.com' },
    { name: 'Instagram', icon: 'fab fa-instagram', url: 'https://instagram.com' }
  ];

  contactInfo = {
    email: 'support@edusoma.com',
    phone: '+1 (555) 123-4567',
    address: '123 Learning Street, Education City, EC 12345'
  };

  onNewsletterSubmit(): void {
    if (this.newsletterEmail.trim()) {
      // TODO: Implement newsletter signup
      console.log('Newsletter signup:', this.newsletterEmail);
      this.newsletterEmail = '';
      // Show success message
    }
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  openSocialLink(url: string): void {
    window.open(url, '_blank');
  }
}
