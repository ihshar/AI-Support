import { openrouter } from "@/lib/openrouter";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(){
    const conversation = await prisma.conversation.findMany(
        {
            include:{
                messages:true
            }
        }
    )

    return NextResponse.json(conversation)
}

export async function POST() {
  const conversation =
    await prisma.conversation.create({
      data: {
        title: "New Chat"
      }
    });

  return NextResponse.json(conversation);
}


export async function DELETE(req:Request){
  const {searchParams} = new URL(req.url)
  const id = searchParams.get("id")

  if(!id){
    return Response.json(
      {error:"Converation ID required"},
      {status:400}
    )
  }
  await prisma.conversation.delete({
    where:{
      id,
    }
  })
  return Response.json({
    success:true,
  })
}

export async function PUT(req:Request){
  const body = await req.json()

  const updateConversation = await prisma.conversation.update({
    where:{
      id:body.id
    },
    data:{
      title:body.title
    },
  })

  return NextResponse.json(updateConversation)
}
