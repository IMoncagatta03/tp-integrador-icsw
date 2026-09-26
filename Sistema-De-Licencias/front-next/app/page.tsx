import { redirect } from "next/navigation";

// Redirigir al panel de control por defecto
export default function RootPage() {
  redirect("/dashboard");
}
