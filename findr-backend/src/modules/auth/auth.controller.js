const {
  registerUser,
  loginUser,
  getUserById,
  logoutUser,
} = require("./auth.service");

async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ error: "Name, email and password are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters" });
    }

    const { user, token } = await registerUser({ name, email, password });

    res.status(201).json({
      message: "Account created successfully",
      user,
      token,
    });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const { user, token } = await loginUser({ email, password });

    res.status(200).json({
      message: "Login successful",
      user,
      token,
    });
  } catch (error) {
    next(error);
  }
}

async function getMe(req, res, next) {
  try {
    const user = await getUserById(req.userId);
    res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
}

async function logout(req, res, next) {
  try {
    const token = req.headers.authorization.split(" ")[1];
    await logoutUser(token);
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
}

module.exports = { register, login, getMe, logout };
