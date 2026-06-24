"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getTodos as fetchTodos, requestTodo } from "./todos/api";
import type { TodoQuery } from "./todos/api";

export async function getTodos(query?: TodoQuery) {
  return fetchTodos(query);
}

function getTitle(formData: FormData): string {
  const title = formData.get("title")?.toString().trim() ?? "";
  if (!title) throw new Error("Todo 제목을 입력해 주세요.");
  return title;
}

export async function createTodo(formData: FormData) {
  await requestTodo("/api/todos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: getTitle(formData), completed: false }),
  });
  revalidatePath("/todos");
  redirect("/todos");
}

export async function updateTodo(todoId: number, formData: FormData) {
  await requestTodo("/api/todos", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: todoId,
      title: getTitle(formData),
      completed: formData.get("completed") === "on",
    }),
  });
  revalidatePath("/todos");
  redirect("/todos");
}

export async function toggleTodo(todoId: number, title: string, completed: boolean) {
  await requestTodo("/api/todos", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: todoId,
      title,
      completed: !completed,
    }),
  });
  revalidatePath("/todos");
}

export async function deleteTodo(todoId: number) {
  await requestTodo(`/api/todos?id=${todoId}`, { method: "DELETE" });
  revalidatePath("/todos");
}
