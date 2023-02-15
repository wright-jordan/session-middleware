import type { SessionConfig } from "./types/SessionConfig.js";
import type { SessionMiddleware } from "./types/SessionMiddleware.js";
import { Use } from "./Use.js";
import { parseSID } from "./deps/parseSID.js";

const use = Use({ parseSID });

export function Session(config: SessionConfig): SessionMiddleware {
  return {
    config,
    use,
  };
}
