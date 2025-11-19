import { loginUser, resetPassword } from "../../model/auth/auth.model.js";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
// Controller function to handle user login
export const loginController = async (req, res) => {
    const { hrmsNo, password } = req.body;
    try {
        const user = await loginUser(hrmsNo, password);
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }
        const isMatched = bcrypt.compare(password, user.password);
        if (!isMatched) {
            return res.status(401).json({ message: 'Invalid HRMS Number or Password' });
        }
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
        );
        
        return res.status(200).json({ message: 'Login successful', token: token });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Controller function to handle password reset
export const resetPasswordController = async (req, res) => {
    const { hrmsNo, newPassword } = req.body;
    try {
        const isReset = await resetPassword(hrmsNo, newPassword);
        if (!isReset) {
            return res.status(400).json({ message: 'Password reset failed' });
        }
        res.status(200).json({ message: 'Password reset successful' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};