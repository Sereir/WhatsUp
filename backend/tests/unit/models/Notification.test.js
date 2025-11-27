const mongoose = require('mongoose');
const Notification = require('../../../src/models/Notification');
const User = require('../../../src/models/User');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await Notification.deleteMany({});
  await User.deleteMany({});
});

describe('Notification Model Tests', () => {
  let recipient, sender;

  beforeEach(async () => {
    recipient = await User.create({
      username: 'recipient',
      email: 'recipient@test.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'Recipient'
    });

    sender = await User.create({
      username: 'sender',
      email: 'sender@test.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'Sender'
    });
  });

  describe('Création et validation', () => {
    it('devrait créer une notification valide', async () => {
      const notification = await Notification.create({
        recipient: recipient._id,
        sender: sender._id,
        type: 'message',
        content: 'Nouveau message'
      });

      expect(notification).toBeDefined();
      expect(notification.recipient.toString()).toBe(recipient._id.toString());
      expect(notification.type).toBe('message');
      expect(notification.read).toBe(false);
    });

    it('ne devrait pas créer une notification sans recipient', async () => {
      await expect(Notification.create({
        sender: sender._id,
        type: 'message',
        content: 'Test'
      })).rejects.toThrow();
    });

    it('ne devrait pas créer une notification sans type', async () => {
      await expect(Notification.create({
        recipient: recipient._id,
        sender: sender._id,
        content: 'Test'
      })).rejects.toThrow();
    });
  });

  describe('Types de notifications', () => {
    it('devrait créer une notification de type message', async () => {
      const notification = await Notification.create({
        recipient: recipient._id,
        type: 'message',
        content: 'Nouveau message'
      });

      expect(notification.type).toBe('message');
    });

    it('devrait créer une notification de type group_add', async () => {
      const notification = await Notification.create({
        recipient: recipient._id,
        type: 'group_add',
        content: 'Ajouté au groupe'
      });

      expect(notification.type).toBe('group_add');
    });

    it('devrait créer une notification de type reaction', async () => {
      const notification = await Notification.create({
        recipient: recipient._id,
        type: 'reaction',
        content: 'Réaction sur votre message'
      });

      expect(notification.type).toBe('reaction');
    });
  });

  describe('État read', () => {
    it('devrait marquer une notification comme lue', async () => {
      const notification = await Notification.create({
        recipient: recipient._id,
        type: 'message',
        content: 'Test'
      });

      notification.read = true;
      await notification.save();

      const updated = await Notification.findById(notification._id);
      expect(updated.read).toBe(true);
    });

    it('devrait trouver les notifications non lues', async () => {
      await Notification.create({
        recipient: recipient._id,
        type: 'message',
        content: 'Test 1'
      });

      await Notification.create({
        recipient: recipient._id,
        type: 'message',
        content: 'Test 2',
        read: true
      });

      const unreadNotifications = await Notification.find({ 
        recipient: recipient._id,
        read: false 
      });

      expect(unreadNotifications).toHaveLength(1);
    });
  });

  describe('Champs optionnels', () => {
    it('devrait accepter conversation', async () => {
      const conversationId = new mongoose.Types.ObjectId();
      
      const notification = await Notification.create({
        recipient: recipient._id,
        type: 'message',
        content: 'Test',
        conversation: conversationId
      });

      expect(notification.conversation.toString()).toBe(conversationId.toString());
    });

    it('devrait accepter message', async () => {
      const messageId = new mongoose.Types.ObjectId();
      
      const notification = await Notification.create({
        recipient: recipient._id,
        type: 'message',
        content: 'Test',
        message: messageId
      });

      expect(notification.message.toString()).toBe(messageId.toString());
    });

    it('devrait accepter data', async () => {
      const notification = await Notification.create({
        recipient: recipient._id,
        type: 'message',
        content: 'Test',
        data: { extra: 'info' }
      });

      expect(notification.data).toEqual({ extra: 'info' });
    });
  });

  describe('Tri et requêtes', () => {
    beforeEach(async () => {
      await Notification.create({
        recipient: recipient._id,
        type: 'message',
        content: 'Notif 1'
      });

      await Notification.create({
        recipient: recipient._id,
        type: 'group_add',
        content: 'Notif 2'
      });

      await Notification.create({
        recipient: recipient._id,
        type: 'reaction',
        content: 'Notif 3'
      });
    });

    it('devrait récupérer toutes les notifications d\'un utilisateur', async () => {
      const notifications = await Notification.find({ recipient: recipient._id });

      expect(notifications).toHaveLength(3);
    });

    it('devrait filtrer par type', async () => {
      const messageNotifications = await Notification.find({
        recipient: recipient._id,
        type: 'message'
      });

      expect(messageNotifications).toHaveLength(1);
      expect(messageNotifications[0].type).toBe('message');
    });

    it('devrait trier par date (les plus récentes en premier)', async () => {
      const notifications = await Notification.find({ recipient: recipient._id })
        .sort({ createdAt: -1 });

      expect(notifications[0].content).toBe('Notif 3');
    });
  });

  describe('Suppression', () => {
    it('devrait supprimer une notification', async () => {
      const notification = await Notification.create({
        recipient: recipient._id,
        type: 'message',
        content: 'Test'
      });

      await Notification.deleteOne({ _id: notification._id });

      const deleted = await Notification.findById(notification._id);
      expect(deleted).toBeNull();
    });
  });
});
