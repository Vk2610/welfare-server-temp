import express from 'express';
import cors from 'cors';
import { createAllTables } from './src/model/user/welfareForm.model.js';
import { createWelfareDocsTable } from './src/model/user/welfareDocs.model.js';
import userRoute from './src/routes/user/user.route.js';
import authRoutes from './src/routes/auth/auth.routes.js';
import userProfileRoutes from './src/routes/user/userProfile.routes.js';


const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// authorization routes
app.use('/auth', authRoutes);
app.use('/user', userRoute);
app.use('/profile', userProfileRoutes);

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

// Import and check database connection
import { checkConnection } from './src/config/db.config.js';

// Execute the function when this file runs
createAllTables();
createWelfareDocsTable();
checkConnection();
