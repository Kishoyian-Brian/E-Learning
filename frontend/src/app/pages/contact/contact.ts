import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Footer } from '../footer/footer';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, Footer],
  templateUrl: './contact.html',
  styleUrl: './contact.css'
})
export class Contact {
  contactForm = {
    name: '',
    email: '',
    subject: '',
    message: '',
    category: 'general'
  };

  isSubmitting = false;
  submitSuccess = false;
  submitError = false;

  categories = [
    { value: 'general', label: 'General Inquiry' },
    { value: 'technical', label: 'Technical Support' },
    { value: 'billing', label: 'Billing & Payments' },
    { value: 'partnership', label: 'Partnership' },
    { value: 'feedback', label: 'Feedback & Suggestions' }
  ];

  offices = [
    {
      city: 'San Francisco',
      country: 'United States',
      address: '123 Innovation Drive, San Francisco, CA 94105',
      phone: '+1 (555) 123-4567',
      email: 'sf@edusoma.com',
      hours: 'Mon-Fri: 9AM-6PM PST',
      coordinates: { lat: 37.7749, lng: -122.4194 }
    },
    {
      city: 'London',
      country: 'United Kingdom',
      address: '456 Learning Street, London, UK EC1A 1BB',
      phone: '+44 20 7123 4567',
      email: 'london@edusoma.com',
      hours: 'Mon-Fri: 9AM-6PM GMT',
      coordinates: { lat: 51.5074, lng: -0.1278 }
    },
    {
      city: 'Singapore',
      country: 'Singapore',
      address: '789 Education Avenue, Singapore 018956',
      phone: '+65 6123 4567',
      email: 'sg@edusoma.com',
      hours: 'Mon-Fri: 9AM-6PM SGT',
      coordinates: { lat: 1.3521, lng: 103.8198 }
    }
  ];

  faqItems = [
    {
      question: 'How do I enroll in a course?',
      answer: 'You can enroll in any course by clicking the "Enroll Now" button on the course page. You\'ll be guided through the payment process and then gain immediate access to the course content.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers for corporate accounts. All payments are processed securely through our payment partners.'
    },
    {
      question: 'Can I get a refund if I\'m not satisfied?',
      answer: 'Yes, we offer a 30-day money-back guarantee. If you\'re not satisfied with your course within 30 days of purchase, you can request a full refund through your account dashboard.'
    },
    {
      question: 'Do you offer certificates upon completion?',
      answer: 'Yes, all our courses provide certificates of completion. Some courses also offer industry-recognized certifications. You can download your certificate from your course dashboard once you complete all requirements.'
    },
    {
      question: 'How can I contact my instructor?',
      answer: 'You can contact your instructor through the course discussion forum, direct messaging within the course platform, or by email. Most instructors respond within 24-48 hours.'
    }
  ];

  expandedFaq: number | null = null;

  onSubmit(): void {
    if (this.isSubmitting) return;

    this.isSubmitting = true;
    this.submitError = false;
    this.submitSuccess = false;

    // Simulate form submission
    setTimeout(() => {
      this.isSubmitting = false;
      
      // Simulate success (in real app, this would be based on actual API response)
      if (this.contactForm.email && this.contactForm.message) {
        this.submitSuccess = true;
        this.resetForm();
      } else {
        this.submitError = true;
      }
    }, 2000);
  }

  resetForm(): void {
    this.contactForm = {
      name: '',
      email: '',
      subject: '',
      message: '',
      category: 'general'
    };
  }

  toggleFaq(index: number): void {
    this.expandedFaq = this.expandedFaq === index ? null : index;
  }

  openMap(coordinates: { lat: number; lng: number }): void {
    const url = `https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}`;
    window.open(url, '_blank');
  }

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      // Show a brief success message (you could add a toast notification here)
      console.log('Copied to clipboard:', text);
    });
  }

  getOfficeIcon(country: string): string {
    switch (country) {
      case 'United States':
        return 'fas fa-flag-usa';
      case 'United Kingdom':
        return 'fas fa-flag';
      case 'Singapore':
        return 'fas fa-flag';
      default:
        return 'fas fa-building';
    }
  }

  getCategoryIcon(category: string): string {
    switch (category) {
      case 'general':
        return 'fas fa-question-circle';
      case 'technical':
        return 'fas fa-tools';
      case 'billing':
        return 'fas fa-credit-card';
      case 'partnership':
        return 'fas fa-handshake';
      case 'feedback':
        return 'fas fa-comment';
      default:
        return 'fas fa-envelope';
    }
  }

  scrollToContactForm(): void {
    const element = document.getElementById('contact-form');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  scrollToFaq(): void {
    const element = document.getElementById('faq-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
} 