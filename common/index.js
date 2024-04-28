const Yup = require("yup");

const formSchema = Yup.object({
  username: Yup.string()
    .required("Username required!")
    .min(6, "Username is too short!")
    .max(28, "Username is too long!"),
  password: Yup.string()
    .required("Password required!")
    .min(6, "Password is too short!")
    .max(28, "Password is too long!"),
});

const friendSchema = Yup.object({
  friendName: Yup.string()
    .required("Username required")
    .min(6, "Invalid username!")
    .max(28, "Invalid username!"),
});

module.exports = { formSchema, friendSchema };
