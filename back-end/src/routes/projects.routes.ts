import express, { Router } from 'express';
import { ProjectsController } from '../controllers/projects.controller';

const router: Router = express.Router();
const projectController = new ProjectsController();

// Get all projects
router.get('/', (req, res) => projectController.getProjects(req, res));

// Get project by ID
router.get('/:id', (req, res) => projectController.getProjectById(req, res));

// Create project
router.post('/', (req, res) => projectController.createProject(req, res));

// Update project
router.put('/:id', (req, res) => projectController.updateProject(req, res));

// Delete project
router.delete('/:id', (req, res) => projectController.deleteProject(req, res));

export default router;
