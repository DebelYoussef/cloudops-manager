const query: { page?: number; limit?: number; q?: string; status?: string } = {};
const { page = 1, limit = 10, q, status } = query;

const where = {
  ...(q
    ? {
        name: {
          contains: q,
          mode: 'insensitive' as const,
        },
      }
    : {}),
  ...(status ? { status } : {}),
};