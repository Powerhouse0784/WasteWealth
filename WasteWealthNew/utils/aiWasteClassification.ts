import * as FileSystem from 'expo-file-system';
import { Alert } from 'react-native';

// Mock AI classification service - in real app, integrate with ML model or API
export class AIWasteClassifier {
  private wasteCategories = [
    'plastic',
    'paper',
    'metal',
    'glass',
    'organic',
    'ewaste',
    'hazardous',
    'other'
  ];

  private categoryKeywords: { [key: string]: string[] } = {
    plastic: ['bottle', 'container', 'bag', 'wrapper', 'packaging', 'plastic'],
    paper: ['paper', 'cardboard', 'newspaper', 'magazine', 'box'],
    metal: ['can', 'metal', 'aluminum', 'steel', 'tin'],
    glass: ['bottle', 'jar', 'glass', 'container'],
    organic: ['food', 'vegetable', 'fruit', 'compost', 'organic'],
    ewaste: ['electronic', 'battery', 'phone', 'laptop', 'cable', 'charger'],
    hazardous: ['chemical', 'battery', 'medicine', 'paint', 'aerosol'],
    other: ['other', 'unknown', 'miscellaneous']
  };

  async classifyWasteFromImage(imageUri: string): Promise<{ category: string; confidence: number }> {
    try {
      // In real app, this would send the image to an ML model or API
      // For demo purposes, we'll simulate AI processing
      
      // Read image file (simulate processing)
      const fileInfo = await FileSystem.getInfoAsync(imageUri);
      if (!fileInfo.exists) {
        throw new Error('Image file not found');
      }

      // Simulate AI processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock classification based on random selection
      const randomCategory = this.wasteCategories[
        Math.floor(Math.random() * this.wasteCategories.length)
      ];
      
      const confidence = Math.random() * 0.5 + 0.5; // 50-100% confidence

      return {
        category: randomCategory,
        confidence: parseFloat(confidence.toFixed(2))
      };
    } catch (error) {
      console.error('Error classifying waste:', error);
      throw new Error('Failed to classify waste image');
    }
  }

  async classifyWasteFromText(description: string): Promise<{ category: string; confidence: number }> {
    try {
      const lowerDescription = description.toLowerCase();
      let bestMatch = 'other';
      let highestScore = 0;

      // Score each category based on keyword matches
      for (const [category, keywords] of Object.entries(this.categoryKeywords)) {
        let score = 0;
        for (const keyword of keywords) {
          if (lowerDescription.includes(keyword)) {
            score += 1;
          }
        }
        
        if (score > highestScore) {
          highestScore = score;
          bestMatch = category;
        }
      }

      const confidence = highestScore > 0 ? 
        Math.min(0.3 + (highestScore * 0.1), 0.9) : 0.5;

      return {
        category: bestMatch,
        confidence: parseFloat(confidence.toFixed(2))
      };
    } catch (error) {
      console.error('Error classifying waste from text:', error);
      return {
        category: 'other',
        confidence: 0.5
      };
    }
  }

  getCategoryInfo(category: string) {
    const categoryInfo: { [key: string]: { name: string; icon: string; color: string; tips: string[] } } = {
      plastic: {
        name: 'Plastic',
        icon: 'bottle-soda',
        color: '#2196F3',
        tips: [
          'Rinse containers before recycling',
          'Remove caps and labels',
          'Check local recycling guidelines',
          'Avoid single-use plastics when possible'
        ]
      },
      paper: {
        name: 'Paper',
        icon: 'file-document',
        color: '#795548',
        tips: [
          'Keep paper dry and clean',
          'Remove any plastic wrapping',
          'Flatten cardboard boxes',
          'Recycle newspapers and magazines'
        ]
      },
      metal: {
        name: 'Metal',
        icon: 'hammer',
        color: '#FF9800',
        tips: [
          'Rinse cans before recycling',
          'Separate different metal types',
          'Check for local scrap metal recycling',
          'Remove any food residue'
        ]
      },
      glass: {
        name: 'Glass',
        icon: 'glass-mug',
        color: '#009688',
        tips: [
          'Rinse glass containers',
          'Separate by color if required',
          'Handle broken glass carefully',
          'Check if lids can be recycled'
        ]
      },
      organic: {
        name: 'Organic Waste',
        icon: 'leaf',
        color: '#4CAF50',
        tips: [
          'Compost food scraps',
          'Avoid mixing with plastic',
          'Use compostable bags',
          'Turn compost regularly'
        ]
      },
      ewaste: {
        name: 'E-Waste',
        icon: 'laptop',
        color: '#607D8B',
        tips: [
          'Find certified e-waste recyclers',
          'Remove batteries if possible',
          'Wipe personal data from devices',
          'Donate working electronics'
        ]
      },
      hazardous: {
        name: 'Hazardous Waste',
        icon: 'alert-circle',
        color: '#F44336',
        tips: [
          'Handle with care',
          'Use designated drop-off locations',
          'Never mix with regular trash',
          'Follow local disposal guidelines'
        ]
      },
      other: {
        name: 'Other Waste',
        icon: 'help-circle',
        color: '#9E9E9E',
        tips: [
          'Check local recycling guidelines',
          'When in doubt, throw it out',
          'Reduce waste generation',
          'Consider reuse options'
        ]
      }
    };

    return categoryInfo[category] || categoryInfo.other;
  }

  async getDisposalGuidelines(category: string, location: string) {
    // In real app, this would fetch from a database or API
    const guidelines: { [key: string]: string } = {
      plastic: 'Place in blue recycling bin. Rinse containers first.',
      paper: 'Place in green recycling bin. Keep dry and clean.',
      metal: 'Place in blue recycling bin. Rinse cans first.',
      glass: 'Place in designated glass recycling bin.',
      organic: 'Compost or use green waste bin.',
      ewaste: 'Take to certified e-waste recycling center.',
      hazardous: 'Take to hazardous waste collection facility.',
      other: 'Dispose in regular trash bin.'
    };

    return guidelines[category] || guidelines.other;
  }
}

export const aiWasteClassifier = new AIWasteClassifier();