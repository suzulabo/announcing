import type { DBContext } from '../db';

export const getStorage = async ({ r2 }: DBContext, key: string) => {
  const res = await r2.get(key);
  if (!res) {
    return;
  }

  return {
    contentType: res.httpMetadata?.contentType ?? '',
    contentLength: res.size,
    body: res.body,
  };
};
