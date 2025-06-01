export interface Project {
    id: number;
    name: string;
    description: string;
    start_date: Date;
    end_date: Date;
    budget: number;
    company_id: number;
    status: ProjectStatus;
    created_at: Date;
    updated_at: Date;
}

export enum ProjectStatus {
    PLANNED = 'PLANNED',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    ON_HOLD = 'ON_HOLD',
    CANCELLED = 'CANCELLED'
}
