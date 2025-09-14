// /routes/tags.js - NEW: Tags API route
const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { 
  VALID_TAGS, 
  TAGS_BY_LANGUAGE, 
  TAG_METADATA, 
  getTagsForLanguage, 
  getTagsForLanguages,
  getTagsForFrontend,
  validateTags,
  isValidTag 
} = require('../constants/tags');

// ✅ GET /api/tags - Get all valid tags
router.get('/', verifyToken, (req, res) => {
  try {
    const { languages } = req.query;
    
    // If languages filter is provided
    if (languages) {
      const languageArray = languages.split(',').map(lang => lang.trim());
      const result = getTagsForFrontend(languageArray);
      
      res.json({
        success: true,
        data: result
      });
    } else {
      // Return all tags structured for frontend
      const result = getTagsForFrontend();
      
      res.json({
        success: true,
        data: result
      });
    }
  } catch (error) {
    console.error('Tags API error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch tags'
    });
  }
});

// ✅ GET /api/tags/languages/:language - Get tags for specific language
router.get('/languages/:language', verifyToken, (req, res) => {
  try {
    const { language } = req.params;
    const tags = getTagsForLanguage(language);
    
    if (!tags.length && language !== 'custom') {
      return res.status(400).json({
        success: false,
        error: `Invalid language: ${language}`
      });
    }
    
    res.json({
      success: true,
      language,
      tags,
      metadata: tags.reduce((acc, tag) => {
        acc[tag] = TAG_METADATA[tag] || { 
          label: tag, 
          description: `${tag} related concepts` 
        };
        return acc;
      }, {})
    });
  } catch (error) {
    console.error('Language tags API error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch language-specific tags'
    });
  }
});

// ✅ POST /api/tags/validate - Validate array of tags
router.post('/validate', verifyToken, (req, res) => {
  try {
    const { tags } = req.body;
    
    if (!Array.isArray(tags)) {
      return res.status(400).json({
        success: false,
        error: 'Tags must be provided as an array'
      });
    }
    
    const invalidTags = validateTags(tags);
    const validTags = tags.filter(tag => isValidTag(tag));
    
    res.json({
      success: true,
      validation: {
        allValid: invalidTags.length === 0,
        validTags,
        invalidTags,
        validCount: validTags.length,
        invalidCount: invalidTags.length,
        totalCount: tags.length
      }
    });
  } catch (error) {
    console.error('Tag validation API error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to validate tags'
    });
  }
});

// ✅ GET /api/tags/metadata - Get tag metadata for UI display
router.get('/metadata', verifyToken, (req, res) => {
  try {
    const { tags } = req.query;
    
    if (tags) {
      // Get metadata for specific tags
      const tagArray = tags.split(',').map(tag => tag.trim());
      const metadata = tagArray.reduce((acc, tag) => {
        if (isValidTag(tag)) {
          acc[tag] = TAG_METADATA[tag] || { 
            label: tag, 
            description: `${tag} related concepts` 
          };
        }
        return acc;
      }, {});
      
      res.json({
        success: true,
        metadata
      });
    } else {
      // Return all metadata
      res.json({
        success: true,
        metadata: TAG_METADATA
      });
    }
  } catch (error) {
    console.error('Tag metadata API error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch tag metadata'
    });
  }
});

module.exports = router;