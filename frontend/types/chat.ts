export type Message = {
    id:string,
    role: "user" | "assistant",
    content:string
    createdAt:string
}

export type ChatPropMessage = {
    messages:Message[]
    loading:boolean
}


export type ChatInputProps = {
    handleSend:()=>void,
    input:string,
    setInput:Function
    handleClear:()=>void
    newChat:()=>void
}

export type Conversation = {
    id:string,
    title:string,
    messages:Message[]
}

export type APIResponse = {
    message: string,
    conversationLength:string
}

export type ConversationListProps = {
    currentConversationId:string,
    conversations:Conversation[],
    setCurrentConversationId:(id:string)=>void,
    setConversations:Function,
    newChat:()=>void
}