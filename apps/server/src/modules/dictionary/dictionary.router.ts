import { Router } from 'express';
import { dictionaryController } from './dictionary.controller.js';

export const dictionaryRouter = Router();

dictionaryRouter.get('/', dictionaryController.getAll);
dictionaryRouter.get('/:id', dictionaryController.getById);
dictionaryRouter.post('/', dictionaryController.create);
dictionaryRouter.put('/:id', dictionaryController.update);
dictionaryRouter.delete('/:id', dictionaryController.delete);