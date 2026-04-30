import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
  let token = req?.cookies?.token;
  console.log(token);
  
  if (!token) {
    return res.status(401).json({
      message: "unautherized!",
    });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(500).json({
      message: "server error!",
      err,
    });
  }
};
