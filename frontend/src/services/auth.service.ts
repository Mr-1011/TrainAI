import apiClient from '@/lib/api-client';

export interface SignUpRequest {
  email: string;
  password: string;
}

export interface SignInRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  refresh_token: string;
  user_id: string;
  email: string;
}

export interface UserResponse {
  user_id: string;
  email: string;
}

class AuthService {
  private DEMO_EMAIL = 'demo@trainai.com';
  private DEMO_PASSWORD = 'demo';

  /**
   * Check if credentials are for demo account
   */
  private isDemoAccount(email: string, password: string): boolean {
    return email === this.DEMO_EMAIL && password === this.DEMO_PASSWORD;
  }

  /**
   * Create demo auth response
   */
  private createDemoAuthResponse(): AuthResponse {
    return {
      access_token: 'demo_access_token',
      token_type: 'bearer',
      refresh_token: 'demo_refresh_token',
      user_id: 'demo_user_id',
      email: this.DEMO_EMAIL,
    };
  }

  /**
   * Sign up a new user
   */
  async signUp(credentials: SignUpRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/signup', credentials);
    this.saveAuthData(response.data);
    return response.data;
  }

  /**
   * Sign in an existing user
   */
  async signIn(credentials: SignInRequest): Promise<AuthResponse> {
    // Handle demo account
    if (this.isDemoAccount(credentials.email, credentials.password)) {
      const demoResponse = this.createDemoAuthResponse();
      this.saveAuthData(demoResponse);
      return demoResponse;
    }

    const response = await apiClient.post<AuthResponse>('/auth/signin', credentials);
    this.saveAuthData(response.data);
    return response.data;
  }

  /**
   * Sign out the current user
   */
  async signOut(): Promise<void> {
    try {
      await apiClient.post('/auth/signout');
    } finally {
      this.clearAuthData();
    }
  }

  /**
   * Refresh the access token
   */
  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/refresh', {
      refresh_token: refreshToken,
    });
    this.saveAuthData(response.data);
    return response.data;
  }

  /**
   * Get current user info
   */
  async getCurrentUser(): Promise<UserResponse> {
    // Handle demo account
    const storedUser = this.getStoredUser();
    if (storedUser && storedUser.email === this.DEMO_EMAIL) {
      return storedUser;
    }

    const response = await apiClient.get<UserResponse>('/auth/me');
    return response.data;
  }

  /**
   * Save authentication data to localStorage
   */
  private saveAuthData(data: AuthResponse): void {
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
    localStorage.setItem('user', JSON.stringify({
      user_id: data.user_id,
      email: data.email,
    }));
  }

  /**
   * Clear authentication data from localStorage
   */
  private clearAuthData(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }

  /**
   * Check if currently logged in as demo user
   */
  isDemoUser(): boolean {
    const user = this.getStoredUser();
    return user?.email === this.DEMO_EMAIL;
  }

  /**
   * Get stored user data
   */
  getStoredUser(): UserResponse | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  /**
   * Get access token
   */
  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  /**
   * Get refresh token
   */
  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }
}

export const authService = new AuthService();
export default authService;
