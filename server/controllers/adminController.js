import Setting from '../models/Setting.js';

const DEFAULT_SYSTEM_PROMPT = 
  'You are Rishav AI, a highly intelligent assistant. ' +
  'You are helpful, friendly, accurate, and concise. ' +
  'You assist in coding, interview preparation, learning, productivity, and daily tasks. ' +
  'Always respond clearly.';

// @desc    Get application settings (e.g. system personality prompt)
// @route   GET /api/admin/settings
// @access  Private (Registered users can view)
export const getSystemSettings = async (req, res) => {
  try {
    let promptSetting = await Setting.findOne({ key: 'systemInstruction' });
    
    if (!promptSetting) {
      // Seed default system prompt if it doesn't exist
      promptSetting = await Setting.create({
        key: 'systemInstruction',
        value: DEFAULT_SYSTEM_PROMPT,
        description: 'System instruction prompt for Rishav AI chatbot personality',
      });
    }

    res.status(200).json({
      success: true,
      systemInstruction: promptSetting.value,
    });
  } catch (error) {
    console.error('Get admin settings error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update system personality prompt
// @route   PUT /api/admin/settings
// @access  Private/Admin (Only admin role can edit)
export const updateSystemSettings = async (req, res) => {
  try {
    const { systemInstruction } = req.body;

    if (!systemInstruction || systemInstruction.trim() === '') {
      return res.status(400).json({ success: false, message: 'systemInstruction cannot be empty' });
    }

    let promptSetting = await Setting.findOne({ key: 'systemInstruction' });

    if (promptSetting) {
      promptSetting.value = systemInstruction;
      await promptSetting.save();
    } else {
      promptSetting = await Setting.create({
        key: 'systemInstruction',
        value: systemInstruction,
        description: 'System instruction prompt for Rishav AI chatbot personality',
      });
    }

    res.status(200).json({
      success: true,
      message: 'System prompt updated successfully',
      systemInstruction: promptSetting.value,
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
