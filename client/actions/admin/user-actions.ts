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

export async function handleUpdateUser(userId: string, data: any) {
  try {
    const res = await apiClient(`/users/${userId}`, {
      method: "PATCH",
      body: data,
    });

    if (!res?.status) {
      return {
        status: false,
        error: res?.message || "Failed to update user",
      };
    }

    return {
      status: true,
      data: res.data?.user || res.data,
      message: res?.message || "User updated successfully",
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred!";
    return { status: false, error: errorMessage };
  }
}

export async function handleDeleteUser(userId: string) {
  try {
    const res = await apiClient(`/users/${userId}`, {
      method: "DELETE",
    });

    if (!res?.status) {
      return {
        status: false,
        error: res?.message || "Failed to toggle user account status",
      };
    }

    return {
      status: true,
      data: res.data?.user || res.data,
      message: res?.message || "User account status updated successfully",
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred!";
    return { status: false, error: errorMessage };
  }
}

