"use client"

import * as React from "react"
import Form from "next/form"
import Link from "next/link"
import { signup, type SignupFormState } from "@/app/auth/actions"
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
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"

const initialState: SignupFormState = {
  values: { email: "", password: "" },
  errors: null,
}

export default function SignupPage() {
  const [state, formAction, isPending] = React.useActionState(signup, initialState)

  return (
    <div className="flex min-h-svh items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Create an account</CardTitle>
          <CardDescription>Enter your details to get started.</CardDescription>
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
                  autoComplete="new-password"
                  minLength={8}
                  aria-invalid={!!state.errors?.password}
                />
                <FieldDescription>At least 8 characters.</FieldDescription>
                {state.errors?.password && (
                  <FieldError>{state.errors.password[0]}</FieldError>
                )}
              </Field>
            </FieldGroup>
          </CardContent>

          <Separator className="mt-6 w-11/12" />
          <div className="flex flex-col gap-3 p-6">
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Creating account…" : "Create account"}
            </Button>
            <p className="text-muted-foreground text-sm">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-foreground underline underline-offset-4">
                Sign in
              </Link>
            </p>
          </div>
        </Form>
      </Card>
    </div>
  )
}
