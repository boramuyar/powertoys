export interface Subscriber<T> {
  next: (value: T) => void;
  error?: (error: any) => void;
  complete?: () => void;
}

export class Observable<T> {
  private subscribers: Subscriber<T>[] = [];

  subscribe(subscriber: Subscriber<T>): () => void {
    this.subscribers.push(subscriber);

    // Return unsubscribe function
    return () => {
      const index = this.subscribers.indexOf(subscriber);
      if (index !== -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  next(value: T): void {
    this.subscribers.forEach(subscriber => {
      try {
        subscriber.next(value);
      } catch (err) {
        if (subscriber.error) {
          subscriber.error(err);
        } else {
          console.error("Unhandled error in subscriber:", err);
        }
      }
    });
  }

  error(err: any): void {
    this.subscribers.forEach(subscriber => {
      if (subscriber.error) {
        subscriber.error(err);
      }
    });
  }

  complete(): void {
    this.subscribers.forEach(subscriber => {
      if (subscriber.complete) {
        subscriber.complete();
      }
    });
    this.subscribers = [];
  }
}
