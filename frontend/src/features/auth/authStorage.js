const normalizeUser = (user) => {
  if (!user) return null;

  return {
    ...user,
    id: user.id || user._id || "",
    _id: user._id || user.id || "",
  };
};

export const saveAuthData = ({ token, user }) => {
  const normalizedUser = normalizeUser(user);
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(normalizedUser));
};

export const getToken = () => {
  return localStorage.getItem("token");
};

export const getStoredUser = () => {
  const raw = localStorage.getItem("user");
  if (!raw) return null;

  try {
    return normalizeUser(JSON.parse(raw));
  } catch {
    localStorage.removeItem("user");
    return null;
  }
};

export const clearAuthData = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};