export class ApiClientError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
  }
}

interface ErrorShape {
  error?: string;
}

export async function requestJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, init);

  let data: (T & ErrorShape) | null = null;
  try {
    data = (await res.json()) as T & ErrorShape;
  } catch {
    data = null;
  }

  if (!res.ok) {
    throw new ApiClientError(data?.error ?? "Request failed", res.status);
  }

  return (data ?? ({} as T));
}
