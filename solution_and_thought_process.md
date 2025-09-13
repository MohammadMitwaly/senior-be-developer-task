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

---

## Some suggestions for improvements:
- I think part of the challenge here is that I should be seasoned enough to config the server to run it, which is fair and explains why the `package.json` and `tsconfig.ts` files are absent, but for the sake of completeness my first suggestion would be to add them by default so that we can get up and running quicker. (That of course includes the `.gitignore` which we'll need before committing and pushing)

