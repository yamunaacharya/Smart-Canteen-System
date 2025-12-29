import api from './api';

export async function register(data) {
  const res = await api.post('/auth/register', data);
  const { token, user } = res.data;
  if (token) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }
  return { token, user };
}

export async function login(data) {
  const res = await api.post('/auth/login', data);
  const { token, user } = res.data;
  if (token) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }
  return { token, user };
}

export async function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

export async function me() {
  const res = await api.get('/auth/me');
  return res.data;
}
