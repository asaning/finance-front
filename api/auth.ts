const API_BASE_URL = 'http://localhost:5001'; 

export const login = async (username: string, password: string) => {
  const response = await fetch(`${API_BASE_URL}/api/user/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'Login failed');
  }
  return result.token;
};

export const register = async (data: {
  username: string;
  email: string;
  password: string;
  captcha: string;
  captchaId: string;
  validationCode: string;
}) => {
  const response = await fetch(`${API_BASE_URL}/api/user/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'Registration failed');
  }
  return result.token;
};

export const getCaptcha = async () => {
  const response = await fetch(`${API_BASE_URL}/api/captcha`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'Failed to fetch captcha');
  }
  return { image: result.image, captchaId: result.captchaId };
};

export const sendVerificationCode = async (email: string) => {
  const response = await fetch(`${API_BASE_URL}/api/send-validation-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'Failed to send validation code');
  }
  return result;
};