import Joi from "joi";
import { OFFLINE_PAYMENT_METHODS } from "../config/requestPayment.js";
import { moneyToMinorUnits } from "../utils/money.js";

const positiveMoney = Joi.string()
  .trim()
  .pattern(/^\d{1,12}(?:\.\d{1,2})?$/)
  .custom((value, helpers) =>
    moneyToMinorUnits(value) > 0n
      ? value
      : helpers.message({ custom: "amount must be greater than zero" }),
  )
  .strict()
  .required();

const optionalText = (max) => Joi.string().trim().min(1).max(max);
const paymentBase = {
  amount: positiveMoney,
  method: Joi.string().valid(...OFFLINE_PAYMENT_METHODS).required(),
  paidAt: Joi.date().iso().max("now").required(),
  externalReference: optionalText(200),
  note: optionalText(2000),
};

export const recordPaymentSchema = Joi.object({
  ...paymentBase,
  purchaseOrderNumber: optionalText(200),
}).unknown(false);

export const recordRefundSchema = Joi.object(paymentBase).unknown(false);

export const voidPaymentSchema = Joi.object({
  reason: Joi.string().trim().min(3).max(1000).required(),
}).unknown(false);

export const paymentRecordParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
  paymentId: Joi.number().integer().positive().required(),
}).unknown(false);
