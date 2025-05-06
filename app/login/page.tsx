import { Metadata } from "next";
import { Suspense } from "react";
import LoginForm from "@/app/ui/login-form";
import { CardSkeleton } from "../ui/skeletons";

export const metadata: Metadata = {
  title: "Login",
};

export default async function Page() {
  return (
    <Suspense fallback={<CardSkeleton />}>
      <LoginForm />
    </Suspense>
  );
}
