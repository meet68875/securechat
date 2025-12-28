export async function apiClient(url, options = {}) {
  const defaultHeaders = {
    ...(options.body && { 'Content-Type': 'application/json' }),
  };

  const finalOptions = {
    credentials: 'include',
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  const response = await fetch(url, finalOptions);

  // 👇 IMPORTANT: allow login 401s to pass through
  if (response.status === 401 && !url.includes('/api/auth/login')) {
    console.warn(
      `API Client: Received 401 Unauthorized from ${url}. Forcing global logout.`
    );

    store.dispatch(logout());
    redirect('/(auth)/login');
  }

  return response;
}
