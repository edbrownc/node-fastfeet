import { Router } from 'express';

import multer from 'multer';
import multerConfig from './config/multer';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import RecipientController from './app/controllers/RecipientController';
import FileController from './app/controllers/FileController';
import CourierController from './app/controllers/CourierController';
import OrderController from './app/controllers/OrderController';
import ActiveOrdersController from './app/controllers/ActiveOrdersController';
import DeliveredOrdersController from './app/controllers/DeliveredOrdersController';
import DeliveryProblemsController from './app/controllers/DeliveryProblemsController';

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

routes.get('/couriers/:id/activeorders', ActiveOrdersController.index);
routes.put(
  '/couriers/:courierId/activeorders/:orderId',
  ActiveOrdersController.update
);

routes.get('/couriers/:id/deliveredorders', DeliveredOrdersController.index);

routes.get('/orders/:id/problems', DeliveryProblemsController.index);
routes.post('/orders/:id/problems', DeliveryProblemsController.store);
routes.delete('/orders/:id/cancel-delivery', DeliveryProblemsController.delete);

// Admin authenticated routes
routes.use(authAdminMiddleware);
routes.post('/recipients', RecipientController.store);

routes.get('/couriers', CourierController.index);
routes.post('/couriers', CourierController.store);
routes.put('/couriers/:id', CourierController.update);
routes.delete('/couriers/:id', CourierController.delete);

routes.get('/orders', OrderController.index);
routes.post('/orders', OrderController.store);
routes.put('/orders/:id', OrderController.update);
routes.delete('/orders/:id', OrderController.delete);

routes.post('/files', upload.single('file'), FileController.store);

export default routes;
