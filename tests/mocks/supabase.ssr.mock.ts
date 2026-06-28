export const createServerClient = vi.fn(() => ({
  auth: {
    getUser: vi.fn(),
  },
}));