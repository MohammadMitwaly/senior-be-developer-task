// This is a "quick and dirty" solution, I skipped utilizing the workerId, finished this within the first 30 minutes of looking at the code.
import {  Message } from "./Database";

export class Queue {
    private messages: Message[]
    // Keeping track of the keys that we are currently processing
    private occupiedKeys: Set<string>
    // We need to keep track of the key that each message is associated with on dequeue and confirm
    private messageIdKeyMap: Map<string, string>

    constructor() {
        this.messages = []
        this.occupiedKeys = new Set()
        this.messageIdKeyMap = new Map()
    }

    Enqueue = (message: Message) => {
        this.messages.push(message)
    }

    Dequeue = (_workerId: number): Message | undefined => {
        for (let i = 0; i < this.messages.length; i++) {
            const message = this.messages[i]
            if (!this.occupiedKeys.has(message.key)) {
                this.messages.splice(i, 1)
                this.occupiedKeys.add(message.key)
                this.messageIdKeyMap.set(message.id, message.key)
                return message
            }
        }
        return undefined
    }

    Confirm = (_workerId: number, messageId: string) => {
        const key = this.messageIdKeyMap.get(messageId)
        if (key) {
            this.occupiedKeys.delete(key)
            this.messageIdKeyMap.delete(messageId)
        }
    }

    Size = () => {
        return this.messages.length
    }
}

