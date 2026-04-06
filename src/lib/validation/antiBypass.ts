// ============================================
// ANTI-BYPASS VALIDATION SYSTEM
// Prevents direct contact between buyers and suppliers
// ============================================

// Phone number patterns (Arabic & English digits)
const PHONE_PATTERNS = [
  // Egyptian mobile numbers
  /\b0[1-9]\d{9}\b/g,                    // 01xxxxxxxxx
  /\b0[1-9]\d{8}\b/g,                    // 01xxxxxxxx (9 digits)
  /\+20[1-9]\d{9}\b/g,                   // +201xxxxxxxxx
  /\+20\s[1-9]\d{9}\b/g,                 // +20 1xxxxxxxxx
  /\b20[1-9]\d{9}\b/g,                   // 201xxxxxxxxx (international)
  
  // Generic patterns
  /\b\d{7,}\b/g,                         // Any 7+ consecutive digits
  /\d{3}[\s\-\.]\d{3}[\s\-\.]\d{4}/g,    // 123-456-7890 patterns
  /\(\d{2,4}\)\s*\d{6,10}/g,             // (02) 12345678
];

// Blocked keywords (contact-related)
const BLOCKED_KEYWORDS = [
  // Arabic
  'واتساب', 'واتس', 'واتسابي', 'واتسي',
  'كلمني', 'كلميني', 'اتصل بي', 'اتصلبي',
  'اتواصل', 'تواصل معي', 'تواصل معاي',
  'رقمي', 'رقم التليفون', 'رقم الموبايل', 'رقم الهاتف',
  'موبايلي', 'تليفوني', 'هاتفي',
  'ايميلي', 'بريدي', 'الايميل',
  'فيسبوك', 'فيس', 'ماسنجر',
  'تيليجرام', 'تيلجرام', 'تلجرام',
  'سناب', 'سناب شات', 'انستا', 'انستغرام',
  'ديركت', 'خاص', 'برايفت', 'شات',
  'ارقام', 'ارقامي', 'ارقامنا',
  
  // English
  'whatsapp', 'whats app', 'whatsup',
  'call me', 'callme', 'contact me',
  'my number', 'my phone', 'phone number',
  'email me', 'my email',
  'facebook', 'fb', 'messenger',
  'telegram', 'tg',
  'snapchat', 'snap', 'instagram', 'insta',
  'dm', 'direct message', 'private message', 'pm',
  'reach me', 'get in touch',
];

// Suspicious patterns (creative bypass attempts)
const SUSPICIOUS_PATTERNS = [
  /zero[\s\-_]?one/gi,                   // "zero one" -> 01
  /o[\s\-_]?1/gi,                        // "o 1" -> 01
  /زيرو[\s\-_]?ون/gi,                    // Arabic creative
  /صفر[\s\-_]?واحد/gi,                  // Arabic digits written
  /\b\d\b[\s\-_]+\b\d\b[\s\-_]+\b\d\b/g, // Spaced out digits
  /\[\d\]/g,                             // [0] [1] patterns
  /\(\d\)/g,                             // (0) (1) patterns
  /\{\d\}/g,                             // {0} {1} patterns
];

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedContent?: string;
  blockedPatterns: string[];
}

/**
 * Validates content for phone numbers and blocked keywords
 * Returns validation result with errors if found
 */
export function validateContent(
  content: string,
  options: {
    allowPartialSanitization?: boolean;
    contentType?: 'offer' | 'review' | 'order_notes' | 'message';
  } = {}
): ValidationResult {
  const errors: string[] = [];
  const blockedPatterns: string[] = [];
  let sanitizedContent = content;
  
  // Check for phone numbers
  for (const pattern of PHONE_PATTERNS) {
    const matches = content.match(pattern);
    if (matches) {
      errors.push('يحتوي النص على رقم هاتف. يرجى إزالة معلومات التواصل المباشر.');
      blockedPatterns.push(...matches);
      
      // Replace with placeholder
      sanitizedContent = sanitizedContent.replace(pattern, '[***]');
    }
  }
  
  // Check for blocked keywords (case insensitive)
  const contentLower = content.toLowerCase();
  const contentArabic = content; // Keep original for Arabic matching
  
  for (const keyword of BLOCKED_KEYWORDS) {
    const keywordLower = keyword.toLowerCase();
    
    // Check in both Arabic and English content
    if (contentLower.includes(keywordLower) || contentArabic.includes(keyword)) {
      errors.push(`يحتوي النص على كلمة محظورة: "${keyword}". يرجى إعادة الصياغة.`);
      blockedPatterns.push(keyword);
      
      // Replace keyword
      const regex = new RegExp(keyword, 'gi');
      sanitizedContent = sanitizedContent.replace(regex, '[***]');
    }
  }
  
  // Check for suspicious patterns
  for (const pattern of SUSPICIOUS_PATTERNS) {
    const matches = content.match(pattern);
    if (matches) {
      errors.push('يحتوي النص على أنماط مشبوهة قد تكون محاولة للتحايل.');
      blockedPatterns.push(...matches);
      sanitizedContent = sanitizedContent.replace(pattern, '[***]');
    }
  }
  
  // Remove duplicate errors
  const uniqueErrors = [...new Set(errors)];
  
  return {
    isValid: uniqueErrors.length === 0,
    errors: uniqueErrors,
    sanitizedContent: sanitizedContent !== content ? sanitizedContent : undefined,
    blockedPatterns: [...new Set(blockedPatterns)],
  };
}

/**
 * Sanitizes content by removing/replacing blocked patterns
 */
export function sanitizeContent(content: string): string {
  let sanitized = content;
  
  // Remove phone numbers
  for (const pattern of PHONE_PATTERNS) {
    sanitized = sanitized.replace(pattern, '[***]');
  }
  
  // Remove blocked keywords
  for (const keyword of BLOCKED_KEYWORDS) {
    const regex = new RegExp(keyword, 'gi');
    sanitized = sanitized.replace(regex, '[***]');
  }
  
  // Remove suspicious patterns
  for (const pattern of SUSPICIOUS_PATTERNS) {
    sanitized = sanitized.replace(pattern, '[***]');
  }
  
  return sanitized;
}

/**
 * Validates offer submission
 */
export function validateOffer(
  price: number,
  notes: string
): ValidationResult {
  const errors: string[] = [];
  const blockedPatterns: string[] = [];
  
  // Validate price
  if (!price || price <= 0) {
    errors.push('يرجى إدخال سعر صحيح');
  }
  
  if (price > 10000000) {
    errors.push('السعر يبدو غير منطقي. يرجى التحقق.');
  }
  
  // Validate notes
  if (notes && notes.trim()) {
    const contentValidation = validateContent(notes);
    if (!contentValidation.isValid) {
      errors.push(...contentValidation.errors);
      blockedPatterns.push(...contentValidation.blockedPatterns);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    blockedPatterns,
  };
}

/**
 * Validates review submission
 */
export function validateReview(
  rating: number,
  reviewText: string
): ValidationResult {
  const errors: string[] = [];
  
  // Validate rating
  if (!rating || rating < 1 || rating > 5) {
    errors.push('يرجى اختيار تقييم من 1 إلى 5 نجوم');
  }
  
  // Validate review text
  if (reviewText && reviewText.trim()) {
    const contentValidation = validateContent(reviewText);
    if (!contentValidation.isValid) {
      errors.push(...contentValidation.errors);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    blockedPatterns: [],
  };
}

/**
 * Validates order creation
 */
export function validateOrder(
  title: string,
  description: string,
  items: Array<{ product_name: string; notes?: string }>
): ValidationResult {
  const errors: string[] = [];
  
  // Validate title
  if (!title || title.trim().length < 3) {
    errors.push('يرجى إدخال عنوان من 3 أحرف على الأقل');
  }
  
  const titleValidation = validateContent(title);
  if (!titleValidation.isValid) {
    errors.push('عنوان الطلب يحتوي على محتوى غير مسموح به');
  }
  
  // Validate description
  if (description && description.trim()) {
    const descValidation = validateContent(description);
    if (!descValidation.isValid) {
      errors.push('وصف الطلب يحتوي على محتوى غير مسموح به');
    }
  }
  
  // Validate items
  if (!items || items.length === 0) {
    errors.push('يرجى إضافة منتج واحد على الأقل');
  }
  
  for (const item of items) {
    if (!item.product_name || item.product_name.trim().length < 2) {
      errors.push('اسم المنتج يجب أن يكون حرفين على الأقل');
    }
    
    const itemValidation = validateContent(item.product_name);
    if (!itemValidation.isValid) {
      errors.push('اسم المنتج يحتوي على محتوى غير مسموح به');
    }
    
    if (item.notes) {
      const notesValidation = validateContent(item.notes);
      if (!notesValidation.isValid) {
        errors.push('ملاحظات المنتج تحتوي على محتوى غير مسموح به');
      }
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors: [...new Set(errors)],
    blockedPatterns: [],
  };
}

// ============================================
// REACT HOOK FOR FORM VALIDATION
// ============================================

import { useState, useCallback } from 'react';

export function useContentValidation() {
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  
  const validate = useCallback((content: string, type: 'offer' | 'review' | 'order' = 'offer') => {
    setIsValidating(true);
    setValidationError(null);
    
    let result: ValidationResult;
    
    switch (type) {
      case 'offer':
        result = validateOffer(0, content);
        break;
      case 'review':
        result = validateReview(5, content);
        break;
      default:
        result = validateContent(content);
    }
    
    setIsValidating(false);
    
    if (!result.isValid) {
      setValidationError(result.errors[0]);
      return false;
    }
    
    return true;
  }, []);
  
  const clearError = useCallback(() => {
    setValidationError(null);
  }, []);
  
  return {
    validationError,
    isValidating,
    validate,
    clearError,
  };
}
