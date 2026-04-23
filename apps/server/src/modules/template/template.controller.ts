import type { NextFunction, Request, Response } from 'express';
import { templateSchema } from './template.model.js';
import { templateService } from './template.service.js';

export const templateController = {
  getAll: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await templateService.getAll();
      res.json(data);
    } catch (error) {
      next(error);
    }
  },

  getById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await templateService.getById(Number(req.params.id));
      res.json(data);
    } catch (error) {
      next(error);
    }
  },

  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const payload = templateSchema.parse(req.body);
      const data = await templateService.create(payload);
      res.status(201).json(data);
    } catch (error) {
      next(error);
    }
  },

  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const payload = templateSchema.parse(req.body);
      const data = await templateService.update(Number(req.params.id), payload);
      res.json(data);
    } catch (error) {
      next(error);
    }
  },

  delete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await templateService.delete(Number(req.params.id));
      res.json(data);
    } catch (error) {
      next(error);
    }
  },
};