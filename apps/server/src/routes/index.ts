import { Router } from 'express';
import { templateRouter } from '../modules/template/template.router.js';
import { dictionaryRouter } from '../modules/dictionary/dictionary.router.js';

export const rootRouter = Router();

rootRouter.get('/health', (_req, res) => {
  res.json({ ok: true });
});

rootRouter.use('/templates', templateRouter);
rootRouter.use('/dictionaries', dictionaryRouter);
