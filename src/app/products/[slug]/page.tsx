import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProductDetail } from '@/components/product/ProductDetail';
import { getProductBySlug, products } from '@/lib/data';

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  return products.map((product) => ({
    slug: product.slug,
  }));
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    return {
      title: 'Product Not Found — Soghat-e-Chakwal',
    };
  }

  const primaryVariant = product.variants[0];

  return {
    title: `${product.name} — Soghat-e-Chakwal`,
    description: product.shortDescription,
    openGraph: {
      title: `${product.name} — Soghat-e-Chakwal`,
      description: product.shortDescription,
      type: 'website',
      images: [
        {
          url: product.images[0]?.src || '/images/hero-bg.jpg',
          width: 800,
          height: 1000,
          alt: product.name,
        },
      ],
    },
    other: {
      'product:price:amount': primaryVariant ? primaryVariant.price.toString() : '750',
      'product:price:currency': 'PKR',
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  // Schema.org structured data for e-commerce SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    brand: {
      '@type': 'Brand',
      name: 'Soghat-e-Chakwal',
    },
    offers: product.variants.map((variant) => ({
      '@type': 'Offer',
      price: variant.price,
      priceCurrency: 'PKR',
      availability: variant.inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      sku: variant.sku,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetail product={product} />
    </>
  );
}
