import Header from "@/components/header";import Footer from "@/components/footer";import CartClient from "./cart-client";import { getActiveProducts } from "@/lib/catalog";
export const dynamic = "force-dynamic";
export default async function Cart(){const products=await getActiveProducts();return <><Header/><main className="container section"><h1>ตะกร้าสินค้า</h1><CartClient products={products}/></main><Footer/></>}
