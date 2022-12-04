export interface SessionData {
  sid: string;
}

export interface Store {
  read: (sid: string) => Promise<string | null>;
  update: (sid: string, json: string) => Promise<void>;
  create: (sid: string, ttl: number) => Promise<string>;
}

export interface SessionOptions {
  secret: string;
  idleTimeout: number;
  absoluteTimeout: number;
}
