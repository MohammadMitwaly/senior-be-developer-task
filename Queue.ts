import {  Message } from "./Database";

export class Queue {
    private messages: Message[]
    // Keeping track of the keys that we are currently processing
    private occupiedKeys: Set<string>
    // We need to keep track of the key that each message is associated with on dequeue and confirm
    private currentlyBeingProcessed: Map<string, { workerId: number; key: string }>

    constructor() {
        this.messages = []
        this.occupiedKeys = new Set()
        this.currentlyBeingProcessed = new Map()
    }

    Enqueue = (message: Message) => {
        this.messages.push(message)
    }

    Dequeue = (workerId: number): Message | undefined => {
        for (let i = 0; i < this.messages.length; i++) {
            const message = this.messages[i];
            if (!this.occupiedKeys.has(message.key)) {
                this.occupiedKeys.add(message.key);
                this.currentlyBeingProcessed.set(message.id, { workerId, key: message.key });
                this.messages.splice(i, 1);
                
                return message;
            }
        }
        console.log("No free messages found");
        return undefined;
    }

    Confirm = (workerId: number, messageId: string) => {
        const info = this.currentlyBeingProcessed.get(messageId);
        
        // These are overkill but are good design practices
        if (!info) {
            console.log("Message not being processed");
            return;
        }
        if (info.workerId !== workerId) {
            console.log("Worker mot authorized to confirme");
            return;
        }
        this.currentlyBeingProcessed.delete(messageId);
        this.occupiedKeys.delete(info.key);
    }

    Size = () => {
        const size = this.messages.length + this.currentlyBeingProcessed.size;
        return size;
    }
}

