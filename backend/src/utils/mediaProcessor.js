const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const logger = require('../utils/logger');

/**
 * Générer une miniature pour une image
 */
const generateImageThumbnail = async (filePath) => {
  try {
    const thumbnailPath = filePath.replace(
      path.extname(filePath),
      '-thumb' + path.extname(filePath)
    );
    
    await sharp(filePath)
      .resize(200, 200, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 80 })
      .toFile(thumbnailPath);
    
    return thumbnailPath;
  } catch (error) {
    logger.error('Erreur génération miniature:', error);
    return null;
  }
};

/**
 * Compresser une image
 */
const compressImage = async (filePath) => {
  try {
    const ext = path.extname(filePath).toLowerCase();
    const compressedPath = filePath.replace(
      path.extname(filePath),
      '-compressed' + path.extname(filePath)
    );
    
    let sharpInstance = sharp(filePath);
    
    // Redimensionner si trop grande (max 1920x1920)
    const metadata = await sharpInstance.metadata();
    if (metadata.width > 1920 || metadata.height > 1920) {
      sharpInstance = sharpInstance.resize(1920, 1920, {
        fit: 'inside',
        withoutEnlargement: true
      });
    }
    
    // Compresser selon le format
    if (ext === '.jpg' || ext === '.jpeg') {
      await sharpInstance.jpeg({ quality: 85 }).toFile(compressedPath);
    } else if (ext === '.png') {
      await sharpInstance.png({ quality: 85, compressionLevel: 9 }).toFile(compressedPath);
    } else if (ext === '.webp') {
      await sharpInstance.webp({ quality: 85 }).toFile(compressedPath);
    } else {
      // Pour les autres formats, copier tel quel
      return filePath;
    }
    
    // Supprimer l'original et renommer le compressé
    await fs.unlink(filePath);
    await fs.rename(compressedPath, filePath);
    
    return filePath;
  } catch (error) {
    logger.error('Erreur compression image:', error);
    return filePath;
  }
};

/**
 * Générer une miniature pour une vidéo (capture du premier frame)
 */
const generateVideoThumbnail = async (filePath) => {
  // Pour l'instant, retourne null car nécessite ffmpeg
  // TODO: Implémenter avec fluent-ffmpeg
  logger.info('Génération miniature vidéo non implémentée (nécessite ffmpeg)');
  return null;
};

/**
 * Valider et traiter un fichier média
 */
const processMediaFile = async (file) => {
  try {
    const ext = path.extname(file.filename).toLowerCase();
    const mediaInfo = {
      url: `/uploads/${file.filename}`,
      size: file.size,
      fileName: file.originalname,
      mimeType: file.mimetype,
      thumbnailUrl: null
    };
    
    // Si c'est une image, compresser et générer miniature
    if (['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext)) {
      const fullPath = path.join(process.env.UPLOAD_PATH || './uploads', file.filename);
      
      // Compresser (sauf GIF)
      if (ext !== '.gif') {
        await compressImage(fullPath);
      }
      
      // Générer miniature
      const thumbPath = await generateImageThumbnail(fullPath);
      if (thumbPath) {
        mediaInfo.thumbnailUrl = `/uploads/${path.basename(thumbPath)}`;
      }
    }
    
    // Si c'est une vidéo, générer miniature
    if (['.mp4', '.mov', '.avi'].includes(ext)) {
      const thumbPath = await generateVideoThumbnail(file.path);
      if (thumbPath) {
        mediaInfo.thumbnailUrl = `/uploads/${path.basename(thumbPath)}`;
      }
    }
    
    return mediaInfo;
  } catch (error) {
    logger.error('Erreur traitement média:', error);
    throw error;
  }
};

/**
 * Supprimer un fichier média et sa miniature
 */
const deleteMediaFile = async (mediaUrl) => {
  try {
    if (!mediaUrl) return;
    
    const fileName = path.basename(mediaUrl);
    const filePath = path.join(process.env.UPLOAD_PATH || './uploads', fileName);
    
    // Supprimer le fichier principal
    try {
      await fs.unlink(filePath);
    } catch (err) {
      logger.warn(`Fichier non trouvé: ${filePath}`);
    }
    
    // Supprimer la miniature si elle existe
    const thumbPath = filePath.replace(
      path.extname(filePath),
      '-thumb' + path.extname(filePath)
    );
    
    try {
      await fs.unlink(thumbPath);
    } catch (err) {
      // Pas grave si la miniature n'existe pas
    }
    
  } catch (error) {
    logger.error('Erreur suppression média:', error);
  }
};

module.exports = {
  generateImageThumbnail,
  compressImage,
  generateVideoThumbnail,
  processMediaFile,
  deleteMediaFile
};
