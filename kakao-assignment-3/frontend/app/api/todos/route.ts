import { NextRequest, NextResponse } from "next/server";

function getApiUrl() {
  if (!process.env.API_URL) {
    throw new Error("API_URL 환경변수가 설정되지 않았습니다.");
  }

  return process.env.API_URL;
}

async function proxyToFastApi(path: string, init?: RequestInit) {
  const response = await fetch(`${getApiUrl()}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (response.status === 204) {
    return new NextResponse(null, { status: 204 });
  }

  const data = await response.json().catch(() => null);

  return NextResponse.json(data, { status: response.status });
}

export async function GET(request: NextRequest) {
  const params = new URLSearchParams();
  const filter = request.nextUrl.searchParams.get("filter");
  const search = request.nextUrl.searchParams.get("search");

  if (filter) params.set("filter", filter);
  if (search) params.set("search", search);

  const query = params.toString();
  const path = search ? "/todos/search" : "/todos";

  return proxyToFastApi(`${path}${query ? `?${query}` : ""}`, { cache: "no-store" });
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  return proxyToFastApi("/todos", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const { id, ...todo } = body;

  if (!Number.isInteger(id)) {
    return NextResponse.json({ detail: "Todo id is required." }, { status: 400 });
  }

  return proxyToFastApi(`/todos/${id}`, {
    method: "PUT",
    body: JSON.stringify(todo),
  });
}

export async function DELETE(request: NextRequest) {
  const id = Number(request.nextUrl.searchParams.get("id"));

  if (!Number.isInteger(id)) {
    return NextResponse.json({ detail: "Todo id is required." }, { status: 400 });
  }

  return proxyToFastApi(`/todos/${id}`, { method: "DELETE" });
}
