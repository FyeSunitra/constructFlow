import axios, { type AxiosRequestConfig } from "axios";
import { useAccessToken } from "../utils/useAuthStorage";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const header = (isFormData = false) => {
  const token = useAccessToken();

  return {
    Authorization: token ? `Bearer ${token}` : "",
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
  };
};

const request = async (config: AxiosRequestConfig) => {
  return axios({
    baseURL: BASE_URL,
    ...config,
  })
    .then(handleSuccess)
    .catch(handleError);
};

const get = async (url: string, params = {}) =>
  request({
    method: "GET",
    url,
    params,
    headers: header(),
  });

const post = async (url: string, data: any, isFormData = false) =>
  request({
    method: "POST",
    url,
    data,
    headers: header(isFormData),
  });

const patch = async (url: string, data: any, isFormData = false) =>
  request({
    method: "PATCH",
    url,
    data,
    headers: header(isFormData),
  });

const put = async (url: string, data: any, isFormData = false) =>
  request({
    method: "PUT",
    url,
    data,
    headers: header(isFormData),
  });

const del = async (url: string, data?: any) =>
  request({
    method: "DELETE",
    url,
    data,
    headers: header(),
  });

function handleSuccess(res: any) {
  if (res.status !== 200 && res.status !== 201) {
    throw res;
  }
  return res.data ?? res;
}

function handleError(error: any) {
  if (error?.response?.status === 401) {
    localStorage.removeItem("token");
    window.location.href = "/login";
  }

  return Promise.reject(
    error?.response?.data || error?.message || "System Error",
  );
}
export const http = {
  get,
  post,
  patch,
  put,
  del,
};
