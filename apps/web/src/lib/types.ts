import { User, Project, API_ENDPOINTS } from "@aiprojectteam/shared";

export type UserWithProjects = User & {
  projects: Project[];
};

export const apiClient = {
  async getUser(id: string): Promise<User> {
    const response = await fetch(`${API_ENDPOINTS.USERS}/${id}`);
    return response.json();
  },

  async getProjects(): Promise<Project[]> {
    const response = await fetch(API_ENDPOINTS.PROJECTS);
    return response.json();
  },
};
