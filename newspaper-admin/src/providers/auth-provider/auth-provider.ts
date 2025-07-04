"use client";

import type {AuthProvider} from "@refinedev/core";
import {AuthHelper} from "@refinedev/strapi-v4";
import {axiosInstance} from "@utility/axios-instance";
import {API_URL, TOKEN_KEY} from "@utility/constants";
import Cookies from "js-cookie";

const strapiAuthHelper = AuthHelper(API_URL + "/api");

export const authProvider: AuthProvider = {
  login: async ({ email, password }) => {
    const { data, status } = await strapiAuthHelper.login(email, password);
    if (status === 200) {
      Cookies.set(TOKEN_KEY, data.jwt, {
        expires: 30, // 30 days
        path: "/",
      });

      // set header axios instance
      axiosInstance.defaults.headers.common = {
        Authorization: `Bearer ${data.jwt}`,
      };

      return {
        success: true,
        redirectTo: "/tasks",
      };
    }
    return {
      success: false,
      error: {
        message: "Login failed",
        name: "Invalid email or password",
      },
    };
  },
  logout: async () => {
    Cookies.remove(TOKEN_KEY, { path: "/" });
    return {
      success: true,
      redirectTo: "/login",
    };
  },
  check: async () => {
    const token = Cookies.get(TOKEN_KEY);
    if (token) {
      axiosInstance.defaults.headers.common = {
        Authorization: `Bearer ${token}`,
      };
      return {
        authenticated: true,
      };
    }

    return {
      authenticated: false,
      redirectTo: "/login",
    };
  },
  getPermissions: async () => {
    const token = Cookies.get(TOKEN_KEY);
    if (!token) {
      return null;
    }

    try {
      const { data } = await axiosInstance.get(API_URL + "/api/users/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          populate: "role", // tells Strapi to include the related role data
        },
      });

      console.log(data, "Fetched user with role");

      return data.role?.name;
    } catch (error) {
      console.error("Failed to fetch permissions", error);
      return null;
    }
  },
  getIdentity: async () => {
    const token = Cookies.get(TOKEN_KEY);
    if (!token) {
      return null;
    }

    const { data, status } = await strapiAuthHelper.me(token);
    if (status === 200) {
      const { id, username, email } = data;
      return {
        id,
        name: username,
        email,
      };
    }

    return null;
  },
  onError: async (error) => {
    if (error.response?.status === 401) {
      return {
        logout: true,
      };
    }

    return { error };
  },
};
