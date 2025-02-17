import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { repositoriesApi } from "api";
import axios from "axios";
import { AppDispatch, RootState } from "store";
import { Repo } from "ui/GitHubReposSearch";

export type RequestStatus = "idle" | "loading" | "succeeded" | "failed";

const initialState = {
  status: "idle" as RequestStatus,
  error: null as string | null,
  page: 1,
  perPage: 20,
  repos: [] as Repo[],
};

export const repositoriesSlice = createSlice({
  name: "repositories",
  initialState,
  reducers: (create) => ({
    setReposStatus: create.reducer<{ status: RequestStatus }>(
      (state, action) => {
        state.status = action.payload.status;
      }
    ),
    setReposError: create.reducer<{ error: string | null }>((state, action) => {
      state.error = action.payload.error;
    }),
    setReposPage: create.reducer<{ page: number }>((state, action) => {
      state.page = action.payload.page;
    }),
    setReposPerPage: create.reducer<{ perPage: number }>((state, action) => {
      state.perPage = action.payload.perPage;
    }),
    setRepos: create.reducer<{ repos: Repo[] }>((state, action) => {
      state.repos.push(...action.payload.repos);
    }),
    clearRepos: create.reducer((state) => {
      return { ...state, repos: [] };
    }),
    clearReposData: create.reducer(() => {
      return initialState;
    }),
  }),
  extraReducers: (builder) => {
    builder
      .addCase(fetchRepos.fulfilled, (state, action) => {
        state.repos.push(...action.payload.repos);
      })
      .addCase(fetchRepos.rejected, (state, action) => {
        let errorMessage = "Some error occurred";

        if (axios.isAxiosError(action.payload)) {
          errorMessage =
            action.payload.response?.data?.message ||
            action.payload?.message ||
            errorMessage;
        } else if (action.payload instanceof Error) {
          errorMessage = `Native error: ${action.payload.message}`;
        } else {
          errorMessage = JSON.stringify(action.payload);
        }
        state.error = errorMessage;
      });
  },

  selectors: {
    selectReposStatus: (state) => state.status,
    selectReposError: (state) => state.error,
    selectReposPage: (state) => state.page,
    selectReposPerPage: (state) => state.perPage,
    selectRepos: (state) => state.repos,
  },
});

export const {
  clearRepos,
  clearReposData,
  setRepos,
  setReposError,
  setReposPage,
  setReposPerPage,
  setReposStatus,
} = repositoriesSlice.actions;
export const {
  selectReposError,
  selectReposStatus,
  selectReposPage,
  selectReposPerPage,
  selectRepos,
} = repositoriesSlice.selectors;
export const repositoriesReducer = repositoriesSlice.reducer;

export const fetchRepos = createAsyncThunk<
  { repos: Repo[] },
  string,
  {
    state: RootState;
    dispatch: AppDispatch;
    rejectValue: unknown;
  }
>(`${repositoriesSlice.name}/fetchTasks`, async (username, thunkAPI) => {
  const { getState, dispatch, rejectWithValue } = thunkAPI;

  const { perPage, page, error } = getState().repositories;

  error && dispatch(setReposError({ error: null }));

  try {
    dispatch(setReposStatus({ status: "loading" }));
    const res = await repositoriesApi.getRepositories({
      username,
      perPage,
      page,
    });
    dispatch(setReposStatus({ status: "succeeded" }));
    return { repos: res.data };
  } catch (error) {
    dispatch(setReposStatus({ status: "failed" }));
    return rejectWithValue(error);
  }
});
