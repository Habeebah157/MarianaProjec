const { HfInference } = require('@huggingface/inference');
const dotenv = require('dotenv');
dotenv.config();

class AIService {
  constructor() {
    // Debug: Check environment variable
    console.log('Environment check:', {
      hasHfKey: !!process.env.HUGGINGFACE_API_KEY,
      keyType: typeof process.env.HUGGINGFACE_API_KEY,
      keyLength: process.env.HUGGINGFACE_API_KEY ? process.env.HUGGINGFACE_API_KEY.length : 0
    });

    const apiKey = process.env.HUGGINGFACE_API_KEY;
    
    if (!apiKey || typeof apiKey !== 'string' || apiKey.trim() === '') {
      console.error('HUGGINGFACE_API_KEY is missing, invalid, or empty');
      console.error('Please check your .env file and ensure it contains: HUGGINGFACE_API_KEY=hf_...');
      throw new Error('Missing or invalid Hugging Face API key');
    }

    this.hf = new HfInference(apiKey.trim());
    this.db = require('../db');
    
    this.models = {
      intentDetection: {
        model: 'facebook/bart-large-mnli',
        parameters: {
          candidate_labels: ['pricing', 'support', 'technical', 'general'],
          multi_label: false
        }
      }
    };
    
    this.responses = {
      pricing: [
        "Our pricing starts at $9.99/month for the basic plan with access to daily news updates and articles.",
        "We offer flexible subscription plans starting from $9.99/month. Premium plans include additional features like exclusive content and early access to articles.",
        "For detailed pricing information including enterprise plans, please visit our pricing page or contact our sales team at sales@muslimbulletin.com"
      ],
      support: [
        "You can reach our support team at support@muslimbulletin.com. We typically respond within 24 hours.",
        "For immediate assistance, check our FAQ section or contact us through our support portal.",
        "Our support team is available Monday-Friday 9AM-5PM EST. Email us at support@muslimbulletin.com"
      ],
      technical: [
        "For technical issues, please try clearing your browser cache and cookies first.",
        "If you're experiencing login issues, please reset your password or contact technical support.",
        "For app-related problems, make sure you have the latest version installed. Contact tech support if issues persist."
      ],
      general: [
        "Welcome to Muslim Bulletin! We provide daily Islamic news, articles, and community updates.",
        "Thank you for your interest in Muslim Bulletin. How can we help you today?",
        "For more information about our services, please visit our website or contact our team."
      ]
    };
  }

  async queryDatabaseWithAI(question) {
    try {
      const intent = await this.extractIntent(question);
      console.log('Detected intent:', intent);
      const dbResults = await this.queryDatabase(intent);
      return this.generateResponse(question, dbResults);
    } catch (error) {
      console.error('AI query error:', error);
      return this.getFallbackResponse(question);
    }
  }

  async extractIntent(question) {
    try {
      console.log('Attempting intent detection for:', question);
      const response = await this.hf.zeroShotClassification({
        model: this.models.intentDetection.model,
        inputs: question,
        parameters: this.models.intentDetection.parameters
      });
      
      console.log('Intent detection response:', response);
      return response?.labels?.[0] || this.getKeywordBasedIntent(question);
    } catch (error) {
      console.warn('Intent detection failed:', error.message);
      return this.getKeywordBasedIntent(question);
    }
  }

  getKeywordBasedIntent(question) {
    const q = question.toLowerCase();
    if (/(price|pricing|cost|plan|fee)/i.test(q)) return 'pricing';
    if (/(support|help|contact)/i.test(q)) return 'support';
    if (/(tech|bug|issue|error)/i.test(q)) return 'technical';
    return 'general';
  }

  async queryDatabase(intent) {
    const query = {
      text: `SELECT * FROM knowledge_base 
             WHERE intent = $1 OR tags ILIKE $2
             ORDER BY created_at DESC
             LIMIT 3`,
      values: [intent, `%${intent}%`]
    };
    
    try {
      const result = await this.db.query(query);
      return result.rows || [];
    } catch (err) {
      console.error('Database query failed:', err);
      return [];
    }
  }

  generateResponse(question, dbResults) {
    const intent = this.getKeywordBasedIntent(question);
    
    if (dbResults.length > 0) {
      const dbContent = dbResults[0].content;
      return dbContent || this.getIntentBasedResponse(intent, question);
    }
    
    return this.getIntentBasedResponse(intent, question);
  }

  getIntentBasedResponse(intent, question) {
    const q = question.toLowerCase();
    
    if (intent === 'pricing' && q.includes('free')) {
      return "We offer a 7-day free trial for new users. After that, our basic plan starts at $9.99/month.";
    }
    
    if (intent === 'support' && q.includes('phone')) {
      return "We currently provide support via email at support@muslimbulletin.com. Phone support is available for premium subscribers.";
    }
    
    return this.getRandomResponse(intent);
  }

  getRandomResponse(intent) {
    const responses = this.responses[intent] || this.responses.general;
    return responses[Math.floor(Math.random() * responses.length)];
  }

  getFallbackResponse(question) {
    const intent = this.getKeywordBasedIntent(question);
    return this.getRandomResponse(intent);
  }
}

module.exports = new AIService();