import type { CacheStorage } from '@cloudflare/workers-types/experimental';
import { Miniflare, Response as MiniflareResponse } from 'miniflare';
import { resolve } from 'node:path';
import { getWranglerLocalEnv } from './wranglerEnv';

const LOCAL_DIR = '../db-local/v3';

const localEnv = getWranglerLocalEnv();

export const createLocalPlatform = async () => {
  const path = `file://${resolve(LOCAL_DIR)}`;

  const mf = new Miniflare({
    modules: true,
    script: '',
    d1Persist: `${path}/d1`,
    r2Persist: `${path}/r2`,
    kvPersist: `${path}/kv`,
    d1Databases: { D1: localEnv.D1_ID, D1_NOTIFICATION: localEnv.D1_NOTIFICATION_ID },
    r2Buckets: { R2: localEnv.R2_BUCKET_NAME, R2_POST_LOG: localEnv.R2_POST_LOG_BUCKET_NAME },
    kvNamespaces: { KV_NOTIFICATION: localEnv.KV_NOTIFICATION_ID },
  });

  const bindings = await mf.getBindings<{
    D1: D1Database;
    D1_NOTIFICATION: D1Database;
    R2: R2Bucket;
    R2_POST_LOG: R2Bucket;
    KV_NOTIFICATION: KVNamespace;
  }>();

  const caches = await mf.getCaches();

  return {
    env: {
      ...bindings,
      SEND_EMAIL: {
        send(message) {
          console.log(message);
          return Promise.resolve();
        },
      } satisfies SendEmail,
    },
    caches: {
      open: () => {
        throw new Error('not implemented yet');
      },
      default: new CacheWrapper(caches.default as unknown as Cache),
    } as CacheStorage,
    context: {
      waitUntil: () => {
        //
      },
    },
    dispose: () => {
      return mf.dispose();
    },
  };
};

class CacheWrapper implements Cache {
  //
  constructor(private cache: Cache) {}
  delete(request: RequestInfo | URL, options?: CacheQueryOptions): Promise<boolean> {
    return this.cache.delete(request, options);
  }
  async match(
    request: RequestInfo | URL,
    options?: CacheQueryOptions,
  ): Promise<Response | undefined> {
    const res = await this.cache.match(request, options);
    if (!res) {
      return;
    }
    return new Response(res.body, res);
  }
  put(request: RequestInfo | URL, response: Response): Promise<void> {
    const mfResponse = new MiniflareResponse(response.body, {
      status: response.status,
      headers: [...response.headers.entries()],
    });
    return this.cache.put(request, mfResponse as unknown as Response);
  }
}
