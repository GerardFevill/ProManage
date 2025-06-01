export interface Profile {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    preferences: UserPreferences;
    created_at: Date;
    updated_at: Date;
}

export interface UserPreferences {
    theme: 'light' | 'dark';
    language: string;
    notifications: {
        email: boolean;
        push: boolean;
    };
    defaultCompanyId?: number;
    defaultCurrency: string;
}
