import React from 'react';
import * as Realm from 'realm-web';
import { Login, Main } from './pages';
import { app } from './utils';

function App() {
    const [user, setUser] = React.useState<Realm.User | null>(app.currentUser);

    return <>{user ? <Main user={user} setUser={setUser} /> : <Login setUser={setUser} />}</>;
}

export default App;
