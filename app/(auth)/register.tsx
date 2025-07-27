import { yupResolver } from "@hookform/resolvers/yup";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { Button, Text, TextInput } from "react-native-paper";
import * as yup from "yup";
import { getCaptcha, register } from "../../api/auth";
import { useAuth } from "../../contexts/AuthContext";

// Yup schema with validationCode required for backend
const schema = yup.object({
  username: yup
    .string()
    .min(6, "Username must be at least 6 characters")
    .max(12, "Username must be at most 12 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]+$/,
      "Username must include one uppercase letter, one lowercase letter, and one number"
    )
    .required("Username is required"),
  email: yup
    .string()
    .matches(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      "Invalid email format (e.g., user@domain.com)"
    )
    .required("Email is required"),
  validationCode: yup.string().required("Validation code is required"),
  password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(20, "Password must be at most 20 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[a-zA-Z\d!@#$%^&*]+$/,
      "Password must include one uppercase letter, one lowercase letter, one number, and one special symbol"
    )
    .required("Password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Confirm Password is required"),
  captcha: yup.string().required("Captcha is required"),
});

type FormData = yup.InferType<typeof schema>;

export default function Register() {
  const { login: authLogin } = useAuth();
  const [showValidationCode, setShowValidationCode] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    trigger,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    mode: "onChange",
    defaultValues: {
      username: "",
      email: "",
      validationCode: "",
      password: "",
      confirmPassword: "",
      captcha: "",
    },
  });
  const [error, setError] = useState<string | null>(null);
  const [captcha, setCaptcha] = useState<{
    image: string | null;
    captchaId: string | null;
  }>({ image: null, captchaId: null });
  const [resendTimer, setResendTimer] = useState<number | null>(null);
  const email = watch("email");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Debug log to check form state
  useEffect(() => {
    console.log("Form State:", {
      isValid,
      email,
      errors: errors.email,
      showValidationCode,
    });
  }, [isValid, email, errors.email, showValidationCode]);

  useEffect(() => {
    fetchCaptcha();
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendTimer !== null && resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer((prev) => (prev !== null && prev > 0 ? prev - 1 : null));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

  useEffect(() => {
    trigger("email");
  }, [email, trigger]);

  const fetchCaptcha = async () => {
    try {
      const { image, captchaId } = await getCaptcha();
      setCaptcha({ image, captchaId });
    } catch (err: any) {
      setError(err.message || "Failed to load captcha");
    }
  };

  const handleSendVerificationCode = async () => {
    const isEmailValid = await trigger("email", { shouldFocus: true });
    console.log("Send Code Clicked:", { isEmailValid, email });
    if (isEmailValid && email) {
      try {
        // await sendVerificationCode(email);
        setShowValidationCode(true);
        setResendTimer(60);
      } catch (err: any) {
        setError(err.message || "Failed to send validation code");
      }
    }
  };

  const onSubmit = async (data: FormData) => {
    if (!captcha.captchaId) {
      setError("Captcha not loaded");
      return;
    }
    try {
      const token = await register({
        username: data.username,
        email: data.email,
        password: data.password,
        captcha: data.captcha,
        captchaId: captcha.captchaId,
        validationCode: data.validationCode,
      });
      await authLogin(token);
    } catch (err: any) {
      setError(err.message || "Registration failed");
      await fetchCaptcha();
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="displayMedium" style={styles.title}>
        Register
      </Text>
      {error && <Text style={styles.error}>{error}</Text>}

      <Controller
        control={control}
        name="username"
        render={({ field: { onChange, value } }) => (
          <TextInput
            label="Username"
            value={value}
            onChangeText={onChange}
            error={!!errors.username}
            style={styles.input}
          />
        )}
      />
      {errors.username && (
        <Text style={styles.error}>{errors.username.message}</Text>
      )}

      <View style={styles.emailContainer}>
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, value } }) => (
            <TextInput
              label="Email"
              value={value}
              onChangeText={onChange}
              error={!!errors.email}
              style={styles.emailInput}
            />
          )}
        />
        <Button
          mode="contained"
          onPress={handleSendVerificationCode}
          disabled={!!errors.email || !email || resendTimer !== null}
          style={styles.emailButton}
        >
          {resendTimer !== null ? `Resend in ${resendTimer}s` : "Send Code"}
        </Button>
      </View>
      {errors.email && <Text style={styles.error}>{errors.email.message}</Text>}

      {showValidationCode && (
        <Controller
          control={control}
          name="validationCode"
          render={({ field: { onChange, value } }) => (
            <TextInput
              label="Validation Code"
              value={value ?? ""}
              onChangeText={onChange}
              error={!!errors.validationCode}
              style={styles.input}
            />
          )}
        />
      )}
      {errors.validationCode && (
        <Text style={styles.error}>{errors.validationCode.message}</Text>
      )}

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, value } }) => (
          <TextInput
            label="Password"
            value={value}
            onChangeText={onChange}
            secureTextEntry={!showPassword}
            error={!!errors.password}
            style={styles.input}
            right={
              <TextInput.Icon
                icon={showPassword ? "eye-off" : "eye"}
                onPress={() => setShowPassword(!showPassword)}
              />
            }
          />
        )}
      />
      {errors.password && (
        <Text style={styles.error}>{errors.password.message}</Text>
      )}

      <Controller
        control={control}
        name="confirmPassword"
        render={({ field: { onChange, value } }) => (
          <TextInput
            label="Confirm Password"
            value={value}
            onChangeText={onChange}
            secureTextEntry={!showConfirmPassword}
            error={!!errors.confirmPassword}
            style={styles.input}
            right={
              <TextInput.Icon
                icon={showConfirmPassword ? "eye-off" : "eye"}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              />
            }
          />
        )}
      />
      {errors.confirmPassword && (
        <Text style={styles.error}>{errors.confirmPassword.message}</Text>
      )}

      {captcha.image && (
        <TouchableOpacity onPress={fetchCaptcha}>
          <Image
            source={{ uri: `data:image/png;base64,${captcha.image}` }}
            style={styles.captchaImage}
          />
        </TouchableOpacity>
      )}
      <Controller
        control={control}
        name="captcha"
        render={({ field: { onChange, value } }) => (
          <TextInput
            label="Captcha"
            value={value}
            onChangeText={onChange}
            error={!!errors.captcha}
            style={styles.input}
          />
        )}
      />
      {errors.captcha && (
        <Text style={styles.error}>{errors.captcha.message}</Text>
      )}

      <Button
        mode="contained"
        onPress={handleSubmit(onSubmit)}
        style={styles.button}
      >
        Register
      </Button>
      <Button onPress={() => router.push("/(auth)/login")}>Go to Login</Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: "center" },
  title: { textAlign: "center", marginBottom: 16 },
  input: { marginBottom: 8 },
  emailContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  emailInput: { flex: 1, marginRight: 8 },
  emailButton: { height: 40 },
  captchaImage: { width: 200, height: 80, marginBottom: 8 },
  error: { color: "red", marginBottom: 8 },
  button: { marginVertical: 8 },
});
