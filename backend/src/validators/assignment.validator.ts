import Joi from 'joi';

export const createAssignmentSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  deadline: Joi.date().iso().required(),
});

export const updateAssignmentSchema = Joi.object({
  title: Joi.string(),
  description: Joi.string(),
  deadline: Joi.date().iso(),
}).min(1); // Require at least one field to be updated

export const downloadSubmissionsSchema = Joi.object({
  email: Joi.string().email().required(),
});

export const bulkDeleteAssignmentSchema = Joi.object({
    ids: Joi.array().items(Joi.string().hex().length(24)).min(1).required()
});
