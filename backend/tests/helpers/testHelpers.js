/**
 * Helpers pour les tests
 */

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../../src/models/User');
const Conversation = require('../../src/models/Conversation');
const Message = require('../../src/models/Message');

/**
 * Génère un token JWT pour les tests
 */
const generateTestToken = (userId) => {
  return jwt.sign(
    { userId }, // Doit correspondre au format de jwt.js : { userId }
    process.env.JWT_SECRET || 'test-secret-key',
    { expiresIn: '1h' }
  );
};

/**
 * Crée un utilisateur de test
 */
const createTestUser = async (userData = {}) => {
  const timestamp = Date.now().toString().slice(-8); // Derniers 8 chiffres
  const defaultUser = {
    email: `test${timestamp}@test.com`,
    password: await bcrypt.hash('Password123!', 10),
    firstName: 'Test',
    lastName: 'User',
    username: `user${timestamp}`, // Max 12 caractères
    isOnline: false,
    ...userData
  };

  const user = await User.create(defaultUser);
  return user;
};

/**
 * Crée plusieurs utilisateurs de test
 */
const createTestUsers = async (count = 2) => {
  const users = [];
  for (let i = 0; i < count; i++) {
    const timestamp = Date.now().toString().slice(-7); // Derniers 7 chiffres
    const user = await createTestUser({
      email: `test${timestamp}${i}@test.com`,
      username: `usr${timestamp}${i}`, // Max 11 caractères
      firstName: `User${i}`
    });
    users.push(user);
    // Petit délai pour éviter les doublons de timestamp
    await new Promise(resolve => setTimeout(resolve, 5));
  }
  return users;
};

/**
 * Crée une conversation de test
 */
const createTestConversation = async (participants, isGroup = false) => {
  const conversationData = {
    participants,
    isGroup,
    lastMessage: null,
    creator: participants[0], // Le premier participant est le créateur
    admins: isGroup ? [participants[0]] : []
  };

  if (isGroup) {
    conversationData.groupName = `Test Group ${Date.now()}`;
  }

  const conversation = await Conversation.create(conversationData);
  return conversation;
};

/**
 * Crée un message de test
 */
const createTestMessage = async (senderId, conversationId, content = 'Test message') => {
  const message = await Message.create({
    sender: senderId,
    conversation: conversationId,
    content,
    type: 'text',
    status: 'sent'
  });
  return message;
};

/**
 * Nettoie la base de données de test
 */
const cleanupDatabase = async () => {
  const collections = ['users', 'conversations', 'messages', 'contacts', 'notifications', 'securityalerts', 'sessions'];
  
  for (const collection of collections) {
    try {
      await global.__MONGOOSE__.connection.collection(collection).deleteMany({});
    } catch (error) {
      // Collection n'existe pas encore
    }
  }
};

/**
 * Attend qu'une condition soit vraie
 */
const waitFor = (conditionFn, timeout = 5000) => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const checkCondition = () => {
      if (conditionFn()) {
        resolve();
      } else if (Date.now() - startTime > timeout) {
        reject(new Error('Timeout waiting for condition'));
      } else {
        setTimeout(checkCondition, 100);
      }
    };
    
    checkCondition();
  });
};

/**
 * Mock de req, res, next pour les tests de middleware
 */
const createMockRequest = (data = {}) => {
  return {
    body: data.body || {},
    params: data.params || {},
    query: data.query || {},
    headers: data.headers || {},
    user: data.user || null,
    ...data
  };
};

const createMockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.cookie = jest.fn().mockReturnValue(res);
  res.clearCookie = jest.fn().mockReturnValue(res);
  return res;
};

const createMockNext = () => jest.fn();

module.exports = {
  generateTestToken,
  createTestUser,
  createTestUsers,
  createTestConversation,
  createTestMessage,
  cleanupDatabase,
  waitFor,
  createMockRequest,
  createMockResponse,
  createMockNext
};
