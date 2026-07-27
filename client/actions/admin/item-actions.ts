"use server"

import apiClient from "@/lib/api-client";

export async function handleReportLostItem(formData: FormData) {
  try {
    const res = await apiClient("/items/report-lost", {
      method: "POST",
      body: formData,
      isFormData: true,
      cache: "no-store",
    });

    if (!res?.status) {
      return {
        status: false,
        error: res?.message || "Failed to report lost item",
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

export async function handleGetMyStats() {
  try {
    const res = await apiClient("/items/my-stats", {
      method: "GET",
      cache: "no-store",
    });

    if (!res?.status) {
      return {
        status: false,
        error: res?.message || "Failed to fetch stats",
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

export async function handleGetMyItems() {
  try {
    const res = await apiClient("/items/my-items", {
      method: "GET",
      cache: "no-store",
    });

    if (!res?.status) {
      return {
        status: false,
        error: res?.message || "Failed to fetch items",
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

export async function handleReportFoundItem(formData: FormData) {
  try {
    const res = await apiClient("/items/report-found", {
      method: "POST",
      body: formData,
      isFormData: true,
      cache: "no-store",
    });

    if (!res?.status) {
      return {
        status: false,
        error: res?.message || "Failed to report found item",
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

export async function handleGetAllItems() {
  try {
    const res = await apiClient("/items/all", {
      method: "GET",
      cache: "no-store",
    });

    if (!res?.status) {
      return {
        status: false,
        error: res?.message || "Failed to fetch items",
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

export async function handleGetAdminStats() {
  try {
    const res = await apiClient("/items/admin/stats", {
      method: "GET",
      cache: "no-store",
    });

    if (!res?.status) {
      return {
        status: false,
        error: res?.message || "Failed to fetch stats",
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

export async function handleVerifyOwner(foundItemId: string, lostItemId?: string, score?: number) {
  try {
    const res = await apiClient(`/items/found/${foundItemId}/verify-owner`, {
      method: "POST",
      body: { lostItemId, score },
      cache: "no-store",
    });

    if (!res?.status) {
      return {
        status: false,
        error: res?.message || "Failed to verify owner",
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

export async function handleCheckOwnerMatch(foundItemId: string) {
  try {
    const res = await apiClient(`/items/found/${foundItemId}/check-match`, {
      method: "GET",
      cache: "no-store",
    });

    if (!res?.status) {
      return {
        status: false,
        error: res?.message || "Failed to retrieve match preview",
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

export async function handleGetGlobalStats() {
  try {
    const res = await apiClient("/items/global-stats", {
      method: "GET",
      cache: "no-store",
    });

    if (!res?.status) {
      return {
        status: false,
        error: res?.message || "Failed to fetch global stats",
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

export async function handleForgotPassword(email: string) {
  try {
    const res = await apiClient("/auth/forgot-password", {
      method: "POST",
      body: { email },
      cache: "no-store",
    });

    if (!res?.status) {
      return {
        status: false,
        error: res?.message || "Failed to request password reset OTP",
      };
    }

    return {
      status: true,
      data: res.data,
      message: res.message,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred!";
    return { status: false, error: errorMessage };
  }
}

export async function handleResetPassword(email: string, otp: string, newPassword: string) {
  try {
    const res = await apiClient("/auth/reset-password", {
      method: "POST",
      body: { email, otp, newPassword },
      cache: "no-store",
    });

    if (!res?.status) {
      return {
        status: false,
        error: res?.message || "Failed to reset password",
      };
    }

    return {
      status: true,
      data: res.data,
      message: res.message,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred!";
    return { status: false, error: errorMessage };
  }
}

