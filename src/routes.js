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
import DeliveryIssuesController from './app/controllers/DeliveryIssuesController';

import authMiddleware from './app/middlewares/auth';
import authAdminMiddleware from './app/middlewares/authAdmin';

const routes = new Router();
const upload = multer(multerConfig);

// Non-authenticated routes
routes.post('/users', UserController.store);
routes.post('/sessions', SessionController.store);

routes.get('/couriers/:id', CourierController.show);
routes.get('/couriers/:id/deliveredorders', DeliveredOrdersController.index);
routes.get('/couriers/:id/activeorders', ActiveOrdersController.index);
routes.put(
  '/couriers/:courierId/activeorders/:orderId',
  ActiveOrdersController.update
);

routes.get('/orders/:id/issues', DeliveryIssuesController.show);
routes.post('/orders/:id/issues', DeliveryIssuesController.store);
routes.delete('/orders/:id/cancel-delivery', DeliveryIssuesController.delete);

routes.post('/files', upload.single('file'), FileController.store);

// Authenticated routes
routes.use(authMiddleware);

routes.put('/users', UserController.update);

// Admin authenticated routes
routes.use(authAdminMiddleware);
routes.get('/recipients', RecipientController.index);
routes.post('/recipients', RecipientController.store);
routes.put('/recipients/:id', RecipientController.update);
routes.delete('/recipients/:id', RecipientController.delete);

routes.get('/couriers', CourierController.index);
routes.post('/couriers', CourierController.store);
routes.put('/couriers/:id', CourierController.update);
routes.delete('/couriers/:id', CourierController.delete);

routes.get('/orders', OrderController.index);
routes.post('/orders', OrderController.store);
routes.put('/orders/:id', OrderController.update);
routes.delete('/orders/:id', OrderController.delete);

export default routes;
