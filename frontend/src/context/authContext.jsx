export const login = async (email, password) => {
  try {
    // Thử đăng nhập local trước
    let response = await fetch(
      `${process.env.REACT_APP_API_URL}/api/auth/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      }
    );

    let data = await response.json();
    if (data.result && data.result.authenticated) {
      console.log("Local login data", data.result);
      localStorage.setItem("accessToken", data.result.accessToken);
      localStorage.setItem(
        "tokenExpiresAt",
        Date.now() + data.result.expiresIn * 1000
      );
      localStorage.setItem("userId", data.result.id);
      localStorage.setItem("userEmail", data.result.email || email);
      localStorage.setItem("userName", data.result.name || "User");
      localStorage.setItem(
        "avatarUrl",
        data.result.avatarUrl ||
          `${process.env.REACT_APP_API_URL}/uploads/avatars/default-avatar.png`
      );
      localStorage.setItem("role", data.result.role || "USER");
      localStorage.setItem(
        "created_at",
        data.result.createdAt || new Date().toISOString().split("T")[0]
      );
      localStorage.setItem("backgroundUrl", data.result.backgroundUrl || null);
      localStorage.setItem("authProvider", "email");

      return { ...data.result, authProvider: "email" };
    }

    // Nếu đăng nhập local thất bại, thử đăng nhập admin
    console.log("Local login failed, attempting admin login");
    response = await fetch(
      `${process.env.REACT_APP_API_URL}/api/admin/auth/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      }
    );

    data = await response.json();
    if (response.ok && data.token) {
      console.log("Admin login data", data);
      localStorage.setItem("accessToken", data.token);
      localStorage.setItem(
        "tokenExpiresAt",
        Date.now() + 3600 * 1000 // 1 hour
      );
      localStorage.setItem("userId", data.user.id);
      localStorage.setItem("userEmail", data.user.email || email);
      localStorage.setItem("userName", data.user.username || "Admin");
      localStorage.setItem(
        "avatarUrl",
        `${process.env.REACT_APP_API_URL}/uploads/avatars/default-avatar.png`
      );
      localStorage.setItem("role", data.user.role || "ADMIN");
      localStorage.setItem(
        "created_at",
        new Date().toISOString().split("T")[0]
      );
      localStorage.setItem("backgroundUrl", null);
      localStorage.setItem("authProvider", "admin");

      return {
        accessToken: data.token,
        expiresIn: 3600,
        id: data.user.id,
        email: data.user.email,
        name: data.user.username,
        avatarUrl: `${process.env.REACT_APP_API_URL}/uploads/avatars/default-avatar.png`,
        role: data.user.role || "ADMIN",
        createdAt: new Date().toISOString().split("T")[0],
        backgroundUrl: null,
        authProvider: "admin",
      };
    }

    throw new Error(data.message || "Login failed");
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

export const register = async (name, email, password) => {
  try {
    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/api/auth/register`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      }
    );

    const data = await response.json();
    if (response.ok && data.result) {
      return data.result;
    } else {
      throw new Error(data.message || "Registration failed");
    }
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
};
