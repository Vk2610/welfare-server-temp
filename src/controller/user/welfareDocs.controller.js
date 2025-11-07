import { insertWelfareDocs, getWelfareDocsById } from '../../model/user/welfareDocs.model.js'

export const uploadWelfareDocs = async (req, res) => {
    try {
        const docs = req.body; // Assuming docs are sent in the request body
        await insertWelfareDocs(docs);
        res.status(200).json({ message: 'Welfare documents uploaded successfully' });
    } catch (error) {
        console.error('Error uploading welfare documents:', error);
        res.status(500).json({ message: 'Failed to upload welfare documents' });
    }
};

export const fetchWelfareDocs = async (req, res) => {
    try {
        const { id } = req.params; // Assuming id is sent as a URL parameter
        const docs = await getWelfareDocsById(id);
        res.status(200).json(docs);
    } catch (error) {
        console.error('Error fetching welfare documents:', error);
        res.status(500).json({ message: 'Failed to fetch welfare documents' });
    }
};
