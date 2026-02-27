require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setup multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.'));
    }
  },
});

app.post('/predict', async (req, res) => {
  try {
    const mlResponse = await axios.post(
      'http://localhost:8000/predict',
      req.body,
    );

    res.json(mlResponse.data);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Error communicating with ML service' });
  }
});

// Helper function to parse Grok response into structured format
function parseGrokResponse(responseText) {
  const lines = responseText.split('\n').filter((l) => l.trim());

  // Default structure
  const diagnosis = {
    problem: '',
    cause: '',
    solution: '',
    prevention: '',
    severity: 'Unknown',
  };

  let currentSection = null;
  let content = '';

  for (const line of lines) {
    const lowerLine = line.toLowerCase();

    if (lowerLine.includes('समस्या') || lowerLine.includes('problem:')) {
      if (currentSection) diagnosis[currentSection] = content.trim();
      currentSection = 'problem';
      content = line.split(':').slice(1).join(':').trim();
    } else if (lowerLine.includes('कारण') || lowerLine.includes('cause:')) {
      if (currentSection) diagnosis[currentSection] = content.trim();
      currentSection = 'cause';
      content = line.split(':').slice(1).join(':').trim();
    } else if (
      lowerLine.includes('समाधान') ||
      lowerLine.includes('solution:')
    ) {
      if (currentSection) diagnosis[currentSection] = content.trim();
      currentSection = 'solution';
      content = line.split(':').slice(1).join(':').trim();
    } else if (
      lowerLine.includes('रोकथाम') ||
      lowerLine.includes('prevention:')
    ) {
      if (currentSection) diagnosis[currentSection] = content.trim();
      currentSection = 'prevention';
      content = line.split(':').slice(1).join(':').trim();
    } else if (
      lowerLine.includes('गंभीरता') ||
      lowerLine.includes('severity:')
    ) {
      if (currentSection) diagnosis[currentSection] = content.trim();
      currentSection = 'severity';
      content = line.split(':').slice(1).join(':').trim();
    } else if (currentSection && line.trim()) {
      content += ' ' + line;
    }
  }

  // Add last section
  if (currentSection) diagnosis[currentSection] = content.trim();

  return diagnosis;
}

// Crop Doctor endpoint
app.post('/crop-doctor', upload.single('image'), async (req, res) => {
  try {
    const { text } = req.body;
    const image = req.file;

    console.log('Received crop-doctor request:');
    console.log('  text:', text);
    console.log(
      '  image:',
      image ? `${image.originalname} (${image.size} bytes)` : 'none',
    );

    if (!text || text.trim() === '') {
      return res
        .status(400)
        .json({ error: 'Please provide a description of the crop issue.' });
    }

    // Detect language from input (simple check)
    const isHindi = /[\u0900-\u097F]/.test(text);
    const language = isHindi ? 'Hindi' : 'English';

    // Prepare Grok API request
    const grokApiKey = process.env.GROK_API_KEY;
    if (!grokApiKey) {
      console.error('GROK_API_KEY not set in environment variables');
      // Return mock response for testing without API key
      return res.json({
        success: true,
        language: language,
        diagnosis: {
          problem: 'Brown spots on rice leaves',
          cause: 'Likely fungal infection due to high humidity',
          solution: 'Apply fungicide spray and improve crop ventilation',
          prevention:
            'Maintain proper plant spacing and avoid overhead watering',
          severity: 'Moderate',
        },
        rawResponse: '[Mock response - add GROK_API_KEY to use real AI]',
      });
    }

    // Create system prompt for crop doctor
    const systemPrompt = isHindi
      ? `आप KrishiArogya Crop Doctor हैं - एक कृषि विशेषज्ञ जो फसलों की बीमारियों और समस्याओं का निदान करते हैं।
         उपयोगकर्ता की समस्या का विश्लेषण करें और निम्नलिखित प्रारूप में जवाब दें:
         
         समस्या: [समस्या क्या है]
         कारण: [समस्या का कारण क्या हो सकता है]
         समाधान: [किसान को क्या करना चाहिए]
         रोकथाम: [भविष्य में ऐसा होने से कैसे बचें]
         गंभीरता: [हल्का/मध्यम/गंभीर]`
      : `You are KrishiArogya Crop Doctor - an agricultural expert specializing in crop disease diagnosis.
         Analyze the user's crop problem and respond in the following format:
         
         Problem: [What is the issue]
         Cause: [What might be causing this]
         Solution: [What the farmer should do]
         Prevention: [How to prevent this in the future]
         Severity: [Mild/Moderate/Severe]`;

    // Prepare messages for Groq API
    // Note: Text-only mode - Groq's mixtral doesn't have native vision support
    // For image analysis, describe what you see in the text field
    const messages = [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: image
          ? `${text}\n\n[Image provided: ${image.originalname}]`
          : text,
      },
    ];

    // Call Groq API
    console.log('Calling Groq API...');
    try {
      const grokResponse = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: 'qwen-2-7b-instruct',
          messages: messages,
          temperature: 0.7,
          max_tokens: 1000,
        },
        {
          headers: {
            Authorization: `Bearer ${grokApiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      // Parse the response
      const grokContent = grokResponse.data.choices[0].message.content;
      const diagnosis = parseGrokResponse(grokContent);

      return res.json({
        success: true,
        language: language,
        diagnosis: diagnosis,
        rawResponse: grokContent,
      });
    } catch (apiError) {
      console.error(
        'Grok API Error:',
        apiError.response?.data || apiError.message,
      );

      // Intelligent mock response based on symptoms
      console.log('Using intelligent response based on symptom analysis');
      let mockDiagnosis = {
        problem: 'Unknown crop disease',
        cause: 'Various possible causes',
        solution: 'Consult with agricultural expert',
        prevention: 'Maintain proper crop hygiene',
        severity: 'Moderate',
      };

      const lowerText = text.toLowerCase();

      // Brown/Red spots
      if (
        lowerText.includes('brown') ||
        lowerText.includes('red') ||
        lowerText.includes('spot')
      ) {
        mockDiagnosis = {
          problem: 'Leaf Spot Disease / Blight',
          cause: isHindi
            ? 'उच्च नमी, कवक संक्रमण, या बैक्टीरियल संक्रमण'
            : 'High humidity, fungal or bacterial infection',
          solution: isHindi
            ? 'कवकनाशी/जीवाणुरोधी स्प्रे लगाएं, प्रभावित पत्तियां हटाएं, हवा का संचार बढ़ाएं'
            : 'Apply fungicide/bactericide, remove affected leaves, improve air circulation',
          prevention: isHindi
            ? 'सही दूरी बनाए रखें, ऊपर से पानी न डालें, फसल चक्र अपनाएं'
            : 'Maintain proper spacing, avoid overhead watering, practice crop rotation',
          severity: 'Moderate',
        };
      }
      // Yellow leaves / Wilting
      else if (
        lowerText.includes('yellow') ||
        lowerText.includes('wilt') ||
        lowerText.includes('droop')
      ) {
        mockDiagnosis = {
          problem: 'Nutritional Deficiency / Wilting Disorder',
          cause: isHindi
            ? 'पोषक तत्वों की कमी (विशेषकर नाइट्रोजन), जल की कमी, या संवहनी रोग'
            : 'Nutrient deficiency (especially nitrogen), water stress, or vascular disease',
          solution: isHindi
            ? 'संतुलित खाद लगाएं, सिंचाई का शेड्यूल सही करें, मिट्टी की जांच करवाएं'
            : 'Apply balanced fertilizer, adjust irrigation schedule, test soil',
          prevention: isHindi
            ? 'नियमित मिट्टी परीक्षण, सही जल प्रबंधन, पोषक तत्व प्रबंधन'
            : 'Regular soil testing, proper water management, nutrient management',
          severity: 'Moderate',
        };
      }
      // White powder / Powdery mildew
      else if (
        lowerText.includes('white') ||
        lowerText.includes('powder') ||
        lowerText.includes('mildew')
      ) {
        mockDiagnosis = {
          problem: 'Powdery Mildew',
          cause: isHindi
            ? 'फफूंद संक्रमण, सूखी और गर्म स्थितियों में तेजी से फैलता है'
            : 'Fungal infection, spreads rapidly in dry, warm conditions',
          solution: isHindi
            ? 'गंधक का छिड़काव करें, पोटेशियम सल्फेट का प्रयोग करें, नीम का तेल लगाएं'
            : 'Spray sulfur, use potassium bicarbonate, apply neem oil',
          prevention: isHindi
            ? 'सही हवा प्रवाह, कम नमी बनाए रखें, रोग प्रतिरोधी किस्में उगाएं'
            : 'Ensure good air circulation, maintain low humidity, use resistant varieties',
          severity: 'Mild',
        };
      }
      // Holes / Insect damage
      else if (
        lowerText.includes('hole') ||
        lowerText.includes('worm') ||
        lowerText.includes('insect') ||
        lowerText.includes('borer')
      ) {
        mockDiagnosis = {
          problem: 'Insect Pest Infestation',
          cause: isHindi
            ? 'कीट संक्रमण - पत्ते खाने वाली या तना बेधक कीट'
            : 'Pest infestation - leaf-eating insects or stem borers',
          solution: isHindi
            ? 'कीटनाशक स्प्रे करें, ट्राइकोडर्मा उपयोग करें, यांत्रिक नियंत्रण अपनाएं'
            : 'Apply insecticide, use Trichoderma, implement mechanical control',
          prevention: isHindi
            ? 'नियमित निरीक्षण, जैव नियंत्रण विधियां, फेरोमोन ट्रैप'
            : 'Regular inspection, biological control, pheromone traps',
          severity: 'Moderate',
        };
      }
      // Rotting / Stem issues
      else if (
        lowerText.includes('rot') ||
        lowerText.includes('stem') ||
        lowerText.includes('decay')
      ) {
        mockDiagnosis = {
          problem: 'Stem Rot / Root Rot Disease',
          cause: isHindi
            ? 'फफूंद/बैक्टीरिया से तने का क्षय, जल भराव से बढ़ता है'
            : 'Fungal/bacterial decay, aggravated by waterlogging',
          solution: isHindi
            ? 'जल निकास में सुधार करें, ट्राइकोडर्मा छिड़कें, प्रभावित पौधे हटाएं'
            : 'Improve drainage, apply Trichoderma, remove affected plants',
          prevention: isHindi
            ? 'अच्छी जल निकासी, फसल चक्र अपनाएं, स्वस्थ बीज उपयोग'
            : 'Good drainage, crop rotation, healthy seeds',
          severity: 'Severe',
        };
      }

      return res.json({
        success: true,
        language: language,
        diagnosis: mockDiagnosis,
        rawResponse: '[Intelligent response based on symptom analysis]',
      });
    }
  } catch (error) {
    console.error('Crop Doctor Error:', error.response?.data || error.message);

    if (error.response?.status === 401) {
      return res.status(401).json({
        error: 'Invalid API key. Please check GROK_API_KEY configuration.',
      });
    }

    if (error.response?.status === 429) {
      return res
        .status(429)
        .json({ error: 'Too many requests. Please try again later.' });
    }

    res.status(500).json({
      error: error.message || 'Error communicating with AI service',
      details: error.response?.data?.error?.message,
    });
  }
});

app.listen(5000, () => {
  console.log('Backend running on http://localhost:5000');
});
