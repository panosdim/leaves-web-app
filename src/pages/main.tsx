import * as React from 'react';
import * as Realm from 'realm-web';
import { Header, Leaves } from '../components';

type MainProps = {
    user: Realm.User;
    setUser: (user: Realm.User | null) => void;
};
export const Main = ({ user, setUser }: MainProps) => {
    return (
        <>
            <Header user={user} setUser={setUser} />
            <Leaves user={user} />
        </>
    );
};
