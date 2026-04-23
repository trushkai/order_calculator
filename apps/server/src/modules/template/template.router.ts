import { Router } from 'express';
import { templateController } from './template.controller.js';

export const templateRouter = Router();

templateRouter.get('/', templateController.getAll);
templateRouter.get('/:id', templateController.getById);
templateRouter.post('/', templateController.create);
templateRouter.put('/:id', templateController.update);
templateRouter.delete('/:id', templateController.delete);