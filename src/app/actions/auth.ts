"use server"

import { authClient } from "@/lib/auth-client"
import { isValidNif } from "@/lib/validations"

// Server Action State Types
export type LoginState = {
  error?: string
  success?: boolean
}

export type RegisterState = {
  errors?: {
    name?: string
    email?: string
    password?: string
    nif?: string
    form?: string
  }
  success?: boolean
  role?: "manager" | "resident"
}

// Login Server Action
export async function loginAction(
  prevState: LoginState | null,
  formData: FormData
): Promise<LoginState> {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  // Validation
  if (!email || !password) {
    return { error: "Email e palavra-passe são obrigatórios" }
  }

  try {
    const result = await authClient.signIn.email({
      email,
      password,
    })

    if (result.error) {
      return { error: result.error.message || "Credenciais inválidas" }
    }

    // Success - redirect will happen in the component
    return { success: true }
  } catch (err) {
    return { error: "Ocorreu um erro" }
  }
}

// Register Server Action
export async function registerAction(
  prevState: RegisterState | null,
  formData: FormData
): Promise<RegisterState> {
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const nif = formData.get("nif") as string
  const role = formData.get("role") as "manager" | "resident"

  const errors: RegisterState["errors"] = {}

  // Validation
  if (!name?.trim()) {
    errors.name = "Nome é obrigatório"
  }

  if (!email?.trim()) {
    errors.email = "Email é obrigatório"
  }

  if (!password) {
    errors.password = "Palavra-passe é obrigatória"
  } else {
    // Password validation
    if (password.length < 8) {
      errors.password = "Mínimo 8 caracteres"
    } else if (!/[A-Z]/.test(password)) {
      errors.password = "Pelo menos uma letra maiúscula"
    } else if (!/[a-z]/.test(password)) {
      errors.password = "Pelo menos uma letra minúscula"
    } else if (!/\d/.test(password)) {
      errors.password = "Pelo menos um número"
    }
  }

  if (!isValidNif(nif)) {
    errors.nif = "NIF inválido"
  }

  if (Object.keys(errors).length > 0) {
    return { errors }
  }

  try {
    const result = await authClient.signUp.email({
      email,
      password,
      name,
      role,
      nif,
    } as Parameters<typeof authClient.signUp.email>[0] & { role: string; nif: string })

    if (result.error) {
      return {
        errors: {
          form: result.error.message || "Ocorreu um erro ao criar conta",
        },
      }
    }

    // Success - redirect will happen in the component based on role
    return { success: true, role }
  } catch (err) {
    return {
      errors: {
        form: "Ocorreu um erro inesperado",
      },
    }
  }
}
