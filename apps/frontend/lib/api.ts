import axios from 'axios';

const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
const API_URL = rawApiUrl.endsWith('/api/v1')
  ? rawApiUrl
  : `${rawApiUrl.replace(/\/$/, '')}/api/v1`;

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('finflow_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('finflow_refresh_token');
        if (refreshToken) {
          const res = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
          const newAccessToken = res.data.accessToken;
          const newRefreshToken = res.data.refreshToken;

          localStorage.setItem('finflow_access_token', newAccessToken);
          localStorage.setItem('finflow_refresh_token', newRefreshToken);

          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return axios(originalRequest);
        }
      } catch (err) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('finflow_access_token');
          localStorage.removeItem('finflow_refresh_token');
        }
      }
    }
    return Promise.reject(error);
  },
);

export const DEFAULT_COMPANY_ID = 'c0000000-0000-0000-0000-000000000001';

export async function getActiveCompanyId(): Promise<string> {
  if (typeof window === 'undefined') return DEFAULT_COMPANY_ID;
  let compId = localStorage.getItem('finflow_company_id');
  if (compId && compId !== 'undefined' && compId !== 'null' && compId.length > 5) {
    return compId;
  }
  try {
    const res = await api.get('/auth/me');
    if (res.data?.user?.company?.id) {
      compId = res.data.user.company.id;
      localStorage.setItem('finflow_company_id', compId!);
      if (res.data.user.company.activeFinancialYearId) {
        localStorage.setItem(
          'finflow_financial_year_id',
          res.data.user.company.activeFinancialYearId,
        );
      }
      return compId!;
    }
  } catch (e) {
    // fallback
  }
  localStorage.setItem('finflow_company_id', DEFAULT_COMPANY_ID);
  return DEFAULT_COMPANY_ID;
}

export async function getActiveFinancialYearId(companyId?: string): Promise<string> {
  if (typeof window === 'undefined') return '';
  let fyId = localStorage.getItem('finflow_financial_year_id');
  if (fyId && fyId !== 'undefined' && fyId !== 'null' && fyId.length > 5) {
    return fyId;
  }
  const compId = companyId || (await getActiveCompanyId());
  try {
    const res = await api.get('/financial-years', { params: { companyId: compId } });
    if (res.data && res.data.length > 0) {
      const cur = res.data.find((f: any) => f.isCurrent) || res.data[0];
      localStorage.setItem('finflow_financial_year_id', cur.id);
      return cur.id;
    }
  } catch (e) {
    // fallback
  }
  return '';
}
