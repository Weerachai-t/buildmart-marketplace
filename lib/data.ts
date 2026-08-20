import type {Product} from "./types";
export const categories=["ปูนซีเมนต์","คอนกรีตผสมเสร็จ","เหล็ก","หลังคา","สี","กระเบื้อง","อุปกรณ์ไฟฟ้า","ประปา"];
export const products:Product[]=[
{id:"1",slug:"portland-cement-50kg",name:"ปูนซีเมนต์ปอร์ตแลนด์ 50 กก.",category:"ปูนซีเมนต์",brand:"SCG",unit:"ถุง",price:145,oldPrice:155,stock:2400,rating:4.9,image:"▰",badges:["ขายดี","ส่งทั่วไทย"],specs:{ประเภท:"ปอร์ตแลนด์ประเภท 1",น้ำหนัก:"50 กก.",มาตรฐาน:"มอก. 15"}},
{id:"2",slug:"ready-mix-280ksc",name:"คอนกรีตผสมเสร็จ 280 KSC",category:"คอนกรีตผสมเสร็จ",brand:"BUILD MIX",unit:"คิว",price:2150,oldPrice:2300,stock:120,rating:4.8,image:"▦",badges:["ราคาหน้างาน"],specs:{กำลังอัด:"280 KSC",Slump:"10 ± 2.5 ซม.",ขั้นต่ำ:"5 คิว"}},
{id:"3",slug:"deformed-bar-12mm",name:"เหล็กข้ออ้อย SD40 DB12",category:"เหล็ก",brand:"TATA",unit:"เส้น",price:192,oldPrice:205,stock:8500,rating:4.7,image:"═",badges:["ราคาส่ง"],specs:{เกรด:"SD40",ขนาด:"12 มม.",ความยาว:"10 เมตร"}},
{id:"4",slug:"roof-tile-prestige",name:"กระเบื้องหลังคา Prestige",category:"หลังคา",brand:"Diamond",unit:"แผ่น",price:68,oldPrice:75,stock:5400,rating:4.8,image:"⌂",badges:["สีใหม่"],specs:{ขนาด:"33 × 42 ซม.",สี:"เทาโมเดิร์น",จำนวนใช้:"10–11 แผ่น/ตร.ม."}},
{id:"5",slug:"interior-paint-9l",name:"สีน้ำอะคริลิกภายใน 9 ลิตร",category:"สี",brand:"TOA",unit:"ถัง",price:1290,oldPrice:1450,stock:390,rating:4.9,image:"◉",badges:["ลดพิเศษ"],specs:{ชนิด:"สีน้ำอะคริลิก",ขนาด:"9 ลิตร",พื้นที่:"35–40 ตร.ม./เที่ยว"}},
{id:"6",slug:"porcelain-tile-60",name:"กระเบื้องพอร์ซเลน 60×60 ซม.",category:"กระเบื้อง",brand:"COTTO",unit:"กล่อง",price:699,oldPrice:790,stock:720,rating:4.7,image:"▦",badges:["โครงการนิยม"],specs:{ขนาด:"60 × 60 ซม.",ผิว:"ด้าน",บรรจุ:"4 แผ่น/กล่อง"}}
];
export const priceFor=(p:Product,qty:number)=>qty>=200?p.price*.9:qty>=50?p.price*.95:p.price;
