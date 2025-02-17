import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import {
  clearRepos,
  fetchRepos,
  selectRepos,
  selectReposError,
  selectReposPage,
  selectReposPerPage,
  selectReposStatus,
  setReposPage,
} from "store";
import { useAppDispatch, useAppSelector, useDebounce } from "hooks";

export const GitHubReposSearch: React.FC = () => {
  const [username, setUsername] = useState<string>("");
  const observerRef = useRef<HTMLDivElement | null>(null);
  const dispatch = useAppDispatch();

  const page = useAppSelector(selectReposPage);
  const isFetching = useAppSelector(selectReposStatus) === "loading";
  const perPage = useAppSelector(selectReposPerPage);
  const repos = useAppSelector(selectRepos);
  const appError = useAppSelector(selectReposError);

  const hasMoreRepos = repos.length % perPage === 0 && repos.length !== 0;

  const onKeyUpHandler = useDebounce(() => {
    if (!!username.trim()) {
      page > 1 && dispatch(setReposPage({ page: 1 }));
      repos.length > 0 && dispatch(clearRepos());
      dispatch(fetchRepos(username));
    }
  }, 1000);

  useEffect(() => {
    if (page > 1) {
      dispatch(fetchRepos(username));
    }
  }, [page, dispatch]);

  useEffect(() => {
    if (!observerRef.current || !hasMoreRepos) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isFetching) {
          dispatch(setReposPage({ page: page + 1 }));
        }
      },
      { threshold: 1.0 }
    );

    observer.observe(observerRef.current);

    return () => observer.disconnect();
  }, [repos.length, isFetching, hasMoreRepos, page, dispatch]);

  const onChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  };

  return (
    <div className="max-w-2xl w-full mx-auto p-4 sm:p-6 lg:p-8 font-sans">
      <h1 className="text-lg sm:text-xl lg:text-2xl mb-3 font-semibold text-center">
        🔍 Поиск репозиториев GitHub
      </h1>

      <input
        type="text"
        placeholder="Введите имя пользователя"
        value={username}
        onChange={onChangeHandler}
        onKeyUp={onKeyUpHandler}
        className="w-full p-2 sm:p-3 border border-gray-300 rounded-md mb-2 text-sm sm:text-base"
      />

      {appError && (
        <p className="text-red-500 text-sm sm:text-base text-center mt-2">
          {appError}
        </p>
      )}

      <div>
        {repos.map((repo) => (
          <div
            key={repo.id}
            className="border border-gray-300 p-3 sm:p-4 mb-2 rounded-lg shadow-sm hover:shadow-md transition text-center"
          >
            <h3 className="mb-1 font-bold text-base sm:text-lg">
              <a
                href={repo.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {repo.name}
              </a>
            </h3>
            <p className="text-gray-700 text-sm sm:text-base">
              {repo.description || "Нет описания"}
            </p>
            <p className="text-sm sm:text-base">⭐️ {repo.stargazers_count}</p>
            <p className="text-xs sm:text-sm text-gray-500">
              {`Обновлено ${new Date(repo.pushed_at).toLocaleString()}`}
            </p>
          </div>
        ))}

        {hasMoreRepos && !isFetching && (
          <div ref={observerRef} className="h-2" />
        )}

        {isFetching && (
          <div className="flex justify-center items-center my-4">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>
    </div>
  );
};
