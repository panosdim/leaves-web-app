import * as Realm from "realm-web";

const APP_ID = process.env.REACT_APP_MONGODB_APP_ID || '';

const app = new Realm.App({ id: APP_ID });

export { app };

