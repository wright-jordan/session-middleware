import type { SessionConfig } from "./types/SessionConfig.js";
import type { SessionMiddleware } from "./types/SessionMiddleware.js";
import { Use } from "./Use.js";
import { parseSignedID } from "./deps/parseSignedID.js";

const use = Use({ parseSignedID });

export function Session(config: SessionConfig): SessionMiddleware {
  return {
    config,
    use,
  };
}
