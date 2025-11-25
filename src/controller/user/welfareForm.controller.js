import { getAllForms, getAllFormsOfUser, getUsers, insertWelfareFormData, updateApprAmt, updateStatus } from '../../model/user/welfareForm.model.js';

export const submitWelfareForm = async (req, res) => {
    try {
        await insertWelfareFormData(req, res);
    }
    catch (error) {
        console.error('Error submitting welfare form:', error);
    }
};

export const updateFormStatus = async (req, res) => {
    try {
        const { id, status } = req.body;
        await updateStatus(id, status);
        return res.status(200).json({ message: 'Form Status updated successfully' });
    } catch (error) {
        console.error('Error updating form: ', error);
        return res.status(500).json({ message: 'Failed to update form status' });
    }
}

export const updateFormApprovalAmt = async (req, res) => {
    try {
        const { id, amt } = req.body;
        await updateApprAmt(id, amt);
        return res.status(200).json({ message: 'Form approval amount updated successfully' });
    } catch (error) {
        console.error('Error updating form approval amount: ', error);
        return res.status(500).json({ message: 'Failed to update form approval amount' });
    }
}

export const getForms = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        console.log(`page : ${page}, limit: ${limit}`);
        const forms = await getAllForms({page, limit});
        return res.status(200).json({ message: 'Forms Retrieved Successfully', forms: forms })
    } catch (error) {
        console.error('Error retrieving forms: ', error);
        return res.status(500).json({ message: 'Failed to retrieve forms' });
    }
}

export const getFormsOfUser = async (req, res) => {
    try {
        const { hrmsNo } = req.query;
        const forms = await getAllFormsOfUser(hrmsNo);
        return res.status(200).json({ message: 'Forms Retrieved Successfully', forms: forms })
    } catch (error) {
        console.error('Error retrieving forms: ', error);
        return res.status(500).json({ message: 'Failed to retrieve forms' });
    }
}

export const getUsersController = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '' } = req.query;
        console.log(`search = ${search}`);
        const result = await getUsers({ page, limit, search });
        return res.status(200).json({ message: 'Users fetched successfully', users: result });
    } catch (error) {
        console.error('Error fetching users:', error);
        return res.status(500).json({ message: 'Failed to fetch users' });
    }
}