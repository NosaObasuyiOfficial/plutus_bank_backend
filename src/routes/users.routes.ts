import {userSignup, userLogin, forgotPassword} from '../controllers/controller'

import { Router} from 'express';
import {db} from '../config/index'

const router = Router();

router.post('/signup', userSignup);
router.post('/login', userLogin);
router.put('/update', forgotPassword)

export default router