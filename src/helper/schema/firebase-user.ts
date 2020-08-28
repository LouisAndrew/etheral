export type InCart = {
    pid: string;
    amount: number;
};

export type Order = {
    oid: string;
    date: Date;
};

export interface FirebaseUserData {
    name: string;
    email: string;
    inCart: InCart[];
    orders: Order[];
}