export const signup = async (req, res, next) => {
  res.status(200).json({ message: "sign up" });
};
export const signin = async (req, res, next) => {
  res.status(200).json({ message: "sign in" });
};
export const signout = async (req, res, next) => {
  res.status(200).json({ message: "sign out" });
};
