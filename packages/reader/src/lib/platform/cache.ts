export const createCacheHandler = (
  url: URL,
  cache: Cache,
  waitUntil: (promise: Promise<unknown>) => void,
) => {
  const match = async (key: string) => {
    const cacheKey = `${url.origin}/${key}`;

    const res = await cache.match(cacheKey);
    if (!res || !res.ok) {
      return;
    }
    return res;
  };

  const putResponse = (key: string, response: Response) => {
    const cacheKey = `${url.origin}/${key}`;
    waitUntil(cache.put(cacheKey, response));
  };

  const put = (key: string, body: BodyInit | null, ttl: number, negative = false) => {
    const response = new Response(body, {
      status: negative ? 404 : 200,
      headers: { 'cache-control': `s-maxage=${ttl}` },
    });

    putResponse(key, response);
  };

  return {
    match,
    put,
    putResponse,
  };
};

export type CacheHandler = ReturnType<typeof createCacheHandler>;
