import jwt from 'jsonwebtoken';
import { User } from '../models/user';

const JWT_SECRET = process.env.JWT_SECRET;

export const auth = async (req, res, next) => {
    try{
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if(!token){
            throw new Error('No authentication token provided');
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findOne({_id: decoded.userId, is_active: true });

        if(!user){
            throw new Error('User not found');
        }

        req.user = user;
        req.token = token;
        next();
    } catch (error){
        res.status(401).json({error: 'Authentication failed. Please log in again.', error});
    }
};

//role-based authentication middleware
export const authorize = (...roles) => {
    return (req, res, next) => {
        if(!roles.includes(req.user.user_type)) {
            return res.status(403).json({
                error: 'Unauthorized access. You do not have the required permissions'
            });
        }
        next();
    };
};