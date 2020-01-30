import { Router } from 'express';
import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import RecipientController from './app/controllers/RecipientController';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();

// Non-authenticated routes
routes.post('/users', UserController.store);
routes.post('/sessions', SessionController.store);

// Authenticated routes
routes.use(authMiddleware);
routes.put('/users', UserController.update);

routes.post('/recipients', RecipientController.store);

export default routes;
