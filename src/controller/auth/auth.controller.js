import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import { createUser, getUserById, getUserByUsername, resetUserPassword } from '../../model/auth/auth.model.js';
import nodemailer from 'nodemailer';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret'; // Fallback for testing

// First, modify the handle_email function to accept parameters and return a promise
const handle_email = async (emailId, hrmsNo, password) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const mail_options = {
        from: process.env.EMAIL_USER,
        to: emailId,
        subject: '🎉 Welcome to Rayat Kutumb Kalyan Yojana – Your Account is Ready!',
        html: `
        <div style="font-family: Arial, sans-serif; font-size: 16px; color: #333;">
            <h2 style="color: #0066cc;">Welcome to Rayat Kutumb Kalyan Yojana!</h2>
            <p>Dear User,</p>
            
            <p>🎉 <strong>Congratulations!</strong> Your account has been <strong>successfully created</strong> under the <strong>Rayat Kutumb Kalyan Yojana</strong> initiative.</p>
            
            <p><strong>Please find your login credentials below:</strong></p>
            <ul style="list-style: none; padding-left: 0;">
                <li><strong>👤 Username:</strong> ${hrmsNo}</li>
                <li><strong>🔐 Password:</strong> ${password}</li>
            </ul>

            <p style="color: #cc0000;"><strong>⚠️ You can change your password after your first login for security purposes.</strong></p>

            <p>If you have any questions or need assistance, feel free to contact our support team.</p>

            <p>Welcome to the <strong>Rayat Kutumb Kalyan Yojana</strong> family!</p>

            <p style="margin-top: 30px;">
                Best regards,<br>
                <strong>Rayat Kutumb Kalyan Yojana Team</strong>
            </p>
        </div>
    `
    };



    try {
        const info = await transporter.sendMail(mail_options);
        console.log('Email sent successfully:', info.response);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
}

// ===========================
// Register Controller
// ===========================

const registerUser = async (req, res) => {
    const {
        emailId,
        password,
        hrmsNo,
        branchName,
        branchRegionName,
        mobileNo,
        role = 'user'
    } = req.body;

    try {
        // Create user in database
        const user = await createUser({
            emailId,
            password,
            hrmsNo,
            branchName,
            branchRegionName,
            mobileNo,
            role
        });

        // Send registration email
        try {
            await handle_email(emailId, hrmsNo, password);
        } catch (emailError) {
            console.error('Failed to send registration email:', emailError);
            // Continue with registration response even if email fails
        }

        return res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                hrmsNo: user.hrmsNo,
                emailId,
                branchName,
                role
            }
        });

    } catch (error) {
        console.error('Registration error:', error);

        if (error.message.includes('already exists')) {
            return res.status(409).json({
                success: false,
                message: error.message
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Registration failed',
            error: error.message
        });
    }
};

// ===========================
// Login Controller
// ===========================
const LoginUser = async (req, res) => {
    const { hrmsNo, password } = req.body;

    try {
        // Fetch user by hrmsNo
        const user = await getUserByUsername(hrmsNo);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, hrmsNo: user.hrmsNo, role: user.role },
            JWT_SECRET,
        );

        res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                hrmsNo: user.hrmsNo,
                emailId: user.emailId,
                branchName: user.branchName,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Login failed', error: error.message });
    }
}
// ===========================
// Reset Password Controller
// ===========================
const resetPassword = async (req, res) => {
    try {
        const { Email_ID, password } = req.body;

        // Input validation
        if (!Email_ID || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email ID and password are required'
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(Email_ID)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email format'
            });
        }

        // Validate password length
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long'
            });
        }

        const result = await resetUserPassword(Email_ID, password);
        
        res.status(200).json({
            success: true,
            message: 'Password reset successfully',
            result
        });
    } catch (error) {
        console.error('Password reset error:', error);
        
        if (error.message === "User not found with this email") {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }

        res.status(500).json({
            success: false,
            message: 'Password reset failed',
            error: error.message
        });
    }
};

// ===========================
// Get User Details Controller
// ===========================
const getUserDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await getUserByUsername(id); // Assuming `getUserByUsername` fetches user details by ID
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ user });
    } catch (error) {
        console.error('Error fetching user details:', error);
        res.status(500).json({ message: 'Failed to fetch user details', error: error.message });
    }
};


export { registerUser, LoginUser, resetPassword, getUserDetails };