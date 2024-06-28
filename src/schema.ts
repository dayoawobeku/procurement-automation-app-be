import Joi from "joi";

export const orderSchema = Joi.object({
  customerName: Joi.string().required(),
  shippingAddress: Joi.string().required(),
  items: Joi.array()
    .items(
      Joi.object({
        id: Joi.string().required(),
        quantity: Joi.number().integer().min(1).required(),
        price: Joi.number(),
        name: Joi.string(),
        imageUrl: Joi.string(),
      })
    )
    .min(1)
    .required(),
  status: Joi.string().valid("completed", "shipped", "pending", "cancelled"),
  shippingFee: Joi.number().min(0).required(),
  discount: Joi.number().min(0).required(),
  tax: Joi.number().min(0).required(),
  paymentStatus: Joi.string(),
  shippingMethod: Joi.string(),
  trackingNumber: Joi.string(),
  estimatedDelivery: Joi.string().required(),
});
