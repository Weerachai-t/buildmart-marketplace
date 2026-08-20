import Header from "@/components/header";
import Footer from "@/components/footer";
import { getActiveProductBySlug } from "@/lib/catalog";
import ProductClient from "./product-client";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getActiveProductBySlug(slug);
  if (!product) notFound();
  return <><Header/><main className="container section"><p style={{fontSize:10}}><a href="/">หน้าหลัก</a> › <a href="/products">สินค้า</a> › {product.name}</p><ProductClient p={product}/></main><Footer/></>;
}
