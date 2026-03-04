/**
 * Tests for lib/supabase.ts
 *
 * The module runs code at import time (env var validation, Platform branch,
 * createClient call), so each test uses jest.resetModules() + jest.doMock()
 * + require() to re-execute the module with fresh mocks.
 */

describe('lib/supabase', () => {
  const originalEnv = process.env;
  let mockCreateClient: jest.Mock;

  beforeEach(() => {
    jest.resetModules();
    mockCreateClient = jest.fn().mockReturnValue({ auth: {} });

    jest.doMock('@supabase/supabase-js', () => ({
      createClient: mockCreateClient,
    }));

    jest.doMock('@react-native-async-storage/async-storage', () => ({
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
    }));

    process.env = {
      ...originalEnv,
      EXPO_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
      EXPO_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.restoreAllMocks();
  });

  describe('createClient call', () => {
    it('passes env vars to createClient', () => {
      jest.doMock('react-native', () => ({ Platform: { OS: 'ios' } }));
      require('@/lib/supabase');

      expect(mockCreateClient).toHaveBeenCalledWith(
        'https://test.supabase.co',
        'test-anon-key',
        expect.objectContaining({
          auth: expect.objectContaining({
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true,
          }),
        })
      );
    });

    it('exports a supabase client object', () => {
      jest.doMock('react-native', () => ({ Platform: { OS: 'ios' } }));
      const { supabase } = require('@/lib/supabase');
      expect(supabase).toBeDefined();
    });
  });

  describe('missing env vars', () => {
    it('logs a console.error when env vars are missing', () => {
      process.env.EXPO_PUBLIC_SUPABASE_URL = '';
      process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = '';
      jest.doMock('react-native', () => ({ Platform: { OS: 'ios' } }));

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      require('@/lib/supabase');
      expect(consoleSpy).toHaveBeenCalled();
    });

    it('calls createClient with empty strings when env vars are missing', () => {
      process.env.EXPO_PUBLIC_SUPABASE_URL = '';
      process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = '';
      jest.doMock('react-native', () => ({ Platform: { OS: 'ios' } }));
      jest.spyOn(console, 'error').mockImplementation(() => {});

      require('@/lib/supabase');
      expect(mockCreateClient).toHaveBeenCalledWith('', '', expect.any(Object));
    });
  });

  describe('Platform.OS === "web" — authStorage', () => {
    beforeEach(() => {
      jest.doMock('react-native', () => ({ Platform: { OS: 'web' } }));
    });

    function getWebStorage() {
      require('@/lib/supabase');
      return mockCreateClient.mock.calls[0][2].auth.storage;
    }

    it('provides a storage object with getItem, setItem, removeItem', () => {
      const storage = getWebStorage();
      expect(typeof storage.getItem).toBe('function');
      expect(typeof storage.setItem).toBe('function');
      expect(typeof storage.removeItem).toBe('function');
    });

    it('getItem returns localStorage value when window is defined', async () => {
      const mockGetItem = jest.fn().mockReturnValue('stored-value');
      (global as any).window = { localStorage: { getItem: mockGetItem, setItem: jest.fn(), removeItem: jest.fn() } };

      const storage = getWebStorage();
      const result = await storage.getItem('auth-key');

      expect(mockGetItem).toHaveBeenCalledWith('auth-key');
      expect(result).toBe('stored-value');

      delete (global as any).window;
    });

    it('getItem returns null when window is undefined', async () => {
      const savedWindow = (global as any).window;
      delete (global as any).window;

      const storage = getWebStorage();
      const result = await storage.getItem('auth-key');

      expect(result).toBeNull();
      (global as any).window = savedWindow;
    });

    it('setItem calls localStorage.setItem when window is defined', async () => {
      const mockSetItem = jest.fn();
      (global as any).window = { localStorage: { getItem: jest.fn(), setItem: mockSetItem, removeItem: jest.fn() } };

      const storage = getWebStorage();
      await storage.setItem('auth-key', 'my-value');

      expect(mockSetItem).toHaveBeenCalledWith('auth-key', 'my-value');
      delete (global as any).window;
    });

    it('setItem resolves without error when window is undefined', async () => {
      const savedWindow = (global as any).window;
      delete (global as any).window;

      const storage = getWebStorage();
      await expect(storage.setItem('auth-key', 'value')).resolves.toBeUndefined();

      (global as any).window = savedWindow;
    });

    it('removeItem calls localStorage.removeItem when window is defined', async () => {
      const mockRemoveItem = jest.fn();
      (global as any).window = { localStorage: { getItem: jest.fn(), setItem: jest.fn(), removeItem: mockRemoveItem } };

      const storage = getWebStorage();
      await storage.removeItem('auth-key');

      expect(mockRemoveItem).toHaveBeenCalledWith('auth-key');
      delete (global as any).window;
    });

    it('removeItem resolves without error when window is undefined', async () => {
      const savedWindow = (global as any).window;
      delete (global as any).window;

      const storage = getWebStorage();
      await expect(storage.removeItem('auth-key')).resolves.toBeUndefined();

      (global as any).window = savedWindow;
    });
  });

  describe('Platform.OS !== "web" — authStorage', () => {
    it('uses AsyncStorage on native platforms', () => {
      jest.doMock('react-native', () => ({ Platform: { OS: 'ios' } }));
      const AsyncStorage = require('@react-native-async-storage/async-storage');
      require('@/lib/supabase');

      const authStorage = mockCreateClient.mock.calls[0][2].auth.storage;
      expect(authStorage).toBe(AsyncStorage);
    });
  });
});
