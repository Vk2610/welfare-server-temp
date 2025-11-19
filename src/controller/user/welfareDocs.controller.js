import { insertWelfareDocsIntoDB, getWelfareDocsById } from '../../model/user/welfareDocs.model.js';
import cloudinary from '../../config/cloudinary.config.js';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';

// Configure multer for memory storage (files will be uploaded to Cloudinary)
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only images, PDF, and Word documents are allowed.'));
        }
    }
});

export const uploadWelfareDocs = async (req, res) => {
    try {
        const { userId, formId, docs } = req.body;

        if (!userId || !formId || docs.length < 4) {
            return res.status(400).json({ message: 'userId and formId are required' });
        }

        let uploadedDocsPath = { 'discharge_certificate': "", 'doctor_prescription': "", 'medicine_bills': "", 'diagnostic_reports': "", 'otherDoc1': "", 'otherDoc2': "", 'otherDoc3': "", 'otherDoc4': "", 'otherDoc5': "" };

        const folderPath = `welfare-docs/${userId}/${formId}`;


        for (const element in docs) {
            const file = element.file;
            const name = element.name;

            try {
                // Upload to Cloudinary with dynamic path
                const result = await new Promise((resolve, reject) => {
                    cloudinary.uploader.upload_stream(
                        {
                            folder: folderPath,
                            public_id: `${name}`,
                            resource_type: 'auto'
                        },
                        (error, result) => {
                            if (error) reject(error);
                            else resolve(result);
                        }
                    ).end(file.buffer);
                });

                uploadedDocsPath[name] = result.secure_url;
            } catch (uploadError) {
                console.error(`Error uploading ${file}:`, uploadError);
                uploadedDocsPath[field] = null;
            }
        }

        // Insert into database
        await insertWelfareDocsIntoDB(uploadedDocsPath, userId);

        res.status(200).json({
            message: 'Welfare documents uploaded successfully'
        });
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

export const uploadWelfareDocsOnCloud = async (req, res, next) => {
    try {
        const { userId, formId, files } = req.body;

        if (!userId || !formId) {
            return res.status(400).json({ message: 'userId and formId are required' });
        }

        const uploadedDocs = {};
        const documentFields = ['discharge_certificate', 'doctor_prescription', 'medicine_bills', 'diagnostic_reports', 'otherDoc1', 'otherDoc2', 'otherDoc3', 'otherDoc4', 'otherDoc5'];

        // Process each document field
        for (const field of documentFields) {
            if (req.files && req.files[field]) {
                const file = req.files[field];
                const uniqueId = uuidv4();
                const folderPath = `welfare-docs/${userId}/${formId}`;

                try {
                    // Upload to Cloudinary with dynamic path
                    const result = await new Promise((resolve, reject) => {
                        cloudinary.uploader.upload_stream(
                            {
                                folder: folderPath,
                                public_id: `${field}_${uniqueId}`,
                                resource_type: 'auto'
                            },
                            (error, result) => {
                                if (error) reject(error);
                                else resolve(result);
                            }
                        ).end(file.buffer);
                    });

                    uploadedDocs[field] = result.secure_url;
                } catch (uploadError) {
                    console.error(`Error uploading ${field}:`, uploadError);
                    uploadedDocs[field] = null;
                }
            }
        }

        return res.status(200).json({
            message: 'Welfare documents uploaded successfully to Cloudinary',
            uploadedDocs: uploadedDocs
        });
    } catch (error) {
        console.error('Error uploading welfare documents to Cloudinary:', error);
        return res.status(500).json({ message: 'Failed to upload welfare documents to Cloudinary' });
    }
};

// Export multer upload middleware
export const uploadMiddleware = upload.fields([
    { name: 'discharge_certificate', maxCount: 1 },
    { name: 'doctor_prescription', maxCount: 1 },
    { name: 'medicine_bills', maxCount: 1 },
    { name: 'diagnostic_reports', maxCount: 1 },
    { name: 'otherDoc1', maxCount: 1 },
    { name: 'otherDoc2', maxCount: 1 },
    { name: 'otherDoc3', maxCount: 1 },
    { name: 'otherDoc4', maxCount: 1 },
    { name: 'otherDoc5', maxCount: 1 }
]);