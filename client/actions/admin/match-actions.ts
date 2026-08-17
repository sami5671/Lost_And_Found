"use server"

import apiClient from "@/lib/api-client";

export async function handleGetMatches() {
  try {
    const res = await apiClient("/items/matches", {
      method: "GET",
      cache: "no-store",
    });

    if (!res?.status) {
      return {
        status: false,
        error: res?.message || "Failed to fetch matches",
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

export async function handleApproveMatch(matchId: string) {
  try {
    const res = await apiClient(`/items/matches/${matchId}/approve`, {
      method: "PATCH",
      cache: "no-store",
    });

    if (!res?.status) {
      return {
        status: false,
        error: res?.message || "Failed to approve match",
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

export async function handleDismissMatch(matchId: string) {
  try {
    const res = await apiClient(`/items/matches/${matchId}/dismiss`, {
      method: "PATCH",
      cache: "no-store",
    });

    if (!res?.status) {
      return {
        status: false,
        error: res?.message || "Failed to dismiss match",
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

export async function handleClaimMatch(matchId: string) {
  try {
    const res = await apiClient(`/items/matches/${matchId}/claim`, {
      method: "PATCH",
      cache: "no-store",
    });

    if (!res?.status) {
      return {
        status: false,
        error: res?.message || "Failed to claim match",
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
