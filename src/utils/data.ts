import { Contact, Note, Reminder } from './types';

export const mockContacts: Contact[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    email: 'sarah@example.com',
    phone: '+1 (555) 123-4567',
    lastContact: new Date('2024-01-10'),
    nextReminder: new Date('2024-01-15'),
    tags: ['friend', 'designer', 'mentor'],
    notes: [],
    starred: true,
    metAt: 'Design conference 2023',
    relationship: 'Close friend & mentor',
    sentiment: 'positive'
  },
  {
    id: '2',
    name: 'Marcus Rodriguez',
    email: 'marcus@startup.com',
    lastContact: new Date('2024-01-08'),
    nextReminder: new Date('2024-01-20'),
    tags: ['colleague', 'startup', 'needs-follow-up'],
    notes: [],
    starred: false,
    metAt: 'Tech meetup',
    relationship: 'Professional contact',
    sentiment: 'neutral'
  },
  {
    id: '3',
    name: 'Emma Thompson',
    email: 'emma.t@agency.com',
    phone: '+1 (555) 987-6543',
    lastContact: new Date('2024-01-05'),
    nextReminder: new Date('2024-01-18'),
    tags: ['client', 'creative', 'high-priority'],
    notes: [],
    starred: true,
    metAt: 'Client referral',
    relationship: 'Key client',
    sentiment: 'positive'
  },
  {
    id: '4',
    name: 'David Park',
    email: 'david@techcorp.com',
    lastContact: new Date('2024-01-03'),
    tags: ['former-colleague', 'engineer', 'catch-up-needed'],
    notes: [],
    starred: false,
    metAt: 'Previous company',
    relationship: 'Former colleague',
    sentiment: 'needs-attention'
  }
];

export const mockNotes: Note[] = [
  {
    id: '1',
    contactId: '1',
    content: 'Had a great coffee chat about her new design system work. She mentioned being interested in collaboration opportunities.',
    date: new Date('2024-01-10'),
    tags: ['coffee', 'collaboration', 'design-systems'],
    sentiment: 'positive',
    type: 'meeting'
  },
  {
    id: '2',
    contactId: '2',
    content: 'Quick call about the startup pitch. He seemed stressed about funding but excited about the product direction.',
    date: new Date('2024-01-08'),
    tags: ['startup', 'funding', 'product'],
    sentiment: 'neutral',
    type: 'call'
  }
];

export const mockReminders: Reminder[] = [
  {
    id: '1',
    contactId: '1',
    contactName: 'Sarah Chen',
    message: 'Follow up on collaboration project',
    date: new Date('2024-01-15'),
    completed: false
  },
  {
    id: '2',
    contactId: '3',
    contactName: 'Emma Thompson',
    message: 'Send project proposal draft',
    date: new Date('2024-01-18'),
    completed: false
  },
  {
    id: '3',
    contactId: '4',
    contactName: 'David Park',
    message: 'Schedule catch-up call',
    date: new Date('2024-01-16'),
    completed: false
  }
];