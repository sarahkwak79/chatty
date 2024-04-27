const Yup = require("yup");

const formSchema = Yup.object({
  username: Yup.string()
    .required("Username required!")
    .min(6, "Username is too short!")
    .max(28, "Username is too long!"),
  password: Yup.string()
    .required("Password required!")
    .miˇn(6, "Password is too short!")
    .max(28, "Password is too long!"),
});

module.exports = { formSchema };
