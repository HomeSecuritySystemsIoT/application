"use client"

import * as React from "react"
import Form from "next/form"
import Link from "next/link"
import { login, type LoginFormState } from "@/app/auth/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"

const initialState: LoginFormState = {
  values: { email: "", password: "" },
  errors: null,
}

export default function LoginPage() {
  const [state, formAction, isPending] = React.useActionState(
    login,
    initialState
  )

  return (
    <div className="flex min-h-svh items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>
            Enter your credentials to access your account.
          </CardDescription>
        </CardHeader>

        <Form action={formAction}>
          <CardContent>
            <FieldGroup>
              <Field data-invalid={!!state.errors?.email}>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  defaultValue={state.values.email}
                  required
                  autoComplete="email"
                  aria-invalid={!!state.errors?.email}
                />
                {state.errors?.email && (
                  <FieldError>{state.errors.email[0]}</FieldError>
                )}
              </Field>

              <Field data-invalid={!!state.errors?.password}>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  aria-invalid={!!state.errors?.password}
                />
                {state.errors?.password && (
                  <FieldError>{state.errors.password[0]}</FieldError>
                )}
              </Field>
            </FieldGroup>
          </CardContent>

          <Separator className="mt-6" />
          <div className="flex flex-col gap-3 p-6">
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Signing in…" : "Sign in"}
            </Button>
            <p className="text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link
                href="/auth/signup"
                className="text-foreground underline underline-offset-4"
              >
                Sign up
              </Link>
            </p>
          </div>
        </Form>
      </Card>
    </div>
  )
}
