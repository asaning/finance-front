import { yupResolver } from "@hookform/resolvers/yup";
import { router } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, View } from "react-native";
import { Button, Text, TextInput } from "react-native-paper";
import * as yup from "yup";
import { login } from "../../api/auth";
import { useAuth } from "../../contexts/AuthContext";

const schema = yup
  .object({
    username: yup
      .string()
      .min(6, "Username must be at least 6 characters")
      .max(12, "Username must be at most 12 characters")
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]+$/,
        "Username must include one uppercase letter, one lowercase letter, and one number"
      )
      .required("Username is required"),
    password: yup
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(20, "Password must be at most 20 characters")
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[a-zA-Z\d!@#$%^&*]+$/,
        "Password must include one uppercase letter, one lowercase letter, one number, and one special symbol"
      )
      .required("Password is required"),
  })
  .required();

type FormData = yup.InferType<typeof schema>;

export default function Login() {
  const { login: authLogin } = useAuth();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data: FormData) => {
    try {
      const token = await login(data.username, data.password);
      await authLogin(token);
    } catch (err: any) {
      setError(err.message || "Login failed");
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Login
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

      <Button
        mode="contained"
        onPress={handleSubmit(onSubmit)}
        style={styles.button}
      >
        Login
      </Button>
      <Button onPress={() => router.push("/(auth)/register")}>
        Go to Register
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: "center" },
  input: { marginBottom: 8 },
  title: { marginBottom: 16, textAlign: "center" },
  error: { color: "red", marginBottom: 8 },
  button: { marginVertical: 8 },
});
