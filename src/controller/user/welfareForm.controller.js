import { insertWelfareFormData } from '../../model/user/welfareForm.model.js';

export const submitWelfareForm = async (req, res) => {
    try {
        await insertWelfareFormData(req, res);
        res.status(200).json({ message: 'Welfare form submitted successfully' });
    }
    catch (error) {
        console.error('Error submitting welfare form:', error);
        res.status(500).json({ message: 'Failed to submit welfare form' });
    }
};

        