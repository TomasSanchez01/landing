import { notFound } from "next/navigation";
import { getHiddenPageById } from "@/lib/hidden-pages";
import { PageForm } from "../page-form";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditHiddenPage({ params }: Props) {
  const { id } = await params;
  const page = await getHiddenPageById(id);

  if (!page) {
    notFound();
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-bold">Editar {page.name}</h1>
      <PageForm page={page} />
    </div>
  );
}
