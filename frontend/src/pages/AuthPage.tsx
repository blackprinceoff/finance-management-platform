import { useState, type FormEvent } from "react";
import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router-dom";
import authStore from "../stores/authStore";
import Button from "../components/Button";
import Input from "../components/Input";

type AuthMode = "login" | "register";

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const isLogin = mode === "login";
  const isFormEmpty =
    email.trim() === "" ||
    password.trim() === "" ||
    (!isLogin && username.trim() === "");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      const success = await authStore.login({ email, password });
      if (success) navigate("/dashboard");
    } else {
      const success = await authStore.register({ username, email, password });
      if (success) navigate("/dashboard");
    }
  };

  const toggleMode = () => {
    setMode(isLogin ? "register" : "login");
    setUsername("");
    setEmail("");
    setPassword("");
    authStore.error = null;
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-apple-50 to-apple-100 px-4">
      <div className="w-full max-w-sm rounded-apple border border-apple-100 bg-white px-8 py-10 shadow-lg">
        <h1 className="text-center text-2xl font-semibold text-apple-900">
          Finance Management Platform
        </h1>

        <div className="mt-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <Input
                label="Username"
                type="text"
                placeholder="Your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            )}

            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {authStore.error && (
              <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                {authStore.error}
              </p>
            )}

            <Button
              type="submit"
              isLoading={authStore.isLoading}
              disabled={isFormEmpty}
              className="w-full"
            >
              {isLogin ? "Sign In" : "Create Account"}
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-apple-500">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={toggleMode}
            className="font-medium text-apple-blue hover:text-apple-blue-hover"
          >
            {isLogin ? "Register" : "Sign In"}
          </button>
        </p>
      </div>
    </main>
  );
}

export default observer(AuthPage);
