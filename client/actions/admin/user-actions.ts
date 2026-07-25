"use server"

import apiClient from "@/lib/api-client";

export async function handleGetAllUsers() {
  try {
    const res = await apiClient("/users/all", {
      method: "GET",
      cache: "no-store",
    });

    if (!res?.status) {
      return {
        status: false,
        error: res?.message || "Failed to fetch users",
      };
    }

    return {
      status: true,
      data: res.data,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred!";
    return { status: false, error: errorMessage };
  }
}
