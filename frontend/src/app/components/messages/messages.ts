import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
  isOwn: boolean;
  attachments?: string[];
}

interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  isOnline: boolean;
  messages: Message[];
}

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './messages.html',
  styleUrl: './messages.css'
})
export class MessagesComponent implements OnInit {
  conversations: Conversation[] = [];
  selectedConversation: Conversation | null = null;
  newMessage = '';
  searchTerm = '';
  loading = false;
  showAttachments = false;

  constructor() {}

  ngOnInit(): void {
    this.loadConversations();
  }

  loadConversations(): void {
    this.loading = true;
    
    // Mock data for development
    setTimeout(() => {
      this.conversations = [
        {
          id: '1',
          participantId: 'instructor1',
          participantName: 'Dr. Sarah Johnson',
          participantAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=50&h=50&fit=crop&crop=face',
          lastMessage: 'Great work on the assignment! I have some feedback for you.',
          lastMessageTime: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
          unreadCount: 2,
          isOnline: true,
          messages: [
            {
              id: '1',
              senderId: 'instructor1',
              senderName: 'Dr. Sarah Johnson',
              senderAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=50&h=50&fit=crop&crop=face',
              content: 'Hi there! How are you finding the course so far?',
              timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
              isRead: true,
              isOwn: false
            },
            {
              id: '2',
              senderId: 'user',
              senderName: 'You',
              senderAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face',
              content: 'It\'s been great! I really enjoyed the last module on data structures.',
              timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
              isRead: true,
              isOwn: true
            },
            {
              id: '3',
              senderId: 'instructor1',
              senderName: 'Dr. Sarah Johnson',
              senderAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=50&h=50&fit=crop&crop=face',
              content: 'That\'s wonderful to hear! Data structures are fundamental to programming.',
              timestamp: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
              isRead: true,
              isOwn: false
            },
            {
              id: '4',
              senderId: 'instructor1',
              senderName: 'Dr. Sarah Johnson',
              senderAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=50&h=50&fit=crop&crop=face',
              content: 'Great work on the assignment! I have some feedback for you.',
              timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
              isRead: false,
              isOwn: false
            }
          ]
        },
        {
          id: '2',
          participantId: 'instructor2',
          participantName: 'Prof. Michael Chen',
          participantAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face',
          lastMessage: 'The next class will cover advanced algorithms.',
          lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
          unreadCount: 0,
          isOnline: false,
          messages: [
            {
              id: '5',
              senderId: 'instructor2',
              senderName: 'Prof. Michael Chen',
              senderAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face',
              content: 'Hello! I wanted to let you know about the upcoming topics.',
              timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
              isRead: true,
              isOwn: false
            },
            {
              id: '6',
              senderId: 'user',
              senderName: 'You',
              senderAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face',
              content: 'Thank you for the update! I\'m looking forward to it.',
              timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3.5), // 3.5 hours ago
              isRead: true,
              isOwn: true
            },
            {
              id: '7',
              senderId: 'instructor2',
              senderName: 'Prof. Michael Chen',
              senderAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face',
              content: 'The next class will cover advanced algorithms.',
              timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
              isRead: true,
              isOwn: false
            }
          ]
        },
        {
          id: '3',
          participantId: 'student1',
          participantName: 'Emily Rodriguez',
          participantAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop&crop=face',
          lastMessage: 'Can you help me with the group project?',
          lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
          unreadCount: 1,
          isOnline: true,
          messages: [
            {
              id: '8',
              senderId: 'student1',
              senderName: 'Emily Rodriguez',
              senderAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop&crop=face',
              content: 'Hi! I\'m working on the group project and could use some help.',
              timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
              isRead: false,
              isOwn: false
            }
          ]
        }
      ];
      
      this.loading = false;
    }, 1000);
  }

  selectConversation(conversation: Conversation): void {
    this.selectedConversation = conversation;
    // Mark messages as read
    conversation.messages.forEach(message => {
      if (!message.isOwn) {
        message.isRead = true;
      }
    });
    conversation.unreadCount = 0;
  }

  sendMessage(): void {
    if (!this.newMessage.trim() || !this.selectedConversation) return;

    const message: Message = {
      id: Date.now().toString(),
      senderId: 'user',
      senderName: 'You',
      senderAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face',
      content: this.newMessage.trim(),
      timestamp: new Date(),
      isRead: false,
      isOwn: true
    };

    this.selectedConversation.messages.push(message);
    this.selectedConversation.lastMessage = this.newMessage.trim();
    this.selectedConversation.lastMessageTime = new Date();

    this.newMessage = '';
    
    // Simulate typing indicator and response
    this.simulateResponse();
  }

  simulateResponse(): void {
    if (!this.selectedConversation) return;

    setTimeout(() => {
      if (!this.selectedConversation) return; // Check again after timeout
      
      const responses = [
        'Thanks for your message! I\'ll get back to you soon.',
        'That\'s a great question. Let me think about it.',
        'I appreciate you reaching out.',
        'I\'ll review this and respond in detail.',
        'Thanks for sharing this with me.'
      ];

      const randomResponse = responses[Math.floor(Math.random() * responses.length)];

      const response: Message = {
        id: (Date.now() + 1).toString(),
        senderId: this.selectedConversation.participantId,
        senderName: this.selectedConversation.participantName,
        senderAvatar: this.selectedConversation.participantAvatar,
        content: randomResponse,
        timestamp: new Date(),
        isRead: false,
        isOwn: false
      };

      this.selectedConversation.messages.push(response);
      this.selectedConversation.lastMessage = randomResponse;
      this.selectedConversation.lastMessageTime = new Date();
    }, 2000);
  }

  getFilteredConversations(): Conversation[] {
    if (!this.searchTerm) return this.conversations;
    
    return this.conversations.filter(conversation =>
      conversation.participantName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      conversation.lastMessage.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  formatTime(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return date.toLocaleDateString();
  }

  formatMessageTime(date: Date): string {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  getUnreadCount(): number {
    return this.conversations.reduce((total, conversation) => total + conversation.unreadCount, 0);
  }

  markAllAsRead(): void {
    this.conversations.forEach(conversation => {
      conversation.messages.forEach(message => {
        if (!message.isOwn) {
          message.isRead = true;
        }
      });
      conversation.unreadCount = 0;
    });
  }

  deleteConversation(conversationId: string): void {
    this.conversations = this.conversations.filter(c => c.id !== conversationId);
    if (this.selectedConversation?.id === conversationId) {
      this.selectedConversation = null;
    }
  }

  toggleAttachments(): void {
    this.showAttachments = !this.showAttachments;
  }

  attachFile(file: File): void {
    // Handle file attachment
    console.log('Attaching file:', file.name);
  }

  getOnlineStatus(conversation: Conversation): string {
    return conversation.isOnline ? 'Online' : 'Offline';
  }

  getOnlineStatusColor(conversation: Conversation): string {
    return conversation.isOnline ? 'text-green-500' : 'text-gray-500';
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }
}
