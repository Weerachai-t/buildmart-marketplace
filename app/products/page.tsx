import Header from "@/components/header";
import Footer from "@/components/footer";
import { getActiveCategories, getActiveProducts } from "@/lib/catalog";
import ProductsClient from "./products-client";

export const dynamic = "force-dynamic";

export default async function Products() {
  const [products, categories] = await Promise.all([getActiveProducts(), getActiveCategories()]);
  return <><Header/><main className="container section"><div className="section-head"><div><span className="eyebrow" style={{color:"#0b4ea2"}}>PRODUCT CATALOG</span><h2>วัสดุก่อสร้างทั้งหมด</h2><p>{products.length} รายการ จากซัพพลายเออร์ที่ผ่านการตรวจสอบ</p></div><a className="btn orange" href="/quotation">ขอราคางานโครงการ</a></div><ProductsClient products={products} categories={categories}/></main><Footer/></>;
}
