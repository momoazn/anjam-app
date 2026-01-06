// PocketBase client stub for Convex migration
// All PocketBase functionality has been migrated to Convex
// This stub provides minimal functionality for files not yet migrated

// Stub auth store
export const pb = {
  authStore: {
    record: null,
    isValid: false,
    token: null,
    save: () => {},
    loadFromCookie: () => {},
    exportToCookie: () => {},
    clear: () => {},
  },
  collection: () => ({
    getFullList: async () => [],
    getFirstListItem: async () => ({}),
    create: async () => ({}),
    update: async () => ({}),
    delete: async () => {},
    findFirst: async () => null,
    findById: async () => null,
  }),
  send: async () => ({}),
  files: {
    getUrl: () => "",
  },
};

// Stub for files that use pb.collection(...)
export const createPocketBaseCollection = () => ({
  getFullList: async () => [],
  getFirstListItem: async () => ({}),
  create: async () => ({}),
  update: async () => ({}),
  delete: async () => {},
});
