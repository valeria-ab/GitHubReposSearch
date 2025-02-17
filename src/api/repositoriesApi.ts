import { Repo } from "ui/GitHubReposSearch";
import { instance } from "./instance";

export const repositoriesApi = {
  getRepositories(payload: {
    username: string;
    perPage: number;
    page: number;
  }) {
    const { page, perPage, username } = payload;
    return instance.get<Repo[]>(
      `users/${username}/repos?per_page=${perPage}&page=${page}`
    );
  },
};
