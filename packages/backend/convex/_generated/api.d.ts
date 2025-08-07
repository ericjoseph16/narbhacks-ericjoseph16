/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as api_drills from "../api/drills.js";
import type * as api_seed from "../api/seed.js";
import type * as api_skills from "../api/skills.js";
import type * as api_test from "../api/test.js";
import type * as models_index from "../models/index.js";
import type * as utils_types from "../utils/types.js";
import type * as utils_utils from "../utils/utils.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  "api/drills": typeof api_drills;
  "api/seed": typeof api_seed;
  "api/skills": typeof api_skills;
  "api/test": typeof api_test;
  "models/index": typeof models_index;
  "utils/types": typeof utils_types;
  "utils/utils": typeof utils_utils;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
