import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';
import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import RecipientController from './app/controllers/RecipientController';
import FileController from './app/controllers/FileController';
import CourierController from './app/controllers/CourierController';

import authMiddleware from './app/middlewares/auth';
import authAdminMiddleware from './app/middlewares/authAdmin';

const routes = new Router();
const upload = multer(multerConfig);

// Non-authenticated routes
routes.post('/users', UserController.store);
routes.post('/sessions', SessionController.store);

// Authenticated routes
routes.use(authMiddleware);

routes.put('/users', UserController.update);

// Admin authenticated routes
routes.use(authAdminMiddleware);
routes.post('/recipients', RecipientController.store);

routes.get('/couriers', CourierController.index);
routes.post('/couriers', CourierController.store);
routes.put('/couriers/:id', CourierController.update);
routes.delete('/couriers/:id', CourierController.delete);

routes.post('/files', upload.single('file'), FileController.store);

export default routes;
