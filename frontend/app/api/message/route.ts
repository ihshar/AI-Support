import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req:Request){
    const body = await req.json()
    const message = await prisma.message.create({
        data:{
            content:body.content,
            role:body.role,
            conversationId:body.conversationId
        }
    })

    return NextResponse.json(message);
}

export async function DELETE(req:Request){
  const {searchParams} = new URL(req.url)

  const conversationId = searchParams.get("conversationId")
  
  if(!conversationId){
    return Response.json({error:"Conversation ID is required"},{status:400})
  }

  await prisma.message.deleteMany({
    where:{
        conversationId,
    }
  })

  return Response.json({success:true})
}