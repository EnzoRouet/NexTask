const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
  token?: string,
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: { ...headers, ...options.headers },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Erreur API");
    }

    return await response.json();
  } catch (error) {
    console.error("[API Client Error]:", error);
    throw error;
  }
}
