import Image from "next/image";
import { notFound } from "next/navigation";
import { getHiddenPageBySlug } from "@/lib/hidden-pages";

interface HiddenPagePageProps {
  params: Promise<{ slug: string[] }>;
}

export async function generateMetadata({ params }: HiddenPagePageProps) {
  const { slug } = await params;
  const page = await getHiddenPageBySlug(slug.join("/"));

  if (!page || !page.enabled) {
    return { title: "Página no encontrada" };
  }

  return {
    title: `${page.title} | Capocannoniere`,
    robots: { index: false, follow: false },
  };
}

export default async function HiddenSlugPage({ params }: HiddenPagePageProps) {
  const { slug } = await params;
  const page = await getHiddenPageBySlug(slug.join("/"));

  if (!page || !page.enabled) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      <h1 className="text-2xl sm:text-3xl font-bold">{page.title}</h1>

      {page.intro && <p className="mt-4 text-muted-foreground leading-relaxed">{page.intro}</p>}

      <div className="mt-10 space-y-10">
        {page.sections.map((section) => (
          <section key={section.id} className="space-y-3">
            {section.title && (
              <h2 className="text-lg sm:text-xl font-semibold">{section.title}</h2>
            )}

            {section.image && (
              <div className="relative w-full max-w-md aspect-video rounded-lg overflow-hidden border border-border/50 bg-secondary/20">
                <Image src={section.image} alt={section.title} fill className="object-contain" />
              </div>
            )}

            {section.body.split(/\n\s*\n/).map((paragraph, i) => (
              <p key={i} className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                {paragraph}
              </p>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}
