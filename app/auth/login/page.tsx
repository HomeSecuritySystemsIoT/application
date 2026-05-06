"use client"

import * as React from "react"
import Form from "next/form"
import Link from "next/link"
import { Shield } from "lucide-react"
import { login, type LoginFormState } from "@/app/auth/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"

const initialState: LoginFormState = { values: { email: "", password: "" }, errors: null }

export default function LoginPage() {
  const [state, formAction, isPending] = React.useActionState(login, initialState)

  return (
    <div className="flex min-h-svh items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm animate-fade-up">
        <div className="flex items-center gap-2.5 mb-8">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Shield className="size-4.5" />
          </div>
          <span className="font-semibold text-base tracking-tight">OpenCam</span>
        </div>
        <div className="bg-card rounded-2xl border border-border shadow-sm p-8">
          <h1 className="text-xl font-semibold tracking-tight mb-1">Sign in</h1>
          <p className="text-sm text-muted-foreground mb-7">Access your security dashboard.</p>
          <Form action={formAction}>
            <FieldGroup>
              <Field data-invalid={!!state.errors?.email}>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input id="email" name="email" type="email" placeholder="you@example.com"
                  defaultValue={state.values.email} required autoComplete="email"
                  aria-invalid={!!state.errors?.email} />
                {state.errors?.email && <FieldError>{state.errors.email[0]}</FieldError>}
              </Field>
              <Field data-invalid={!!state.errors?.password}>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input id="password" name="password" type="password" placeholder="••••••••"
                  required autoComplete="current-password" aria-invalid={!!state.errors?.password} />
                {state.errors?.password && <FieldError>{state.errors.password[0]}</FieldError>}
              </Field>
            </FieldGroup>
            <Button type="submit" className="w-full mt-6" disabled={isPending}>
              {isPending ? "Signing in…" : "Sign in"}
            </Button>
          </Form>
        </div>
        <p className="text-center text-sm text-muted-foreground mt-5">
          Don&apos;t have an account?{" "}
          <Link href="/auth/signup" className="text-primary font-medium hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  )
}
