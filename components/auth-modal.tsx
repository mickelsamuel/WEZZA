"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { X, Mail, Lock, User, ArrowRight, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: "signin" | "register";
}

export function AuthModal({ isOpen, onClose, defaultMode = "signin" }: AuthModalProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [mode, setMode] = useState<"signin" | "register">(defaultMode);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [content, setContent] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    fetch("/api/site-content?section=auth")
      .then((res) => res.json())
      .then((data) => {
        const contentMap: Record<string, string> = {};
        data.content?.forEach((item: any) => {
          contentMap[item.key] = item.value;
        });
        setContent(contentMap);
      })
      .catch((error) => {
        console.error("Error fetching content:", error);
      });
  }, []);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        toast({
          title: content["auth.error.title"] || "Error",
          description: content["auth.error.invalidCredentials"] || "Invalid email or password",
          variant: "destructive",
        });
      } else {
        toast({
          title: content["auth.success.title"] || "Success",
          description: content["auth.success.welcome"] || "Welcome back!",
        });
        onClose();
        router.refresh();
      }
    } catch (error) {
      toast({
        title: content["auth.error.title"] || "Error",
        description: content["auth.error.generic"] || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: content["auth.error.title"] || "Error",
        description: content["auth.error.passwordMismatch"] || "Passwords do not match",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: content["auth.error.title"] || "Error",
        description: content["auth.error.passwordLength"] || "Password must be at least 6 characters",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: content["auth.error.title"] || "Error",
          description: data.error || (content["auth.error.failedCreate"] || "Failed to create account"),
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        toast({
          title: content["auth.success.accountCreated"] || "Account created",
          description: content["auth.success.pleaseSignIn"] || "Please sign in with your new account",
        });
        setMode("signin");
      } else {
        toast({
          title: content["auth.success.title"] || "Success",
          description: content["auth.success.accountCreated"] || "Account created successfully!",
        });
        onClose();
        router.refresh();
      }
    } catch (error) {
      toast({
        title: content["auth.error.title"] || "Error",
        description: content["auth.error.generic"] || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
  };

  const switchMode = (newMode: "signin" | "register") => {
    setMode(newMode);
    resetForm();
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <div className="relative w-full h-full flex items-center justify-center py-4" onClick={onClose}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative w-full max-w-md max-h-[calc(100vh-2rem)] z-10 overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-br from-brand-black via-brand-black to-brand-orange/50 rounded-3xl border border-white/20 shadow-2xl">
                <div className="bg-black/40 backdrop-blur-xl rounded-3xl p-8">
                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="absolute right-4 top-4 text-white/60 hover:text-white transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>

                {/* Header */}
                <div className="text-center mb-8">
                  <h2 className="font-heading text-4xl font-bold text-white mb-2">
                    {mode === "signin" ? (content["auth.signIn.heading"] || "WELCOME BACK") : (content["auth.register.heading"] || "JOIN WEZZA")}
                  </h2>
                  <p className="text-white/70">
                    {mode === "signin"
                      ? (content["auth.signIn.description"] || "Sign in to access your account")
                      : (content["auth.register.description"] || "Create your account and start shopping")}
                  </p>
                </div>

                {/* Forms */}
                <AnimatePresence mode="wait">
                  {mode === "signin" ? (
                    <motion.form
                      key="signin"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.2 }}
                      onSubmit={handleSignIn}
                      className="space-y-5"
                    >
                      <div>
                        <Label htmlFor="email" className="text-white text-sm font-medium mb-2 block">
                          {content["auth.email.label"] || "Email Address"}
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50" />
                          <Input
                            id="email"
                            type="email"
                            required
                            placeholder={content["auth.email.placeholder"] || "you@example.com"}
                            className="pl-11 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-brand-orange focus:ring-brand-orange h-12"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="password" className="text-white text-sm font-medium mb-2 block">
                          {content["auth.password.label"] || "Password"}
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50" />
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            required
                            placeholder={content["auth.password.placeholder"] || "••••••••"}
                            className="pl-11 pr-11 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-brand-orange focus:ring-brand-orange h-12"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                          >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                      </div>

                      <Button
                        type="submit"
                        size="lg"
                        className="w-full h-12 bg-brand-orange hover:bg-brand-orange/90 text-white font-semibold"
                        disabled={isLoading}
                      >
                        {isLoading ? (content["auth.signIn.loading"] || "Signing in...") : (content["auth.signIn.button"] || "Sign In")}
                        {!isLoading && <ArrowRight className="ml-2 h-5 w-5" />}
                      </Button>
                    </motion.form>
                  ) : (
                    <motion.form
                      key="register"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                      onSubmit={handleRegister}
                      className="space-y-4"
                    >
                      <div>
                        <Label htmlFor="name" className="text-white text-sm font-medium mb-1.5 block">
                          {content["auth.fullName.label"] || "Full Name"}
                        </Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50" />
                          <Input
                            id="name"
                            type="text"
                            required
                            placeholder={content["auth.fullName.placeholder"] || "John Doe"}
                            className="pl-11 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-brand-orange focus:ring-brand-orange h-12"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="email-reg" className="text-white text-sm font-medium mb-1.5 block">
                          {content["auth.email.label"] || "Email Address"}
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50" />
                          <Input
                            id="email-reg"
                            type="email"
                            required
                            placeholder={content["auth.email.placeholder"] || "you@example.com"}
                            className="pl-11 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-brand-orange focus:ring-brand-orange h-12"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="password-reg" className="text-white text-sm font-medium mb-1.5 block">
                          {content["auth.password.label"] || "Password"}
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50" />
                          <Input
                            id="password-reg"
                            type={showPassword ? "text" : "password"}
                            required
                            placeholder={content["auth.password.placeholder"] || "••••••••"}
                            className="pl-11 pr-11 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-brand-orange focus:ring-brand-orange h-12"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                          >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                        <p className="text-white/50 text-xs mt-1">{content["auth.password.help"] || "Must be at least 6 characters"}</p>
                      </div>

                      <div>
                        <Label htmlFor="confirmPassword" className="text-white text-sm font-medium mb-1.5 block">
                          {content["auth.confirmPassword.label"] || "Confirm Password"}
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50" />
                          <Input
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            required
                            placeholder={content["auth.confirmPassword.placeholder"] || "••••••••"}
                            className="pl-11 pr-11 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-brand-orange focus:ring-brand-orange h-12"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                          >
                            {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                      </div>

                      <Button
                        type="submit"
                        size="lg"
                        className="w-full h-12 bg-brand-orange hover:bg-brand-orange/90 text-white font-semibold"
                        disabled={isLoading}
                      >
                        {isLoading ? (content["auth.register.loading"] || "Creating account...") : (content["auth.register.button"] || "Create Account")}
                        {!isLoading && <ArrowRight className="ml-2 h-5 w-5" />}
                      </Button>
                    </motion.form>
                  )}
                </AnimatePresence>

                {/* Divider */}
                <div className="relative my-5">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/20"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-transparent text-white/60">{content["auth.or"] || "or"}</span>
                  </div>
                </div>

                {/* Mode Toggle */}
                <div className="text-center">
                  <p className="text-white/70 mb-3">
                    {mode === "signin" ? (content["auth.noAccount"] || "Don't have an account?") : (content["auth.haveAccount"] || "Already have an account?")}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={() => switchMode(mode === "signin" ? "register" : "signin")}
                    className="w-full h-12 border-2 border-white/30 bg-transparent text-white hover:bg-white hover:text-black font-semibold"
                  >
                    {mode === "signin" ? (content["auth.switchToRegister"] || "Create Account") : (content["auth.switchToSignIn"] || "Sign In")}
                  </Button>
                </div>

                {/* Guest Option */}
                <div className="mt-6 text-center">
                  <button
                    onClick={onClose}
                    className="text-sm text-white/60 hover:text-white transition-colors"
                  >
                    {content["auth.continueGuest"] || "Continue as guest"}
                  </button>
                </div>

                {/* Footer Text */}
                <p className="text-center text-white/40 text-xs mt-6">
                  {content["auth.terms"] || "By continuing, you agree to our Terms of Service and Privacy Policy"}
                </p>
              </div>
            </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
