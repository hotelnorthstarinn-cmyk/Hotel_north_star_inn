import { LoginForm } from "@/components/admin/LoginForm"

export const metadata = {
  title: "Admin Login | Hotel North Star Inn",
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <LoginForm />
    </div>
  )
}
