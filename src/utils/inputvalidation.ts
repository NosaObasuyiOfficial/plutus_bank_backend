import Joi from "joi";

export const signUpUser = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    phoneNumber: Joi.string().required(),
  });


  export const createAdminSchema = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    phoneNumber: Joi.string().required()
  });

  export const createCompanySchema = Joi.object({
    companyName: Joi.string().required(),
    company_description: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    businessType: Joi.string().required(),
    roi: Joi.any().required(),
    investment_category: Joi.string().required(),
    investment_description: Joi.string().required(),
    duration: Joi.number().required(),
    min_investment_amount: Joi.number().required(),
    max_investment_amount: Joi.number().required(),
  });

export const clientLogin = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const companyLogin = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const createBeneficiary = Joi.object({
  beneficiaryName: Joi.string().required(),
  accountNumber: Joi.string().required()
})


