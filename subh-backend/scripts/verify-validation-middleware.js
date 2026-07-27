import assert from "node:assert/strict";
import Joi from "joi";
import { validate } from "../src/middleware/validate.Middleware.js";
import { listBooksQuerySchema } from "../src/validation/books.Validation.js";

const createResponse = () => {
  const result = { statusCode: null, payload: null };
  return {
    result,
    status(code) {
      result.statusCode = code;
      return this;
    },
    json(payload) {
      result.payload = payload;
      return this;
    },
  };
};

const querySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).default(20),
}).unknown(false);

let queryAssignments = 0;
let queryValue = { limit: "5" };
const queryRequest = {};
Object.defineProperty(queryRequest, "query", {
  get: () => queryValue,
  set: () => {
    queryAssignments += 1;
    throw new TypeError("query is getter-only");
  },
});
const queryResponse = createResponse();
let queryNextCalls = 0;
validate(querySchema, "query")(queryRequest, queryResponse, () => {
  queryNextCalls += 1;
});
assert.equal(queryAssignments, 0);
assert.equal(queryNextCalls, 1);
assert.deepEqual(queryRequest.validated.query, { page: 1, limit: 5 });
assert.deepEqual(queryValue, { limit: "5" });

const invalidRequest = { query: { page: "nope" } };
const invalidResponse = createResponse();
let invalidNextCalls = 0;
validate(querySchema, "query")(invalidRequest, invalidResponse, () => {
  invalidNextCalls += 1;
});
assert.equal(invalidNextCalls, 0);
assert.equal(invalidResponse.result.statusCode, 400);
assert.equal(invalidResponse.result.payload.success, false);
assert.equal(invalidRequest.validated, undefined);

const paramsRequest = { params: { id: "7" } };
const paramsResponse = createResponse();
validate(Joi.object({ id: Joi.number().integer().positive().required() }), "params")(
  paramsRequest,
  paramsResponse,
  () => {},
);
assert.deepEqual(paramsRequest.validated.params, { id: 7 });
assert.deepEqual(paramsRequest.params, { id: "7" });

const bodyRequest = { body: { name: "  Subh  " } };
const bodyResponse = createResponse();
validate(Joi.object({ name: Joi.string().trim().required() }), "body")(
  bodyRequest,
  bodyResponse,
  () => {},
);
assert.deepEqual(bodyRequest.validated.body, { name: "Subh" });
assert.deepEqual(bodyRequest.body, { name: "  Subh  " });

const booksRequest = { query: { page: "2", limit: "5", categoryId: "3", search: "  history  " } };
const booksResponse = createResponse();
validate(listBooksQuerySchema, "query")(booksRequest, booksResponse, () => {});
assert.deepEqual(booksRequest.validated.query, {
  page: 2,
  limit: 5,
  categoryId: 3,
  search: "history",
  sortBy: "createdAt",
  sortOrder: "desc",
});

const unknownBooksQuery = { query: { unexpected: "value" } };
const unknownBooksResponse = createResponse();
let unknownBooksNextCalls = 0;
validate(listBooksQuerySchema, "query")(unknownBooksQuery, unknownBooksResponse, () => {
  unknownBooksNextCalls += 1;
});
assert.equal(unknownBooksNextCalls, 0);
assert.equal(unknownBooksResponse.result.statusCode, 400);

console.log("Validation middleware verification passed");
