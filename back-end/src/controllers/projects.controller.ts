import { Request, Response } from 'express';
import { ProjectsService } from '../services/projects.service';

export class ProjectsController {
    private projectsService: ProjectsService;

    constructor() {
        this.projectsService = new ProjectsService();
    }

    async getProjects(req: Request, res: Response): Promise<void> {
        try {
            const projects = await this.projectsService.getProjects(req);
            res.json(projects);
        } catch (error) {
            res.status(500).json({ error: (error as Error).message });
        }
    }

    async getProjectById(req: Request, res: Response): Promise<void> {
        try {
            const project = await this.projectsService.getProjectById(req);
            if (project) {
                res.json(project);
            } else {
                res.status(404).json({ message: 'Project not found' });
            }
        } catch (error) {
            res.status(500).json({ error: (error as Error).message });
        }
    }

    async createProject(req: Request, res: Response): Promise<void> {
        try {
            const newProject = await this.projectsService.createProject(req);
            res.status(201).json(newProject);
        } catch (error) {
            res.status(500).json({ error: (error as Error).message });
        }
    }

    async updateProject(req: Request, res: Response): Promise<void> {
        try {
            const updatedProject = await this.projectsService.updateProject(req);
            if (updatedProject) {
                res.json(updatedProject);
            } else {
                res.status(404).json({ message: 'Project not found' });
            }
        } catch (error) {
            res.status(500).json({ error: (error as Error).message });
        }
    }

    async deleteProject(req: Request, res: Response): Promise<void> {
        try {
            const deleted = await this.projectsService.deleteProject(req);
            if (deleted) {
                res.json({ message: 'Project deleted successfully' });
            } else {
                res.status(404).json({ message: 'Project not found' });
            }
        } catch (error) {
            res.status(500).json({ error: (error as Error).message });
        }
    }
}
