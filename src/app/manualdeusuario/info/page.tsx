import Image from "next/image";
import { notFound } from "next/navigation";
import { getSiteSettings } from "@/lib/settings";
import { getManualContent } from "@/lib/manual";

export const metadata = {
  title: "Manual de Usuario | Capocannoniere",
};

export default async function ManualDeUsuarioPage() {
  const [settings, content] = await Promise.all([getSiteSettings(), getManualContent()]);

  if (!settings.manualUsuarioEnabled) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      <h1 className="text-2xl sm:text-3xl font-bold">Manual de Usuario</h1>

      {content.intro && (
        <p className="mt-4 text-muted-foreground leading-relaxed">{content.intro}</p>
      )}

      <div className="mt-10 space-y-10">
        {content.sections.map((section) => (
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
