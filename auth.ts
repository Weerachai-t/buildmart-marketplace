import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import {PrismaAdapter} from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import {z} from "zod";
import {prisma} from "@/lib/prisma";
export const {handlers,auth,signIn,signOut}=NextAuth({adapter:PrismaAdapter(prisma),session:{strategy:"jwt"},providers:[Google,Credentials({credentials:{email:{label:"Email",type:"email"},password:{label:"Password",type:"password"}},authorize:async(raw)=>{const parsed=z.object({email:z.string().email(),password:z.string().min(8)}).safeParse(raw);if(!parsed.success)return null;const user=await prisma.user.findUnique({where:{email:parsed.data.email}});if(!user?.passwordHash||!(await bcrypt.compare(parsed.data.password,user.passwordHash)))return null;return {id:user.id,email:user.email,name:user.name};}})],callbacks:{jwt:async({token,user})=>{if(user)token.userId=user.id;return token;},session:async({session,token})=>{if(session.user)session.user.id=String(token.userId??token.sub);return session;}}});
