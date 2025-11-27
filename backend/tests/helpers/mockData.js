/**
 * Données mock pour les tests
 */

const mockUser = {
  email: 'test@example.com',
  password: 'Password123!',
  firstName: 'John',
  lastName: 'Doe',
  username: 'johndoe'
};

const mockUser2 = {
  email: 'test2@example.com',
  password: 'Password123!',
  firstName: 'Jane',
  lastName: 'Smith',
  username: 'janesmith'
};

const mockMessage = {
  content: 'Hello, this is a test message',
  type: 'text'
};

const mockImageMessage = {
  content: 'Image message',
  type: 'image',
  mediaUrl: '/uploads/test-image.jpg'
};

const mockGroupConversation = {
  name: 'Test Group',
  description: 'A test group conversation',
  isGroup: true
};

const mockReaction = {
  emoji: '👍'
};

const mockContact = {
  nickname: 'My Friend'
};

const mockNotification = {
  type: 'message',
  title: 'New Message',
  message: 'You have a new message'
};

const mockSecurityAlert = {
  type: 'login_attempt',
  severity: 'medium',
  message: 'New login attempt detected'
};

module.exports = {
  mockUser,
  mockUser2,
  mockMessage,
  mockImageMessage,
  mockGroupConversation,
  mockReaction,
  mockContact,
  mockNotification,
  mockSecurityAlert
};
