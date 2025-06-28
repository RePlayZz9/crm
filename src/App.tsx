import React, { useState } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/Layout';
import Home from './components/Home';
import Contacts from './components/Contacts';
import Timeline from './components/Timeline';
import NoteEntry from './components/NoteEntry';
import { mockContacts, mockNotes, mockReminders } from './utils/data';
import { Contact, Note, Reminder } from './utils/types';

function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'contacts' | 'timeline'>('home');
  const [isNoteEntryOpen, setIsNoteEntryOpen] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>(mockContacts);
  const [notes, setNotes] = useState<Note[]>(mockNotes);
  const [reminders, setReminders] = useState<Reminder[]>(mockReminders);

  const handleToggleStar = (contactId: string) => {
    setContacts(contacts.map(contact => 
      contact.id === contactId 
        ? { ...contact, starred: !contact.starred }
        : contact
    ));
  };

  const handleReminderComplete = (reminderId: string) => {
    setReminders(reminders.map(reminder =>
      reminder.id === reminderId
        ? { ...reminder, completed: true }
        : reminder
    ));
  };

  const handleContactClick = (contact: Contact) => {
    // In a real app, this would navigate to a contact detail page
    console.log('Contact clicked:', contact);
  };

  const handleSaveNote = (noteData: Omit<Note, 'id'>) => {
    const newNote: Note = {
      ...noteData,
      id: Math.random().toString(36).substr(2, 9)
    };
    
    setNotes([...notes, newNote]);
    
    // Update contact's last contact date and add note to contact
    setContacts(contacts.map(contact =>
      contact.id === noteData.contactId
        ? {
            ...contact,
            lastContact: new Date(),
            notes: [...contact.notes, newNote]
          }
        : contact
    ));
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'home':
        return (
          <Home
            contacts={contacts}
            reminders={reminders}
            onContactClick={handleContactClick}
            onReminderComplete={handleReminderComplete}
          />
        );
      case 'contacts':
        return (
          <Contacts
            contacts={contacts}
            onContactClick={handleContactClick}
            onToggleStar={handleToggleStar}
          />
        );
      case 'timeline':
        return <Timeline notes={notes} contacts={contacts} />;
      default:
        return null;
    }
  };

  return (
    <ThemeProvider>
      <Layout
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onNewNote={() => setIsNoteEntryOpen(true)}
      >
        {renderActiveTab()}
      </Layout>
      
      <NoteEntry
        isOpen={isNoteEntryOpen}
        onClose={() => setIsNoteEntryOpen(false)}
        contacts={contacts}
        onSave={handleSaveNote}
      />
    </ThemeProvider>
  );
}

export default App;