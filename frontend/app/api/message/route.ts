import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req:Request){
    const {userId} = await auth();

    if(!userId){
      return NextResponse.json({error:"Unauthorized Access"},{status:401})
    }

    const body = await req.json()


    const {content,role,conversationId} = body

    const conversation = await prisma.conversation.findUnique({
      where:{
        id:conversationId,
      }
    })

    if(!conversation){
      return NextResponse.json({
        error:"Conversation Not found"
      },{
        status:404
      })
    }
    
    if(userId !== conversation.userId){
      return NextResponse.json({
        error:"Unauthorized Access"
      },{
        status:401
      })
    }

    const message = await prisma.message.create({
        data:{
            content,
            role,
            conversationId
        }
    })

    return NextResponse.json(message);
}

export async function DELETE(req:Request){
  const {userId} = await auth()
  const {searchParams} = new URL(req.url)

  if(!userId){
    return NextResponse.json({error:"Unauthorized Access"},{status:401})
  }

  const conversationId = searchParams.get("conversationId")

  if(!conversationId){
    return Response.json({error:"Conversation ID is required"},{status:400})
  }

  const conversation = await prisma.conversation.findUnique({
    where:{
      id:conversationId
    }
  })

  if(!conversation){
    return NextResponse.json({error:"Conversation not found"},{status:404})
  }

  if(userId !== conversation?.userId){
    return NextResponse.json({error:"Forbidden"},{status:403})
  }

  await prisma.message.deleteMany({
    where:{
        conversationId,
    }
  })

  return Response.json({success:true})
}