import { DATAMODELLER, getDatamodellBySlug } from '@/lib/datamodeller';
import DatamodellClient from './DatamodellClient';

// Statisk eksport: bare de kjente datamodellene bygges som ruter.
export const dynamicParams = false;

export function generateStaticParams() {
  return DATAMODELLER.map((d) => ({ slug: d.slug }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const dm = getDatamodellBySlug(slug);
  if (!dm) return null;
  return <DatamodellClient id={dm.id} navn={dm.navn} />;
}
