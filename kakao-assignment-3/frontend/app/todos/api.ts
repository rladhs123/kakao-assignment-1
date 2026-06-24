import "server-only";

import { headers } from "next/headers";

export type Todo = {
  id: number;
  title: string;
  completed: boolean;
};

export type TodoFilter = "all" | "active" | "completed";

export type TodoQuery = {
  filter?: TodoFilter;
  search?: string;
};

function getApiUrl() {
  if (!process.env.API_URL) {
    throw new Error("API_URL 환경변수가 설정되지 않았습니다.");
  }

  return process.env.API_URL;
}

export async function getTodos({ filter = "all", search = "" }: TodoQuery = {}): Promise<Todo[]> {
  const params = new URLSearchParams();
  const path = search ? "/todos/search" : "/todos";

  if (filter !== "all") params.set("filter", filter);
  if (search) params.set("search", search);

  const query = params.toString();
  const response = await fetch(`${getApiUrl()}${path}${query ? `?${query}` : ""}`, {
    cache: "no-store",
  });

  if (!response.ok) throw new Error("Todo 목록을 불러오지 못했습니다.");
  return response.json();
}

export async function requestTodo(path: string, init: RequestInit): Promise<void> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "http";
  const appUrl = host ? `${protocol}://${host}` : process.env.APP_URL;

  if (!appUrl) {
    throw new Error("APP_URL 환경변수가 설정되지 않았습니다.");
  }

  const response = await fetch(`${appUrl}${path}`, init);

  if (!response.ok) throw new Error("Todo 요청을 처리하지 못했습니다.");
}
