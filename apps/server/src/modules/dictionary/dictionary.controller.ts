import type { NextFunction, Request, Response } from 'express';
import { dictionarySchema } from './dictionary.model.js';
import { dictionaryService } from './dictionary.service.js';

export const dictionaryController = {
  getAll: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await dictionaryService.getAll();
      res.json(data);
    } catch (error) {
      next(error);
    }
  },

  getById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await dictionaryService.getById(Number(req.params.id));
      res.json(data);
    } catch (error) {
      next(error);
    }
  },

  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const payload = dictionarySchema.parse(req.body);
      const data = await dictionaryService.create(payload);
      res.status(201).json(data);
    } catch (error) {
      next(error);
    }
  },

  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const payload = dictionarySchema.parse(req.body);
      const data = await dictionaryService.update(Number(req.params.id), payload);
      res.json(data);
    } catch (error) {
      next(error);
    }
  },

  delete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await dictionaryService.delete(Number(req.params.id));
      res.json(data);
    } catch (error) {
      next(error);
    }
  },
};