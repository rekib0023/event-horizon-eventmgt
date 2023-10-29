import { connect, NatsConnection, StringCodec, Subscription } from "nats";

class NatsWrapper {
  private _client?: NatsConnection;

  get client() {
    if (!this._client) {
      throw new Error("Cannot access NATS client before connecting.");
    }
    return this._client;
  }

  async connect(url: string) {
    this._client = await connect({
      servers: url,
    });
    console.log(`Connected to NATS at ${url}`);
  }

  async disconnect() {
    await this.client.drain();
    console.log("Disconnected from NATS");
  }

  publish(subject: string, data: any) {
    try {
      const sc = StringCodec();
      this.client.publish(subject, sc.encode(JSON.stringify(data)));
    } catch (error) {
      console.log(error);
    }
  }

  subscribe(subject: string, callback: (msg: any) => void): Subscription {
    const sc = StringCodec();
    const sub = this.client.subscribe(subject);
    (async () => {
      for await (const msg of sub) {
        const data = JSON.parse(sc.decode(msg.data));
        callback(data);
      }
    })();
    return sub;
  }
}

const natsWrapper = new NatsWrapper();
export { natsWrapper };
