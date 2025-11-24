const Joi = require('joi');

/**
 * Middleware de validation générique
 */
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path[0],
        message: detail.message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Erreur de validation',
        errors
      });
    }
    
    next();
  };
};

// Schémas de validation
const schemas = {
  register: Joi.object({
    firstName: Joi.string().trim().max(50).required()
      .messages({
        'string.empty': 'Le prénom est requis',
        'string.max': 'Le prénom ne peut pas dépasser 50 caractères'
      }),
    lastName: Joi.string().trim().max(50).required()
      .messages({
        'string.empty': 'Le nom est requis',
        'string.max': 'Le nom ne peut pas dépasser 50 caractères'
      }),
    email: Joi.string().email().required()
      .messages({
        'string.empty': 'L\'email est requis',
        'string.email': 'Email invalide'
      }),
    password: Joi.string().min(6).required()
      .messages({
        'string.empty': 'Le mot de passe est requis',
        'string.min': 'Le mot de passe doit contenir au moins 6 caractères'
      })
  }),
  
  login: Joi.object({
    email: Joi.string().email().required()
      .messages({
        'string.empty': 'L\'email est requis',
        'string.email': 'Email invalide'
      }),
    password: Joi.string().required()
      .messages({
        'string.empty': 'Le mot de passe est requis'
      })
  }),
  
  updateProfile: Joi.object({
    firstName: Joi.string().trim().max(50).optional(),
    lastName: Joi.string().trim().max(50).optional(),
    bio: Joi.string().max(200).allow('').optional()
  }),
  
  updateStatus: Joi.object({
    status: Joi.string().valid('online', 'offline', 'away').required()
      .messages({
        'any.only': 'Le statut doit être: online, offline ou away'
      })
  }),
  
  addContact: Joi.object({
    contactId: Joi.string().required()
      .messages({
        'string.empty': 'L\'ID du contact est requis'
      }),
    customName: Joi.string().trim().max(50).optional()
  }),
  
  updateContactName: Joi.object({
    customName: Joi.string().trim().max(50).allow('').required()
      .messages({
        'string.empty': 'Le nom personnalisé est requis (peut être vide)'
      })
  })
};

module.exports = { validate, schemas };
