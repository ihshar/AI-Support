import { openrouter } from "@/lib/openrouter";
import { Message } from "@/types/chat";

export async function POST(req:Request){

    try{
        const body = await req.json()
        const messages = body.messages.map((message:Message)=>({
            role:message.role,
            content:message.content
        }))

        const MODEL = "openai/gpt-4o-mini"
        // console.log("messages",messages);
        const completion = await openrouter.chat.completions.create({
            model: MODEL,
            messages,
            stream: true
        })
    
        const encoder = new TextEncoder()

        const stream = new ReadableStream({
            async start(controller) {
                for await (const chunk of completion) {
                    const content =
                        chunk.choices?.[0]?.delta?.content

                    if (content) {
                        controller.enqueue(
                            encoder.encode(content)
                        )
                    }
                }

                controller.close()
            }
        })

        return new Response(stream)
    }
    catch(error){
        console.error(error)
    }

}