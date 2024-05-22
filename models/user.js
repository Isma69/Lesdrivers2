const db = require("../lib/prisma");
const argon2 = require("argon2");
const Joi = require("joi");

const hashingOptions = {
  memoryCost: 2 ** 16,
  timeCost: 5,
  type: argon2.argon2id,
};

const hashPassword = async (plainPassword) => {
  try {
    return await argon2.hash(plainPassword, hashingOptions);
  } catch (err) {
    console.error("Error hashing password:", err);
    throw new Error("Error hashing password");
  }
};

const verifyPassword = async (hash, plainPassword) => {
  try {
    console.log("Verifying password");
    console.log("Hash:", hash);
    console.log("Plain password:", plainPassword);
    const result = await argon2.verify(hash, plainPassword, hashingOptions);
    console.log("Password verification result:", result);
    return result;
  } catch (err) {
    console.error("Error verifying password:", err);
    return false;
  }
};

const findUserByEmail = async (email) => {
  try {
    const user = await db.user.findUnique({ where: { email } });
    console.log("findUserByEmail result:", user);
    return user;
  } catch (err) {
    console.error("Error finding user by email:", err);
    return null;
  }
};

const getSafeAttributes = (user) => {
  const { id, firstname, lastname, email, address, phoneNumber, society } =
    user;
  return { id, firstname, lastname, email, address, phoneNumber, society };
};

const validateUser = (data, forUpdate = false) => {
  return Joi.object({
    firstname: Joi.string()
      .max(255)
      .presence(forUpdate ? "optional" : "required"),
    lastname: Joi.string()
      .max(255)
      .presence(forUpdate ? "optional" : "required"),
    email: Joi.string()
      .email()
      .max(255)
      .presence(forUpdate ? "optional" : "required"),
    password: Joi.string()
      .min(8)
      .max(100)
      .presence(forUpdate ? "optional" : "required"),
    address: Joi.string()
      .allow("")
      .max(255)
      .presence(forUpdate ? "optional" : "optional"),
    phoneNumber: Joi.string()
      .max(20)
      .presence(forUpdate ? "optional" : "required"),
    society: Joi.string()
      .allow("")
      .max(20)
      .presence(forUpdate ? "optional" : "optional"),
  }).validate(data, { abortEarly: false }).error;
};

const createUser = async ({
  password,
  firstname,
  email,
  lastname,
  address,
  phoneNumber,
  society,
}) => {
  const hashedPassword = await hashPassword(password);
  return db.user.create({
    data: {
      email,
      firstname,
      lastname,
      hashedPassword,
      address,
      phoneNumber,
      society,
    },
  });
};

const emailAlreadyExists = async (email = "") => {
  try {
    const user = await db.user.findUnique({ where: { email } });
    return !!user;
  } catch (err) {
    console.error("Error checking if email already exists:", err);
    return false;
  }
};

const deleteUserByEmail = async (email) => {
  try {
    return await db.user.delete({ where: { email } });
  } catch (err) {
    console.error("Error deleting user by email:", err);
    return false;
  }
};

const deleteAllUsers = async () => {
  try {
    return await db.user.deleteMany();
  } catch (err) {
    console.error("Error deleting all users:", err);
    return false;
  }
};

module.exports = {
  validateUser,
  createUser,
  emailAlreadyExists,
  findUserByEmail,
  deleteUserByEmail,
  deleteAllUsers,
  hashPassword,
  verifyPassword,
  getSafeAttributes,
};
