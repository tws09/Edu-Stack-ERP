import { Router } from 'express';
import { authenticate } from '../middleware/auth/authenticate';
import { authorize } from '../middleware/rbac/authorize';
import {
  listTopics,
  createTopic,
  createTopicValidators,
  updateTopic,
  deleteTopic,
} from '../controllers/topicController';

const router = Router();
router.use(authenticate);

router.get('/', authorize('academic_intelligence', 'read'), listTopics);
router.post('/', authorize('academic_intelligence', 'create'), createTopicValidators, createTopic);
router.put('/:id', authorize('academic_intelligence', 'update'), updateTopic);
router.delete('/:id', authorize('academic_intelligence', 'delete'), deleteTopic);

export default router;
