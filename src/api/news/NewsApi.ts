const NEWS_API = {
  // CRUD operations
  CREATE: '/api/News/create-news',
  CREATE_ALT: '/api/News/create',
  GET_ALL_FOR_STAFF: '/api/News/get-all-news-for-staff',
  GET_ALL: '/api/News/get-all-news',
  GET_BY_ID: (id: string) => `/api/News/get-news-by-id/${id}`,
  UPDATE: (id: string) => `/api/News/update-news/${id}`,
  DELETE: (id: string) => `/api/News/delete-news/${id}`,
  
  // Status operations
  APPROVE: (id: string) => `/api/News/approve-news/${id}`,
  REJECT: (id: string) => `/api/News/reject-news/${id}`,
  PUBLISH: (id: string) => `/api/News/publish-news/${id}`,
};

export default NEWS_API; 