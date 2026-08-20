export type Role="SUPER_ADMIN"|"CATEGORY_MANAGER"|"SALES_ADMIN"|"SUPPLIER"|"CUSTOMER"|"LOGISTICS_PARTNER";
export type Product={id:string;slug:string;name:string;category:string;brand:string;unit:string;price:number;oldPrice:number;stock:number;rating:number;image:string;badges:string[];specs:Record<string,string>};
