## Hello👋🏽

My understanding of the problem is that there's a race condition within `Queue.ts` in the default implementation.
- One worker, call it: `Worker1` starts processing a message, it adds a value to it and saves it, at the same time, another worker, let's call it `Worker2` is handling that same message but it started doing so slightly after `Worker1`, so it adds a value(the number from 1 to 9) but when it saves, it saves over the value that `Worker1` had set, override it and removing `Worker1`'s progress

My initial fix:
- What we basically needed was an implementation of a locking mechanism, my initial thoughts and soltuion can be found in `Queue_no_worker_id.ts`, there you can see:
    - I added a `occupiedKeys` set that we check whenever we're trying to removing something from the queue to process it
    - And a `messageIdKeyMap` map to have a refrence for the ID that we save back to the actual key since "Confrim" uses the ID 
    - And added a quick implementation of the "confirm" method where we "release" the key once we finish processing it
This makes sure that no 2 workers are processing the same key in parallel


The more complete fix:
- In the actual `Queue.ts` I have the cleaner approach, where it is the same concept as the first fix, but we utilize the `workerId` when saving the messages currently being process, so that in the "Confirm" flow we can validate if the current `workerN` attempting to relase the lock is authorized to do so

- An even more complete fix would probably maintain two maps an a First-In-First-Out that is per key, something like this, but I did not want to over engineer so adding it here in gist:
```ts
export class Queue {
    private messages: Message[] = [];
    private messageOwnerMap: Map<string, number> = new Map();
    private beingProccessed: Map<string, InFlight> = new Map();

    Enqueue = (message: Message) => {
        this.messages.push(message);
    };

    Dequeue = (workerId: number): Message | undefined => {
        for (let i = 0; i < this.messages.length; i++) {
            const msg = this.messages[i];
            if (!this.messageOwnerMap.has(msg.key)) {
                this.messages.splice(i, 1);
                this.messageOwnerMap.set(msg.key, workerId);
                this.beingProccessed.set(msg.id, { message: msg, workerId });
                return msg;
            }
        }
        return undefined;
    };

    Confirm = (workerId: number, messageId: string) => {
        const key = currentMsg.message.key;
        if (this.messageOwnerMap.get(key) === workerId) {
            this.messageOwnerMap.delete(key);
        }
        this.beingProccessed.delete(messageId);
    };
}
```

---

## Some suggestions for improvements:
- I think part of the challenge here is that I should be seasoned enough to config the server to run it, which is fair and explains why the `package.json` and `tsconfig.ts` files are absent, but for the sake of completeness my first suggestion would be to add them by default so that we can get up and running quicker. (That of course includes the `.gitignore` which we'll need before committing and pushing)

- Using UUID for the message IDs would be a lot better than just `math.random` but since this is a "toy" example, I get why it was choosen, or maybe it's a honeypot that you want the candadiate to catch(similar to the empty `confirm` method in Queue, nice hint BTW ;)) 

- In terms of the queue system, we can add a retry mechanism for the workers, so that they can catch a message as soon as one is available
    - So instead of breaking/sleeping as we do now, when returning `undefined` in Queue, we can add an async "nextAvailble" that would resolve when a message is ready, or the queue is fully processed

- Semantic and "nitpicky" suggestions:
    - The naming scheme if we are being pedantic in the Queue service should follow convention, so `enqueue`, `dequeue`, `confirm`, and not `Enqueue` etc..
    - Using readonly
