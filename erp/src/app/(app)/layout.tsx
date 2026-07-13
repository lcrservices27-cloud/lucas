import { requireUser, PAPEL_LABEL } from "@/lib/auth";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const usuario = await requireUser();

  return (
    <div className="flex h-screen overflow-hidden bg-muted/20">
      <Sidebar className="hidden md:flex" />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          user={{
            nome: usuario.nome,
            email: usuario.email,
            papel: PAPEL_LABEL[usuario.papel] ?? usuario.papel,
            avatarUrl: usuario.avatarUrl,
          }}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
